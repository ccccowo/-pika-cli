import { Router } from 'express';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

// 仅用于向 GitHub 发请求：从用户的某个 token 记录中取出加密串解密（这里不解密返回）
import crypto from 'node:crypto';
const SECRET = process.env.SESSION_SECRET || 'dev-secret';
function decrypt(tokenEnc: string): string {
  const buf = Buffer.from(tokenEnc, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const key = crypto.createHash('sha256').update(SECRET).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}

export const router = Router();

router.use(requireAuth);

const createRepoSchema = z.object({
  repoName: z.string().min(1).max(100),
  description: z.string().max(200).optional(),
  isPrivate: z.boolean().optional().default(false),
  tokenId: z.number(),
});

router.post('/create', async (req, res) => {
  const parsed = createRepoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: '参数不合法' });
  const userId = (req.session as any).userId as number;

  const tokenRow = await prisma.githubToken.findFirst({ where: { id: parsed.data.tokenId, userId } });
  if (!tokenRow) return res.status(404).json({ success: false, error: 'Token 不存在' });
  const token = decrypt(tokenRow.tokenEnc);

  const octokit = new Octokit({ auth: token });
  try {
    const { data } = await octokit.repos.createForAuthenticatedUser({
      name: parsed.data.repoName,
      description: parsed.data.description,
      private: parsed.data.isPrivate,
    });

    const rec = await prisma.repoRecord.create({
      data: {
        userId,
        provider: 'github',
        name: data.name,
        description: data.description ?? undefined,
        isPrivate: data.private ?? false,
        htmlUrl: data.html_url ?? undefined,
      }
    });

    return res.json({ success: true, repo: { id: rec.id, name: rec.name, url: rec.htmlUrl } });
  } catch (e: any) {
    return res.status(400).json({ success: false, error: e?.message || '创建仓库失败' });
  }
});

router.get('/', async (req, res) => {
  const userId = (req.session as any).userId as number;
  const list = await prisma.repoRecord.findMany({ where: { userId }, orderBy: { id: 'desc' } });
  return res.json({ success: true, repos: list });
});

router.delete('/:id', async (req, res) => {
  const userId = (req.session as any).userId as number;
  const id = Number(req.params.id);
  await prisma.repoRecord.delete({ where: { id, userId } });
  return res.json({ success: true });
});


