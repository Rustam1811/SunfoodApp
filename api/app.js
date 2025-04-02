import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";

console.log("📦 Express запускается");

dotenv.config();
console.log("🌍 .env загружен");

const app = express();

// ✅ Сначала CORS middleware от пакета cors
const allowedOrigins = [
  "http://localhost:5173",
  "https://sunfood-35bdd.web.app",
  "https://sunfood-app.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Потом json body parser
app.use(express.json());
