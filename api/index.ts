import app from "./app";
import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  app(req, res);
}
