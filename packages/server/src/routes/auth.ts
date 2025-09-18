import { Router } from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { prisma } from '../lib/prisma.js';

export const router = Router();

// GitHub OAuth 配置
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback';

// 验证必需的环境变量
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.error('❌ 错误：缺少 GitHub OAuth 环境变量！');
  console.error('请设置以下环境变量：');
  console.error('- GITHUB_CLIENT_ID');
  console.error('- GITHUB_CLIENT_SECRET');
  console.error('');
  console.error('您可以通过以下方式设置：');
  console.error('1. 创建 .env 文件在 packages/server/ 目录下');
  console.error('2. 或者直接在命令行中设置环境变量');
  console.error('');
  console.error('示例 .env 文件内容：');
  console.error('GITHUB_CLIENT_ID=your_github_client_id_here');
  console.error('GITHUB_CLIENT_SECRET=your_github_client_secret_here');
  console.error('GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback');
  console.error('');
  console.error('获取 GitHub OAuth 凭据：');
  console.error('1. 访问 https://github.com/settings/applications/new');
  console.error('2. 创建新的 OAuth App');
  console.error('3. 设置 Authorization callback URL 为: http://localhost:3000/api/auth/github/callback');
  console.error('4. 复制 Client ID 和 Client Secret 到环境变量中');
  
  // 不抛出错误，而是跳过 GitHub 策略配置
  console.warn('⚠️ 跳过 GitHub OAuth 配置，服务器将在没有认证功能的情况下启动');
} else {
  // 配置 Passport GitHub 策略
  passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK_URL
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  const startTime = Date.now();
  try {
    // 确保 githubId 是字符串类型
    const githubId = String(profile.id);
    console.log('🔍 处理 GitHub 用户:', { id: githubId, username: profile.username });
    
    // 使用 upsert 操作，一次性完成查找或创建/更新
    const user = await prisma.user.upsert({
      where: { githubId },
      update: {
        username: profile.username,
        displayName: profile.displayName || profile.username,
        email: profile.emails?.[0]?.value,
        avatarUrl: profile.photos?.[0]?.value,
        githubUrl: profile.profileUrl
      },
      create: {
        githubId,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        email: profile.emails?.[0]?.value,
        avatarUrl: profile.photos?.[0]?.value,
        githubUrl: profile.profileUrl
      }
    });

    const duration = Date.now() - startTime;
    console.log(`✅ 用户处理完成 (${duration}ms):`, { id: user.id, githubId, username: user.username });

    return done(null, user);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ GitHub OAuth 错误 (${duration}ms):`, error);
    return done(error, null);
  }
}));
}

// 序列化用户信息到会话
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// 从会话反序列化用户信息
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        githubId: true,
        username: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        githubUrl: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// GitHub 登录入口
router.get('/github', (req, res) => {
  console.log('🚀 GitHub OAuth 登录入口被调用');
  console.log('🔑 Client ID 存在:', !!GITHUB_CLIENT_ID);
  console.log('🔐 Client Secret 存在:', !!GITHUB_CLIENT_SECRET);
  console.log('🌐 回调 URL:', GITHUB_CALLBACK_URL);
  
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.error('❌ GitHub OAuth 未配置');
    return res.status(503).json({ 
      success: false, 
      error: 'GitHub OAuth 未配置，请设置 GITHUB_CLIENT_ID 和 GITHUB_CLIENT_SECRET 环境变量' 
    });
  }
  
  console.log('✅ 开始 GitHub OAuth 认证流程');
  passport.authenticate('github', { scope: ['user:email'] })(req, res);
});

// GitHub 回调处理
router.get('/github/callback', (req, res) => {
  const startTime = Date.now();
  console.log('🔗 GitHub OAuth 回调被调用');
  console.log('📋 查询参数:', req.query);
  console.log('🌐 前端 URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
  
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.error('❌ GitHub OAuth 未配置');
    return res.status(503).json({ 
      success: false, 
      error: 'GitHub OAuth 未配置，请设置 GITHUB_CLIENT_ID 和 GITHUB_CLIENT_SECRET 环境变量' 
    });
  }
  
  // 设置超时处理
  const timeout = setTimeout(() => {
    console.error('⏰ GitHub OAuth 认证超时');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?login=error&message=认证超时，请重试`);
  }, 10000); // 10秒超时
  
  passport.authenticate('github', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?login=error&message=github_auth_failed` 
  })(req, res, (err) => {
    clearTimeout(timeout);
    
    if (err) {
      const duration = Date.now() - startTime;
      console.error(`❌ GitHub OAuth 认证错误 (${duration}ms):`, err);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?login=error&message=${encodeURIComponent(err.message)}`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ GitHub OAuth 认证成功 (${duration}ms)，用户:`, req.user);
    
    // 登录成功，重定向到前端
    const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}?login=success`;
    console.log('🚀 重定向到:', frontendUrl);
    res.redirect(frontendUrl);
  });
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    return res.json({ 
      success: true, 
      user: {
        id: user.id,
        githubId: user.githubId,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubUrl: user.githubUrl
      }
    });
  }
  return res.json({ success: true, user: null });
});

// 登出
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: '登出失败' });
    }
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
});

// 检查登录状态
router.get('/status', (req, res) => {
  res.json({ 
    success: true, 
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user : null
  });
});