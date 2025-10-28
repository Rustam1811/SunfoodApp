import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { Request, Response } from 'express';
import cors from "cors";
import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const corsHandler = cors({ origin: true });

// Инициализация Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Получение бонусов пользователя
 */
export const userBonus = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { userId } = req.query;
      if (!userId) {
        res.status(400).json({ error: "userId обязателен" });
        return;
      }

      // Получаем последний бонус пользователя
      const bonusSnapshot = await db
        .collection("bonusHistory")
        .where("userId", "==", userId)
        .orderBy("date", "desc")
        .limit(1)
        .get();

      let currentBonus = 0;
      if (!bonusSnapshot.empty) {
        const latestBonus = bonusSnapshot.docs[0].data() as any;
        currentBonus = latestBonus.bonus || 0;
      }

      res.json({ bonus: currentBonus, userId });
      return;
    } catch (error) {
      console.error("Ошибка получения бонусов:", error);
      res.status(500).json({ error: "Ошибка сервера" });
      return;
    }
  });
});

/**
 * Начисление бонусов за заказ
 */
export const earnBonus = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Только POST запросы" });
        return;
      }
      const { userId, orderAmount, orderId } = req.body || {};
      if (!userId || !orderAmount || !orderId) {
        res.status(400).json({ error: "userId, orderAmount и orderId обязательны" });
        return;
      }
      const settingsDoc = await db.collection("settings").doc("bonus").get();
      let bonusPercentage = 5;
      if (settingsDoc.exists) {
        const settings = settingsDoc.data() as any;
        bonusPercentage = settings?.percentage || 5;
      }
      const earnedBonus = Math.floor(orderAmount * bonusPercentage / 100);
      const bonusSnapshot = await db
        .collection("bonusHistory")
        .where("userId", "==", userId)
        .orderBy("date", "desc")
        .limit(1)
        .get();
      let currentBonus = 0;
      if (!bonusSnapshot.empty) {
        const latestBonus = bonusSnapshot.docs[0].data() as any;
        currentBonus = latestBonus.bonus || 0;
      }
      const newBonus = currentBonus + earnedBonus;
      await db.collection("bonusHistory").add({
        userId,
        type: "earned",
        amount: earnedBonus,
        bonus: newBonus,
        orderId,
        orderAmount,
        date: admin.firestore.Timestamp.now(),
        description: `Начислено за заказ №${orderId}`
      });
      await db.collection("orders").doc(orderId).update({ bonusEarned: earnedBonus });
      res.json({ success: true, earnedBonus, totalBonus: newBonus, percentage: bonusPercentage });
      return;
    } catch (error) {
      console.error("Ошибка начисления бонусов:", error);
      res.status(500).json({ error: "Ошибка сервера" });
      return;
    }
  });
});

/**
 * Списание бонусов при оплате
 */
export const useBonus = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Только POST запросы" });
        return;
      }
      const { userId, usedBonus, orderId } = req.body || {};
      if (!userId || !usedBonus || !orderId) {
        res.status(400).json({ error: "userId, usedBonus и orderId обязательны" });
        return;
      }
      const bonusSnapshot = await db
        .collection("bonusHistory")
        .where("userId", "==", userId)
        .orderBy("date", "desc")
        .limit(1)
        .get();
      let currentBonus = 0;
      if (!bonusSnapshot.empty) {
        const latestBonus = bonusSnapshot.docs[0].data() as any;
        currentBonus = latestBonus.bonus || 0;
      }
      if (currentBonus < usedBonus) {
        res.status(400).json({ error: "Недостаточно бонусов", available: currentBonus, requested: usedBonus });
        return;
      }
      const newBonus = currentBonus - usedBonus;
      await db.collection("bonusHistory").add({
        userId,
        type: "used",
        amount: usedBonus,
        bonus: newBonus,
        orderId,
        date: admin.firestore.Timestamp.now(),
        description: `Списано за заказ №${orderId}`
      });
      await db.collection("orders").doc(orderId).update({ bonusUsed: usedBonus });
      res.json({ success: true, usedBonus, remainingBonus: newBonus });
      return;
    } catch (error) {
      console.error("Ошибка списания бонусов:", error);
      res.status(500).json({ error: "Ошибка сервера" });
      return;
    }
  });
});


// Old 1st Gen 'orders' function removed - use /api/orders in app function

/**
 * Настройки бонусной системы
 */
export const bonusSettings = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method === "GET") {
        const settingsDoc = await db.collection("settings").doc("bonus").get();
        
        if (settingsDoc.exists) {
          res.json(settingsDoc.data());
        } else {
          // Настройки по умолчанию
          const defaultSettings = {
            percentage: 5,
            maxBonus: 1000,
            minOrderAmount: 100
          };
          res.json(defaultSettings);
        }
      }

      if (req.method === "POST") {
        const { percentage, maxBonus, minOrderAmount } = req.body;
        
        await db.collection("settings").doc("bonus").set({
          percentage: percentage || 5,
          maxBonus: maxBonus || 1000,
          minOrderAmount: minOrderAmount || 100,
          updatedAt: admin.firestore.Timestamp.now()
        });

        res.json({ success: true });
      }

    } catch (error) {
      console.error("Ошибка в bonusSettings:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
});

/**
 * Stories CRUD + view endpoints (prod)
 * - GET    /stories                 -> list
 * - POST   /stories                 -> create
 * - PUT    /stories/:id             -> update
 * - DELETE /stories/:id             -> delete
 * - POST   /stories/:id/view        -> record view
 */
export const stories = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const method = req.method.toUpperCase();
      const subPath = req.path || "/"; // "/" or "/:id" or "/:id/view"
      const parts = subPath.split("/").filter(Boolean); // [id] or [id,'view']

      if (method === "GET" && parts.length === 0) {
        const snap = await db.collection("stories").orderBy("createdAt", "desc").get();
        const items = snap.docs.map(doc => {
          const d = doc.data() as any;
            const createdAtIso = d.createdAt?.toDate?.()?.toISOString() || new Date().toISOString();
            const publishAtIso = d.publishAt?.toDate?.()?.toISOString() || createdAtIso;
            const expiresAtIso = d.expiresAt?.toDate?.()?.toISOString() || new Date(new Date(publishAtIso).getTime() + 24 * 60 * 60 * 1000).toISOString();
            return { id: doc.id, ...d, createdAt: createdAtIso, publishAt: publishAtIso, expiresAt: expiresAtIso };
        });
        res.status(200).json(items); return;
      }
      if (method === "POST" && parts.length === 0) {
        const { title, contentType, mediaUrl, textContent, background, duration = 5, link, linkText, publishAt } = req.body || {};
        const publishDate = publishAt ? new Date(publishAt) : new Date();
        const expiresDate = new Date(publishDate.getTime() + 24 * 60 * 60 * 1000);
        const data = { title, contentType: contentType || 'text', mediaUrl: mediaUrl || null, textContent: textContent || null, background: background || { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }, duration: Number(duration) || 5, link: link || null, linkText: linkText || null, publishAt: admin.firestore.Timestamp.fromDate(publishDate), expiresAt: admin.firestore.Timestamp.fromDate(expiresDate), isActive: true, views: 0, likes: 0, createdAt: admin.firestore.Timestamp.now() };
        const ref = await db.collection("stories").add(data);
        res.status(200).json({ success: true, id: ref.id, data }); return;
      }
      if (parts.length >= 1) {
        const id = parts[0];
        if (method === "POST" && parts[1] === "view") {
          const { userId = null, sessionId = null } = req.body || {};
          await db.collection("storyViews").add({ storyId: id, userId, sessionId, viewedAt: admin.firestore.Timestamp.now() });
          await db.collection("stories").doc(id).update({ views: admin.firestore.FieldValue.increment(1) });
          res.status(200).json({ success: true }); return;
        }
        if (method === "PUT" && parts.length === 1) {
          const body = { ...(req.body || {}) } as any;
          if (body.publishAt) {
            const publishDate = new Date(body.publishAt);
            body.publishAt = admin.firestore.Timestamp.fromDate(publishDate);
            if (!body.expiresAt) body.expiresAt = admin.firestore.Timestamp.fromDate(new Date(publishDate.getTime() + 24 * 60 * 60 * 1000));
          }
          if (body.expiresAt && typeof body.expiresAt === 'string') body.expiresAt = admin.firestore.Timestamp.fromDate(new Date(body.expiresAt));
          body.updatedAt = admin.firestore.Timestamp.now();
          await db.collection("stories").doc(id).update(body);
          res.status(200).json({ success: true }); return;
        }
        if (method === "DELETE" && parts.length === 1) {
          await db.collection("stories").doc(id).delete();
          const viewsSnap = await db.collection("storyViews").where("storyId", "==", id).get();
          const batch = db.batch();
          viewsSnap.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          res.status(200).json({ success: true }); return;
        }
      }
      res.status(405).json({ error: 'Method or path not allowed' }); return;
    } catch (e: any) {
      console.error('stories function error:', e);
      res.status(500).json({ error: 'server error', details: e?.message }); return;
    }
  });
});

// Promotions, Achievements, Promo Codes unified handler (no CORS, single domain)
export const promotions = functions.https.onRequest(async (req, res) => {
  try {
    const action = String(req.query.action || '').toLowerCase();
    switch (action) {
      case 'promotions':
        return await handlePromotions(req as Request, res as Response);
      case 'achievements':
        return await handleAchievements(req as Request, res as Response);
      case 'codes':
        return await handlePromoCodes(req as Request, res as Response);
      default:
        res.status(400).json({ error: 'Invalid action' }); return;
    }
  } catch (e: any) {
    console.error('promotions handler error:', e);
    res.status(500).json({ error: 'server error', details: e?.message }); return;
  }
});

function toDate(v: any): Date {
  if ((v as any)?.toDate) return (v as any).toDate();
  if (typeof v === 'string') return new Date(v);
  if (v instanceof Date) return v;
  return new Date(0);
}

async function handlePromoCodes(req: Request, res: Response) {
  const db = admin.firestore();
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const snap = await db.collection('promoCodes').get();
    const now = new Date();
    const promoCodes: any[] = [];
    snap.forEach(doc => {
      const data = doc.data() as any;
      const expiresAt = toDate(data.expiresAt);
      const isActive = data.isActive !== false;
      if (isActive && expiresAt > now) promoCodes.push({ id: doc.id, ...data });
    });
    res.status(200).json({ promoCodes }); return;
  } catch (e: any) {
    console.error('Get promo codes error:', e);
    res.status(500).json({ error: 'Failed to get promo codes' }); return;
  }
}

async function handlePromotions(req: Request, res: Response) {
  const db = admin.firestore();
  if (req.method === 'GET') {
    try {
      const snap = await db.collection('promotions').get();
      const now = new Date();
      const promotions: any[] = [];
      snap.forEach(doc => {
        const data = doc.data() as any;
        const startDate = toDate(data.startDate);
        const endDate = toDate(data.endDate);
        const isActive = data.isActive !== false;
        if (isActive && now >= startDate && now <= endDate) promotions.push({ id: doc.id, ...data });
      });
      promotions.sort((a, b) => toDate(b.endDate).getTime() - toDate(a.endDate).getTime());
      res.status(200).json({ promotions }); return;
    } catch (e: any) {
      console.error('Get promotions error:', e);
      res.status(500).json({ error: 'Failed to get promotions' }); return;
    }
  }
  if (req.method === 'POST') {
    const { title, description, discount, startDate, endDate, conditions } = req.body || {};
    if (!title || !description || discount == null) { res.status(400).json({ error: 'Missing required fields' }); return; }
    try {
      const dbData: any = {
        title,
        description,
        discount,
        startDate: startDate ? admin.firestore.Timestamp.fromDate(new Date(startDate)) : admin.firestore.Timestamp.now(),
        endDate: endDate ? admin.firestore.Timestamp.fromDate(new Date(endDate)) : admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7*24*60*60*1000)),
        conditions: conditions || {},
        isActive: true,
        createdAt: admin.firestore.Timestamp.now()
      };
      const ref = await db.collection('promotions').add(dbData);
      res.status(201).json({ success: true, promotionId: ref.id, promotion: { id: ref.id, ...dbData } }); return;
    } catch (e: any) {
      console.error('Create promotion error:', e);
      res.status(500).json({ error: 'Failed to create promotion' }); return;
    }
  }
  if (req.method === 'PUT') {
    const id = String(req.query.id || '');
    if (!id) { res.status(400).json({ error: 'Promotion ID is required' }); return; }
    try {
      const body = req.body || {};
      const updateData: any = { updatedAt: admin.firestore.Timestamp.now() };
      if (body.title != null) updateData.title = body.title;
      if (body.description != null) updateData.description = body.description;
      if (body.discount != null) updateData.discount = body.discount;
      if (body.startDate) updateData.startDate = admin.firestore.Timestamp.fromDate(new Date(body.startDate));
      if (body.endDate) updateData.endDate = admin.firestore.Timestamp.fromDate(new Date(body.endDate));
      if (body.conditions != null) updateData.conditions = body.conditions;
      if (body.isActive != null) updateData.isActive = body.isActive;
      await db.collection('promotions').doc(id).update(updateData);
      res.status(200).json({ success: true, message: 'Promotion updated successfully' }); return;
    } catch (e: any) {
      console.error('Update promotion error:', e);
      res.status(500).json({ error: 'Failed to update promotion' }); return;
    }
  }
  if (req.method === 'DELETE') {
    const id = String(req.query.id || '');
    if (!id) { res.status(400).json({ error: 'Promotion ID is required' }); return; }
    try {
      await db.collection('promotions').doc(id).delete();
      res.status(200).json({ success: true, message: 'Promotion deleted successfully' }); return;
    } catch (e: any) {
      console.error('Delete promotion error:', e);
      res.status(500).json({ error: 'Failed to delete promotion' }); return;
    }
  }
  res.status(405).json({ error: 'Method not allowed' }); return;
}

async function handleAchievements(req: Request, res: Response) {
  const db = admin.firestore();
  if (req.method === 'GET') {
    const userId = String(req.query.userId || '');
    try {
      if (!userId) {
        const snap = await db.collection('achievements').get();
        const achievements: any[] = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        res.status(200).json({ achievements }); return;
      } else {
        const snap = await db.collection('userAchievements').where('userId', '==', userId).get();
        const userAchievements: any[] = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        res.status(200).json({ userAchievements }); return;
      }
    } catch (e: any) {
      console.error('Get achievements error:', e);
      res.status(500).json({ error: 'Failed to get achievements' }); return;
    }
  }
  if (req.method === 'POST') {
    const { name, description, condition, reward, icon } = req.body || {};
    if (!name || !description || !condition) { res.status(400).json({ error: 'Missing required fields' }); return; }
    try {
      const data = { name, description, condition, reward: reward || 0, icon: icon || '🏆', isActive: true, createdAt: admin.firestore.Timestamp.now() };
      const ref = await db.collection('achievements').add(data);
      res.status(201).json({ success: true, achievementId: ref.id, achievement: { id: ref.id, ...data } }); return;
    } catch (e: any) {
      console.error('Create achievement error:', e);
      res.status(500).json({ error: 'Failed to create achievement' }); return;
    }
  }
  if (req.method === 'PUT') {
    const id = String(req.query.id || '');
    if (!id) { res.status(400).json({ error: 'Achievement ID is required' }); return; }
    try {
      const body = req.body || {};
      const updateData: any = { updatedAt: admin.firestore.Timestamp.now() };
      if (body.name != null) updateData.name = body.name;
      if (body.description != null) updateData.description = body.description;
      if (body.condition != null) updateData.condition = body.condition;
      if (body.reward != null) updateData.reward = body.reward;
      if (body.icon != null) updateData.icon = body.icon;
      if (body.isActive != null) updateData.isActive = body.isActive;
      await db.collection('achievements').doc(id).update(updateData);
      res.status(200).json({ success: true, message: 'Achievement updated successfully' }); return;
    } catch (e: any) {
      console.error('Update achievement error:', e);
      res.status(500).json({ error: 'Failed to update achievement' }); return;
    }
  }
  if (req.method === 'DELETE') {
    const id = String(req.query.id || '');
    if (!id) { res.status(400).json({ error: 'Achievement ID is required' }); return; }
    try {
      await db.collection('achievements').doc(id).delete();
      res.status(200).json({ success: true, message: 'Achievement deleted successfully' }); return;
    } catch (e: any) {
      console.error('Delete achievement error:', e);
      res.status(500).json({ error: 'Failed to delete achievement' }); return;
    }
  }
  res.status(405).json({ error: 'Method not allowed' }); return;
}

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────
function toE164(input?: string): string {
  if (!input) return '';
  const digits = String(input).replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.length === 11 && digits.startsWith('8')) return `+7${digits.slice(1)}`;
  if (digits.startsWith('7')) return `+${digits}`;
  if (digits.length === 10) return `+7${digits}`;
  return `+${digits}`;
}

function isAdminPhone(phone: string): boolean {
  const list = (process.env.ADMIN_PHONES || '')
    .split(',')
    .map(s => toE164((s || '').trim()))
    .filter(Boolean);
  return list.includes(toE164(phone));
}

const OTP_TTL_SEC = parseInt(process.env.OTP_TTL_SEC || '300', 10);
function nowSec() { return Math.floor(Date.now() / 1000); }
function randomCode() { return Math.floor(100000 + Math.random() * 900000).toString(); }

async function issueOtp(e164: string) {
  const code = process.env.MOCK_OTP === '1' ? '123456' : randomCode();
  const otpHash = await bcrypt.hash(code, 10);
  const expiresAt = nowSec() + OTP_TTL_SEC;
  await db.collection('otp').doc(e164).set({ otpHash, expiresAt }, { merge: true });
  return { code: process.env.MOCK_OTP === '1' ? code : undefined };
}

async function verifyOtp(e164: string, code: string) {
  const doc = await db.collection('otp').doc(e164).get();
  if (!doc.exists) return false;
  const d = doc.data() as any;
  if (!d || !d.otpHash || !d.expiresAt) return false;
  if (d.expiresAt < nowSec()) return false;
  const ok = await bcrypt.compare(code, d.otpHash);
  if (!ok) return false;
  await db.collection('otp').doc(e164).delete();
  return true;
}

// ───────────────────────────────────────────────────────────
// Express app for /api/* on Functions
// ───────────────────────────────────────────────────────────
const httpApp = express();
httpApp.use(cors({ origin: true }));
httpApp.use(express.json());

function sendErr(res: Response, code: string, message: string, status = 400) {
  return res.status(status).json({ error: code, message });
}

httpApp.post('/api/auth', async (req: Request, res: Response) => {
  const action = String(req.query.action || '');
  try {
    if (action === 'login') {
      const phone = toE164((req.body?.phone || req.body?.phoneOrEmail) as string);
      const password = String(req.body?.password || '');
      if (!phone || !password) return sendErr(res, 'BAD_REQUEST', 'phone and password required', 400);

      const snap = await db.collection('users').where('phone', '==', phone).limit(1).get();
      if (snap.empty) return sendErr(res, 'USER_NOT_FOUND', 'Пользователь не найден', 404);

      const doc = snap.docs[0];
      const data = doc.data() as any;
      if (!data.passwordHash) return sendErr(res, 'PASSWORD_NOT_SET', 'Пароль не установлен', 409);

      const ok = await bcrypt.compare(password, data.passwordHash);
      if (!ok) return sendErr(res, 'INVALID_PASSWORD', 'Неверный пароль', 401);

      const role = isAdminPhone(phone) ? 'admin' : 'user';
      if (data.role !== role) await db.collection('users').doc(doc.id).set({ role }, { merge: true });

      const token = await admin.auth().createCustomToken(doc.id);
      return res.json({ success: true, token, user: { uid: doc.id, phone, name: data.name || 'Пользователь', role } });
    }

    if (action === 'sendOtp') {
      const phone = toE164(req.body?.phone as string);
      if (!phone) return sendErr(res, 'BAD_REQUEST', 'phone required', 400);

      const { code } = await issueOtp(phone);
      // В продакшне код не возвращаем — достаточно success
      return res.json({ success: true, devCode: process.env.MOCK_OTP === '1' ? code : undefined });
    }

    if (action === 'verifyOtp') {
      const phone = toE164(req.body?.phone as string);
      const code = String(req.body?.code || '');
      if (!phone || !code) return sendErr(res, 'BAD_REQUEST', 'phone and code required', 400);
      const ok = await verifyOtp(phone, code);
      if (!ok) return sendErr(res, 'INVALID_CODE', 'Неверный код', 400);
      return res.json({ success: true });
    }

    if (action === 'setPassword') {
      const phone = toE164(req.body?.phone as string);
      const code = String(req.body?.code || '');
      const newPassword = String(req.body?.newPassword || '');
      const name = String(req.body?.name || 'Гость');
      if (!phone || !code || !newPassword) return sendErr(res, 'BAD_REQUEST', 'phone, code, newPassword required', 400);

      const ok = await verifyOtp(phone, code);
      if (!ok) return sendErr(res, 'INVALID_CODE', 'Неверный код', 400);

      let uid: string;
      const snap = await db.collection('users').where('phone', '==', phone).limit(1).get();
      if (snap.empty) {
        const fakeEmail = `${phone.replace('+','')}@local.user`;
        const userRecord = await admin.auth().createUser({ email: fakeEmail, displayName: name });
        uid = userRecord.uid;
      } else {
        uid = snap.docs[0].id;
      }

      const role = isAdminPhone(phone) ? 'admin' : 'user';
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await db.collection('users').doc(uid).set({ phone, name, role, passwordHash, updatedAt: new Date().toISOString() }, { merge: true });

      const token = await admin.auth().createCustomToken(uid);
      return res.json({ success: true, token, user: { uid, phone, name, role } });
    }

    return sendErr(res, 'UNKNOWN_ACTION', 'Unknown action', 400);
  } catch (e) {
    console.error('Auth(app) error:', e);
    return sendErr(res, 'INTERNAL', 'Internal error', 500);
  }
});

// DEBUG endpoint для проверки что код обновлен
httpApp.get('/api/debug-version', async (req: Request, res: Response) => {
  return res.json({ 
    version: 'v2.0-real-firestore-data',
    timestamp: new Date().toISOString(),
    message: 'Code updated successfully'
  });
});

// Добавляем endpoint для orders
httpApp.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const { action, userId, admin: isAdmin, from, to } = req.query;
    
    if (action === 'get') {
      console.log('📅 Orders API v2 REAL - Query params:', { userId, isAdmin, from, to });
      
      if (isAdmin === 'true') {
        // Админ панель - получаем только завершенные заказы
        console.log('📅 Orders API - Fetching completed orders');
        
        let query: admin.firestore.Query = db.collection("orders")
          .where('status', '==', 'completed')
          .orderBy('createdAt', 'desc')
          .limit(500); // Берем последние 500 завершенных заказов
        
        const snap = await query.get();
        
        console.log('📦 Firestore returned:', snap.docs.length, 'completed orders');
        
        const ordersData = snap.docs.map(doc => {
          const d = doc.data() as any;
          return {
            id: doc.id,
            userId: d.userId,
            items: d.items,
            amount: d.amount || d.total || d.totalPrice || 0,
            totalPrice: d.totalPrice || d.amount || d.total || 0,
            bonusUsed: d.bonusUsed || 0,
            bonusEarned: d.bonusEarned || 0,
            status: d.status || 'pending',
            date: d.createdAt?.toDate()?.toISOString(),
            createdAt: d.createdAt?.toDate()?.toISOString() || d.createdAt,
            timestamp: d.createdAt?.toDate()?.toISOString()
          };
        });
        
        // Фильтруем по датам на сервере (после получения из Firestore)
        let filtered = ordersData;
        if (from) {
          const fromTime = new Date(from as string).getTime();
          filtered = filtered.filter(o => new Date(o.createdAt || 0).getTime() >= fromTime);
          console.log('🔍 Filtered by from date:', filtered.length);
        }
        
        if (to) {
          const toTime = new Date(to as string).getTime();
          filtered = filtered.filter(o => new Date(o.createdAt || 0).getTime() <= toTime);
          console.log('� Filtered by to date:', filtered.length);
        }
        
        console.log('� Orders API - Returning:', filtered.length, 'orders');
        
        return res.status(200).json({ 
          ok: true,
          orders: filtered,
          admin: true,
          count: filtered.length,
          filtered: !!(from || to)
        });
      } else {
        // Пользователь - только его заказы
        if (!userId) return sendErr(res, 'BAD_REQUEST', 'userId required', 400);
        const snap = await db.collection("orders").where("userId", "==", userId).orderBy("createdAt", "desc").limit(10).get();
        const ordersData = snap.docs.map(doc => {
          const d = doc.data() as any;
          return {
            id: doc.id,
            items: d.items,
            amount: d.amount,
            bonusEarned: d.bonusEarned,
            bonusUsed: d.bonusUsed,
            status: d.status || 'pending',
            date: d.createdAt?.toDate()?.toISOString()
          };
        });
        return res.status(200).json(ordersData);
      }
    }
    
    return sendErr(res, 'UNKNOWN_ACTION', 'Unknown action', 400);
  } catch (e) {
    console.error('Orders(app) error:', e);
    return sendErr(res, 'INTERNAL', 'Internal error', 500);
  }
});

// API endpoint для поиска пользователя по телефону
httpApp.get('/api/users', async (req: Request, res: Response) => {
  const action = req.query.action as string;
  const phone = req.query.phone as string;
  
  // Get user by phone number
  if (action === 'getByPhone' && phone) {
    try {
      // Normalize phone
      const normalizePhone = (p: string) => {
        const cleaned = p.replace(/\D/g, '');
        if (cleaned.startsWith('8') && cleaned.length === 11) {
          return '+7' + cleaned.substring(1);
        }
        if (cleaned.startsWith('7') && cleaned.length === 11) {
          return '+' + cleaned;
        }
        return p;
      };
      
      const normalized = normalizePhone(phone);
      console.log('🔍 API /api/users - Поиск по телефону в Firestore:');
      console.log('   Оригинальный:', phone);
      console.log('   Нормализованный:', normalized);
      
      // Search in Firestore
      const usersRef = admin.firestore().collection('users');
      const snapshot = await usersRef.where('phone', '==', normalized).limit(1).get();
      
      if (snapshot.empty) {
        console.log('   ❌ Пользователь НЕ найден');
        return res.status(404).json({ ok: false, error: 'User not found' });
      }
      
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      console.log('   ✅ Пользователь найден:', userData.name || userData.displayName);
      
      return res.status(200).json({
        ok: true,
        user: {
          id: userDoc.id,
          phone: userData.phone,
          displayName: userData.displayName || userData.name,
          name: userData.name,
          email: userData.email,
          bonusPoints: userData.bonusPoints || 0
        }
      });
    } catch (error) {
      console.error('❌ Ошибка поиска в Firestore:', error);
      return res.status(500).json({ ok: false, error: 'Internal server error' });
    }
  }
  
  // Если не action=getByPhone - вернуть ошибку
  return res.status(400).json({ ok: false, error: 'Invalid action or missing parameters' });
});

// Endpoint для загрузки файлов (обходит CORS проблему)
httpApp.post('/api/upload-story', async (req: Request, res: Response) => {
  try {
    const { fileData, fileName, mimeType } = req.body;
    
    if (!fileData || !fileName) {
      return res.status(400).json({ success: false, error: 'Missing fileData or fileName' });
    }

    // Декодируем base64
    const buffer = Buffer.from(fileData, 'base64');
    
    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
    const storagePath = `stories/${timestamp}_${sanitizedName}`;
    
    // Загружаем в Storage через Admin SDK
    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);
    
    await file.save(buffer, {
      metadata: {
        contentType: mimeType || 'image/jpeg',
        metadata: {
          firebaseStorageDownloadTokens: crypto.randomUUID(),
        }
      },
      public: true,
    });

    // Получаем публичный URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '01-01-2500', // Бессрочный URL
    });

    return res.json({
      success: true,
      url,
      path: storagePath,
      contentType: mimeType || 'image/jpeg'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Upload failed' 
    });
  }
});

export const app = functions.https.onRequest(httpApp);

// ─── Push Notification Functions ───
import {
  onNewOrderForAdmin,
  onAchievementUnlocked,
  onPromotionCreated,
  onStoryCreated,
  onOrderUpdated,
  onNewsCreated
} from './triggers';

import {
  reengageInactiveUsers,
  testReengage
} from './cron';

// Export notification trigger functions
export {
  onNewOrderForAdmin,
  onAchievementUnlocked,
  onPromotionCreated,
  onStoryCreated,
  onOrderUpdated,
  onNewsCreated,
  reengageInactiveUsers,
  testReengage
};

// ─── Существующие экспортируемые функции ниже остаются без изменений ───

