const app = express();
app.use(express.json());

// 💥 ДОБАВЬ ЭТО — фикс для CORS через express
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://sunfood-35bdd.web.app",
    "https://sunfood-app.vercel.app"
  ];
  const origin = req.headers.origin;

  // всегда логируем
  console.log("🌍 CORS check: Origin =", origin);

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});
