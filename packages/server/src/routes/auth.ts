import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: '参数不合法' });
  }
  const { email, password } = parsed.data;
  const existed = await prisma.user.findUnique({ where: { email } });
  if (existed) {
    return res.status(409).json({ success: false, error: '邮箱已注册' });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  (req.session as any).userId = user.id;
  return res.json({ success: true, user: { id: user.id, email: user.email } });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: '参数不合法' });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ success: false, error: '邮箱或密码错误' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ success: false, error: '邮箱或密码错误' });
  (req.session as any).userId = user.id;
  return res.json({ success: true, user: { id: user.id, email: user.email } });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {});
  res.json({ success: true });
});

router.get('/me', async (req, res) => {
  const userId = (req.session as any)?.userId as number | undefined;
  if (!userId) return res.json({ success: true, user: null });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  return res.json({ success: true, user });
});


