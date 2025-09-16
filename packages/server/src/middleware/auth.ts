import type { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any)?.userId as number | undefined;
  if (!userId) {
    return res.status(401).json({ success: false, error: '未登录' });
  }
  next();
}


