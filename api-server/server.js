require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Firebase Admin before importing other modules
const admin = require('firebase-admin');
if (!admin.apps.length) {
    try {
        // Try loading from JSON file first (more reliable)
        const serviceAccountPath = './firebase-service-account.json';
        const fs = require('fs');
        
        let serviceAccount;
        if (fs.existsSync(serviceAccountPath)) {
            serviceAccount = require(serviceAccountPath);
            console.log('🔑 Loading Firebase service account from JSON file');
        } else {
            // Fallback to base64 if JSON file doesn't exist
            const b64 = process.env.FIREBASE_KEY_BASE64;
            if (!b64) throw new Error("Neither firebase-service-account.json nor FIREBASE_KEY_BASE64 is available");
            
            const serviceAccountJson = Buffer.from(b64, "base64").toString("utf8");
            serviceAccount = JSON.parse(serviceAccountJson);
            
            // Fix the private key formatting by replacing escaped newlines with actual newlines
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
            console.log('🔑 Loading Firebase service account from base64');
        }
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://coffeeaddict-c9d70-default-rtdb.firebaseio.com"
        });
        console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error.message);
    }
}

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Импорт API handlers
const bonusSettings = require('../api/bonus-settings');
const orders = require('../api/orders');
const userBonus = require('../api/user-bonus');
const useBonus = require('../api/use-bonus');
const promoCodes = require('../api/promo-codes');
const testBonus = require('../api/test-bonus');
const simpleOrder = require('../api/simple-order');
const login = require('../api/login');
const register = require('../api/register');
const stories = require('../api/stories');
const promotions = require('../api/promotions');

// API Routes
app.use('/api/bonus-settings', bonusSettings);
app.use('/api/orders', orders);
app.use('/api/user-bonus', userBonus);
app.use('/api/use-bonus', useBonus);
app.use('/api/promo-codes', promoCodes);
app.use('/api/test-bonus', testBonus);
app.use('/api/simple-order', simpleOrder);
app.use('/api/login', login);
app.use('/api/register', register);
app.use('/api/stories', stories);
app.use('/api/promotions', promotions);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SunfoodApp API Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler для API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.path
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 SunfoodApp API Server running on http://localhost:${PORT}`);
    console.log(`📊 Available endpoints:`);
    console.log(`   GET  /api/health`);
    console.log(`   *    /api/bonus-settings`);
    console.log(`   *    /api/orders`);
    console.log(`   *    /api/user-bonus`);
    console.log(`   *    /api/use-bonus`);
    console.log(`   *    /api/promo-codes`);
    console.log(`   *    /api/test-bonus`);
    console.log(`   *    /api/simple-order`);
    console.log(`   *    /api/login`);
    console.log(`   *    /api/register`);
    console.log(`   *    /api/stories`);
    console.log(`   *    /api/promotions`);
});
