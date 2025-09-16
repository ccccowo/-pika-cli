import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

// 简单对称加密占位（生产应使用更安全的方案/KMS）
import crypto from 'node:crypto';
const SECRET = process.env.SESSION_SECRET || 'dev-secret';
function encrypt(token: string): string {
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash('sha256').update(SECRET).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}
function mask(token: string): string {
  if (token.length <= 8) return '*'.repeat(token.length);
  return token.slice(0, 4) + '***' + token.slice(-4);
}

export const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const userId = (req.session as any).userId as number;
  const list = await prisma.githubToken.findMany({ where: { userId }, orderBy: { id: 'desc' } });
  return res.json({ success: true, tokens: list.map(t => ({ id: t.id, name: t.name, createdAt: t.createdAt })) });
});

const createSchema = z.object({ name: z.string().min(1).max(50), token: z.string().min(10) });
router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: '参数不合法' });
  const userId = (req.session as any).userId as number;
  const tokenEnc = encrypt(parsed.data.token);
  const item = await prisma.githubToken.create({ data: { userId, name: parsed.data.name, tokenEnc } });
  return res.json({ success: true, token: { id: item.id, name: item.name } });
});

const updateSchema = z.object({ name: z.string().min(1).max(50).optional(), token: z.string().min(10).optional() });
router.put('/:id', async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: '参数不合法' });
  const userId = (req.session as any).userId as number;
  const id = Number(req.params.id);
  const data: any = {};
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.token) data.tokenEnc = encrypt(parsed.data.token);
  const item = await prisma.githubToken.update({ where: { id, userId }, data });
  return res.json({ success: true, token: { id: item.id, name: item.name } });
});

router.delete('/:id', async (req, res) => {
  const userId = (req.session as any).userId as number;
  const id = Number(req.params.id);
  await prisma.githubToken.delete({ where: { id, userId } });
  return res.json({ success: true });
});


