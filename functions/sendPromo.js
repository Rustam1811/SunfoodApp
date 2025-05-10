const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendPromo = functions.https.onCall(async (data, ctx) => {
  if (ctx.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Нет доступа');
  }
  const { title, body } = data;
  const payload = { notification: { title, body } };
  return admin.messaging().sendToTopic('promo', payload);
});