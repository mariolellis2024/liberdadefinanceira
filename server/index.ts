import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, getSetting, updateSetting } from './db.js';
import { authMiddleware, login, changePassword, logout } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// ============ PUBLIC API (sem auth) ============

// Login
app.post('/api/login', login);

// GA tracking ID — público, pois o frontend precisa injetar o script
// Retorna APENAS o tracking ID, nada mais do banco
app.get('/api/analytics', async (_req, res) => {
  try {
    const gaId = await getSetting('ga_tracking_id');
    res.json({ ga_tracking_id: gaId });
  } catch {
    res.json({ ga_tracking_id: '' });
  }
});

// ============ PROTECTED API (requer auth) ============

// Verificar se está autenticado
app.get('/api/auth/check', authMiddleware, (_req, res) => {
  res.json({ authenticated: true });
});

// Logout
app.post('/api/logout', logout);

// Trocar senha
app.post('/api/password', authMiddleware, changePassword);

// Buscar configurações (protegido)
app.get('/api/settings', authMiddleware, async (_req, res) => {
  try {
    const gaId = await getSetting('ga_tracking_id');
    res.json({ ga_tracking_id: gaId });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// Salvar GA tracking ID (protegido)
app.post('/api/settings', authMiddleware, async (req, res) => {
  try {
    const { ga_tracking_id } = req.body;
    if (ga_tracking_id === undefined) {
      res.status(400).json({ error: 'ga_tracking_id é obrigatório' });
      return;
    }
    await updateSetting('ga_tracking_id', ga_tracking_id);
    res.json({ success: true, message: 'Configurações salvas' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

// ============ SERVE STATIC REACT BUILD ============

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback — todas as rotas não-API vão para o React
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ============ START ============

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
