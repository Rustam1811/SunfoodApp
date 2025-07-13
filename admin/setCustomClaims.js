const admin = require("firebase-admin");
const serviceAccount = require("../firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "rw2bgrf2TKZz9rUWHMsW2tHK7ct1"; // заменяешь на свой UID

admin.auth().setCustomUserClaims(uid, { role: "owner" })
  .then(() => {
    console.log("✅ Custom claim 'owner' успешно установлен.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Ошибка при установке custom claim:", error);
    process.exit(1);
  });
