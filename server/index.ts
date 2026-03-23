import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDb,
  getSetting,
  updateSetting,
  getVariations,
  getActiveVariations,
  getVariationById,
  createVariation,
  updateVariation,
  deleteVariation,
  recordEvent,
  getVariationStats,
} from './db.js';
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

// GA tracking ID — público
app.get('/api/analytics', async (_req, res) => {
  try {
    const gaId = await getSetting('ga_tracking_id');
    res.json({ ga_tracking_id: gaId });
  } catch {
    res.json({ ga_tracking_id: '' });
  }
});

// VTURB video code — público, frontend precisa renderizar o player
app.get('/api/video', async (_req, res) => {
  try {
    const videoCode = await getSetting('vturb_video_code');
    const speedCode = await getSetting('vturb_speed_code');
    res.json({ vturb_video_code: videoCode, vturb_speed_code: speedCode });
  } catch {
    res.json({ vturb_video_code: '', vturb_speed_code: '' });
  }
});

// Variação de preço para o visitante — atribui aleatoriamente via cookie
app.get('/api/variation', async (req, res) => {
  try {
    const activeVariations = await getActiveVariations();

    if (activeVariations.length === 0) {
      res.json({ variation: null });
      return;
    }

    // Check if visitor already has an assigned variation
    const cookieVariationId = req.cookies?.variation_id;
    if (cookieVariationId) {
      const existing = await getVariationById(Number(cookieVariationId));
      if (existing && existing.active) {
        // Record view
        await recordEvent(existing.id, 'view');
        res.json({ variation: existing });
        return;
      }
    }

    // Assign a random active variation
    const randomIndex = Math.floor(Math.random() * activeVariations.length);
    const assigned = activeVariations[randomIndex];

    // Set cookie (30 days)
    res.cookie('variation_id', String(assigned.id), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Record view
    await recordEvent(assigned.id, 'view');

    res.json({ variation: assigned });
  } catch {
    res.json({ variation: null });
  }
});

// Record a click event (público — chamado pelo frontend quando clica no CTA)
app.post('/api/variation/click', async (req, res) => {
  try {
    const { variation_id } = req.body;
    if (!variation_id) {
      res.status(400).json({ error: 'variation_id é obrigatório' });
      return;
    }
    await recordEvent(Number(variation_id), 'click');
    res.json({ success: true });
  } catch {
    res.json({ success: false });
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
    const videoCode = await getSetting('vturb_video_code');
    const speedCode = await getSetting('vturb_speed_code');
    res.json({ ga_tracking_id: gaId, vturb_video_code: videoCode, vturb_speed_code: speedCode });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// Salvar GA tracking ID (protegido)
app.post('/api/settings', authMiddleware, async (req, res) => {
  try {
    const { ga_tracking_id, vturb_video_code } = req.body;
    if (ga_tracking_id !== undefined) {
      await updateSetting('ga_tracking_id', ga_tracking_id);
    }
    if (vturb_video_code !== undefined) {
      await updateSetting('vturb_video_code', vturb_video_code);
    }
    if (req.body.vturb_speed_code !== undefined) {
      await updateSetting('vturb_speed_code', req.body.vturb_speed_code);
    }
    res.json({ success: true, message: 'Configurações salvas' });
  } catch {
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

// ============ PRICE VARIATIONS (protegido) ============

// Listar todas as variações
app.get('/api/variations', authMiddleware, async (_req, res) => {
  try {
    const variations = await getVariations();
    res.json({ variations });
  } catch {
    res.status(500).json({ error: 'Erro ao listar variações' });
  }
});

// Criar variação
app.post('/api/variations', authMiddleware, async (req, res) => {
  try {
    const { name, link, price_original, price_avista, price_parcelas } = req.body;
    if (!name || !price_avista || !price_parcelas) {
      res.status(400).json({ error: 'Nome, preço à vista e parcelas são obrigatórios' });
      return;
    }
    const variation = await createVariation({
      name,
      link: link || '',
      price_original: price_original || 'R$ 394',
      price_avista,
      price_parcelas,
    });
    res.json({ success: true, variation });
  } catch {
    res.status(500).json({ error: 'Erro ao criar variação' });
  }
});

// Atualizar variação
app.put('/api/variations/:id', authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, link, price_original, price_avista, price_parcelas, active } = req.body;
    const variation = await updateVariation(id, {
      name,
      link: link || '',
      price_original: price_original || 'R$ 394',
      price_avista,
      price_parcelas,
      active: active !== undefined ? active : true,
    });
    if (!variation) {
      res.status(404).json({ error: 'Variação não encontrada' });
      return;
    }
    res.json({ success: true, variation });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar variação' });
  }
});

// Deletar variação
app.delete('/api/variations/:id', authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteVariation(id);
    if (!deleted) {
      res.status(404).json({ error: 'Variação não encontrada' });
      return;
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar variação' });
  }
});

// Estatísticas das variações (protegido)
app.get('/api/variations/stats', authMiddleware, async (_req, res) => {
  try {
    const stats = await getVariationStats();
    res.json({ stats });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// ============ SERVE STATIC REACT BUILD ============

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback — todas as rotas não-API vão para o React
app.get('{*path}', (_req, res) => {
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
