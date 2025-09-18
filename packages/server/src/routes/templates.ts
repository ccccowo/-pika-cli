import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const router = Router();

// 创建模板
const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  owner: z.string().min(1),
  repo: z.string().min(1),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

router.post('/create', requireAuth, async (req, res) => {
  try {
    const parsed = createTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: '参数不合法' });
    }

    const { name, description, owner, repo, isPublic, tags } = parsed.data;
    const userId = (req.session as any).userId;

    // 检查模板是否已存在
    const existingTemplate = await prisma.template.findFirst({
      where: {
        userId,
        owner,
        repo,
      },
    });

    if (existingTemplate) {
      return res.status(409).json({ success: false, error: '模板已存在' });
    }

    const template = await prisma.template.create({
      data: {
        userId,
        name,
        description,
        owner,
        repo,
        isPublic,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    res.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        owner: template.owner,
        repo: template.repo,
        isPublic: template.isPublic,
        tags: template.tags ? JSON.parse(template.tags) : [],
        createdAt: template.createdAt,
      },
    });
  } catch (error) {
    console.error('创建模板失败:', error);
    res.status(500).json({ success: false, error: '创建模板失败' });
  }
});

// 获取用户的模板列表
router.get('/my', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const templates = await prisma.template.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      owner: template.owner,
      repo: template.repo,
      isPublic: template.isPublic,
      tags: template.tags ? JSON.parse(template.tags) : [],
      createdAt: template.createdAt,
    }));

    res.json({ success: true, templates: formattedTemplates });
  } catch (error) {
    console.error('获取模板列表失败:', error);
    res.status(500).json({ success: false, error: '获取模板列表失败' });
  }
});

// 更新模板
const updateTemplateSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

router.put('/update', requireAuth, async (req, res) => {
  try {
    const parsed = updateTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: '参数不合法' });
    }

    const { id, name, description, isPublic, tags } = parsed.data;
    const userId = (req.session as any).userId;

    // 检查模板是否存在且属于当前用户
    const existingTemplate = await prisma.template.findFirst({
      where: { id, userId },
    });

    if (!existingTemplate) {
      return res.status(404).json({ success: false, error: '模板不存在' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);

    const template = await prisma.template.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        owner: template.owner,
        repo: template.repo,
        isPublic: template.isPublic,
        tags: template.tags ? JSON.parse(template.tags) : [],
        createdAt: template.createdAt,
      },
    });
  } catch (error) {
    console.error('更新模板失败:', error);
    res.status(500).json({ success: false, error: '更新模板失败' });
  }
});

// 删除模板
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const userId = (req.session as any).userId;

    // 检查模板是否存在且属于当前用户
    const existingTemplate = await prisma.template.findFirst({
      where: { id: templateId, userId },
    });

    if (!existingTemplate) {
      return res.status(404).json({ success: false, error: '模板不存在' });
    }

    await prisma.template.delete({
      where: { id: templateId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('删除模板失败:', error);
    res.status(500).json({ success: false, error: '删除模板失败' });
  }
});

// 获取公共模板列表
router.get('/public', async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      owner: template.owner,
      repo: template.repo,
      tags: template.tags ? JSON.parse(template.tags) : [],
      createdAt: template.createdAt,
      author: {
        username: template.user.username,
        displayName: template.user.displayName,
      },
    }));

    res.json({ success: true, templates: formattedTemplates });
  } catch (error) {
    console.error('获取公共模板列表失败:', error);
    res.status(500).json({ success: false, error: '获取公共模板列表失败' });
  }
});
