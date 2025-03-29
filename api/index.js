import app from "./app.js";

export default function handler(req, res) {
  return app(req, res); // передаём запрос express-приложению
}
