import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { router as projectRouter } from './routes/project.js';

const app = express();
const port = process.env.PORT || 3000;

// CORS配置
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite默认端口
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

// 中间件
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 路由
app.use('/api/project', projectRouter);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: err.message || '服务器内部错误',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log('支持的源:', corsOptions.origin);
}); 