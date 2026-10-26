
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './src/server/db.ts';
import { apiRouter } from './src/server/routes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  const PORT = Number(process.env.PORT) || 3000;
  const HOST = '0.0.0.0';

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Connect MongoDB / Fallback Engine
  await connectDB();

  // API Routes
  app.use('/api', apiRouter);

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'AR Supermarket Billing System',
    });
  });

  // Vite development server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: HOST,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start server ONCE
  app.listen(PORT, HOST, () => {
    console.log('');
    console.log('🚀 AR Super Market Server Started!');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`📱 Network: http://YOUR_IPV4_ADDRESS:${PORT}`);
    console.log('');
  });
}

startServer();
