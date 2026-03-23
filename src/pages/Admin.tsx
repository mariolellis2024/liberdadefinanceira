import { useState, useEffect } from 'react';
import './Admin.css';

interface Variation {
  id: number;
  name: string;
  link: string;
  price_original: string;
  price_avista: string;
  price_parcelas: string;
  page_mode: 'open' | 'hidden';
  active: boolean;
}

interface VariationStat {
  variation_id: number;
  variation_name: string;
  page_mode: string;
  views: number;
  clicks: number;
  ctr: number;
}

type Tab = 'dashboard' | 'config' | 'preview';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Login
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // GTM Settings
  const [gtmId, setGtmId] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // VTURB Video
  const [vturbVideoCode, setVturbVideoCode] = useState('');
  const [vturbSpeedCode, setVturbSpeedCode] = useState('');
  const [vturbSaved, setVturbSaved] = useState(false);
  const [vturbLoading, setVturbLoading] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Variations
  const [variations, setVariations] = useState<Variation[]>([]);
  const [showVariationForm, setShowVariationForm] = useState(false);
  const [editingVariation, setEditingVariation] = useState<Variation | null>(null);
  const [varName, setVarName] = useState('');
  const [varLink, setVarLink] = useState('');
  const [varPriceOriginal, setVarPriceOriginal] = useState('R$ 394');
  const [varPriceAvista, setVarPriceAvista] = useState('');
  const [varPriceParcelas, setVarPriceParcelas] = useState('');
  const [varPageMode, setVarPageMode] = useState<'open' | 'hidden'>('open');
  const [varSaving, setVarSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState<VariationStat[]>([]);

  // Auth check
  useEffect(() => {
    fetch('/api/auth/check')
      .then((res) => { if (res.ok) setIsAuthenticated(true); })
      .finally(() => setLoading(false));
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    loadSettings();
    loadVariations();
    loadStats();
  }, [isAuthenticated]);

  async function loadSettings() {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setGtmId(data.gtm_id || '');
    setVturbVideoCode(data.vturb_video_code || '');
    setVturbSpeedCode(data.vturb_speed_code || '');
  }

  async function loadVariations() {
    const res = await fetch('/api/variations');
    const data = await res.json();
    setVariations(data.variations || []);
  }

  async function loadStats() {
    const res = await fetch('/api/variations/stats');
    const data = await res.json();
    setStats(data.stats || []);
  }

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) { setIsAuthenticated(true); setPassword(''); }
      else setLoginError(data.error || 'Erro ao fazer login');
    } catch { setLoginError('Erro de conexão'); }
    finally { setLoginLoading(false); }
  };

  // Logout
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  // Save GTM
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gtm_id: gtmId }),
      });
      if (res.ok) { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }
    } catch {}
    finally { setSettingsLoading(false); }
  };

  // Save VTURB
  const handleSaveVturb = async (e: React.FormEvent) => {
    e.preventDefault();
    setVturbLoading(true);
    setVturbSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vturb_video_code: vturbVideoCode, vturb_speed_code: vturbSpeedCode }),
      });
      if (res.ok) { setVturbSaved(true); setTimeout(() => setVturbSaved(false), 3000); }
    } catch {}
    finally { setVturbLoading(false); }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(''); setPasswordMsg('');
    if (newPassword !== confirmPassword) { setPasswordError('As senhas não coincidem'); return; }
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg('Senha atualizada!');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setTimeout(() => setPasswordMsg(''), 3000);
      } else setPasswordError(data.error || 'Erro');
    } catch { setPasswordError('Erro de conexão'); }
    finally { setPasswordLoading(false); }
  };

  // Variation form helpers
  function resetVarForm() {
    setVarName(''); setVarLink(''); setVarPriceOriginal('R$ 394');
    setVarPriceAvista(''); setVarPriceParcelas(''); setVarPageMode('open');
    setEditingVariation(null); setShowVariationForm(false);
  }

  function startEditVariation(v: Variation) {
    setEditingVariation(v);
    setVarName(v.name); setVarLink(v.link); setVarPriceOriginal(v.price_original);
    setVarPriceAvista(v.price_avista); setVarPriceParcelas(v.price_parcelas);
    setVarPageMode(v.page_mode || 'open');
    setShowVariationForm(true);
  }

  const handleSaveVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    setVarSaving(true);
    try {
      const body = {
        name: varName, link: varLink, price_original: varPriceOriginal,
        price_avista: varPriceAvista, price_parcelas: varPriceParcelas,
        page_mode: varPageMode,
        active: editingVariation ? editingVariation.active : true,
      };
      const url = editingVariation ? `/api/variations/${editingVariation.id}` : '/api/variations';
      const method = editingVariation ? 'PUT' : 'POST';
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      resetVarForm();
      loadVariations();
      loadStats();
    } catch {}
    finally { setVarSaving(false); }
  };

  const handleToggleVariation = async (v: Variation) => {
    await fetch(`/api/variations/${v.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...v, active: !v.active }),
    });
    loadVariations();
  };

  const handleDeleteVariation = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta variação?')) return;
    await fetch(`/api/variations/${id}`, { method: 'DELETE' });
    loadVariations();
    loadStats();
  };

  const handleDuplicateVariation = async (v: Variation) => {
    const newMode = v.page_mode === 'open' ? 'hidden' : 'open';
    const modeLabel = newMode === 'hidden' ? 'Fechada' : 'Aberta';
    await fetch('/api/variations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${v.name} (${modeLabel})`,
        link: v.link,
        price_original: v.price_original,
        price_avista: v.price_avista,
        price_parcelas: v.price_parcelas,
        page_mode: newMode,
      }),
    });
    loadVariations();
    loadStats();
  };

  if (loading) {
    return <div className="admin-page"><div className="admin-container"><p className="admin-loading">Carregando...</p></div></div>;
  }

  // ==================== LOGIN ====================
  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="admin-container admin-login-container">
          <div className="admin-login-card">
            <div className="admin-logo">🔐</div>
            <h1>Painel Administrativo</h1>
            <p className="admin-subtitle">Liberdade Financeira</p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" autoFocus required />
              </div>
              {loginError && <p className="error-msg">{loginError}</p>}
              <button type="submit" className="btn-admin-primary" disabled={loginLoading}>
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD ====================
  const totalViews = stats.reduce((sum, s) => sum + Number(s.views), 0);
  const totalClicks = stats.reduce((sum, s) => sum + Number(s.clicks), 0);
  const totalCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <h1>⚙️ Liberdade Financeira</h1>
          <div className="admin-header-right">
            <nav className="admin-tabs">
              <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setActiveTab('dashboard'); loadStats(); }}>
                📊 Dashboard
              </button>
              <button className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`}
                onClick={() => setActiveTab('config')}>
                ⚙️ Configurações
              </button>
              <button className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}>
                👁️ Testar Página
              </button>
            </nav>
            <button className="btn-admin-logout" onClick={handleLogout}>Sair</button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {activeTab === 'dashboard' && (
          <>
            {/* Summary Cards */}
            <div className="stats-summary">
              <div className="stat-card">
                <span className="stat-number">{totalViews}</span>
                <span className="stat-label">Exibições</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{totalClicks}</span>
                <span className="stat-label">Cliques</span>
              </div>
              <div className="stat-card stat-card-highlight">
                <span className="stat-number">{totalCtr}%</span>
                <span className="stat-label">CTR Geral</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{variations.filter(v => v.active).length}</span>
                <span className="stat-label">Variações Ativas</span>
              </div>
            </div>

            {/* Performance per Variation */}
            <div className="admin-card">
              <div className="card-header-row">
                <h2>📈 Performance por Variação</h2>
                <button className="btn-admin-small" onClick={loadStats}>↻ Atualizar</button>
              </div>

              {stats.length === 0 ? (
                <p className="card-description">Nenhuma variação criada ainda. Vá em Configurações para criar.</p>
              ) : (
                <>
                  <div className="stats-table-wrapper">
                    <table className="stats-table">
                      <thead>
                        <tr>
                          <th>Variação</th>
                          <th>Modo</th>
                          <th>Exibições</th>
                          <th>Cliques</th>
                          <th>CTR</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.map((s) => {
                          const variation = variations.find(v => v.id === s.variation_id);
                          return (
                            <tr key={s.variation_id}>
                              <td>
                                <strong>{s.variation_name}</strong>
                                {variation && (
                                  <span className="stat-price-hint">{variation.price_avista}</span>
                                )}
                              </td>
                              <td>
                                <span className={`var-page-mode ${s.page_mode === 'hidden' ? 'mode-hidden' : 'mode-open'}`}>
                                  {s.page_mode === 'hidden' ? '📺 Fechada' : '📄 Aberta'}
                                </span>
                              </td>
                              <td>{s.views}</td>
                              <td>{s.clicks}</td>
                              <td>
                                <span className={`ctr-badge ${Number(s.ctr) > 5 ? 'ctr-good' : Number(s.ctr) > 2 ? 'ctr-ok' : 'ctr-low'}`}>
                                  {s.ctr}%
                                </span>
                              </td>
                              <td>
                                <span className={`status-dot ${variation?.active ? 'active' : 'inactive'}`}>
                                  {variation?.active ? 'Ativa' : 'Inativa'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Insights */}
                  {(() => {
                    const qualified = stats.filter(s => Number(s.views) >= 50);
                    if (qualified.length < 2) {
                      const minViews = Math.min(...stats.map(s => Number(s.views)));
                      const remaining = Math.max(0, 50 - minViews);
                      return (
                        <div className="insight-box insight-waiting">
                          <strong>⏳ Coletando dados...</strong>
                          <p>Cada variação precisa de pelo menos 50 exibições para gerar insights confiáveis. Faltam aproximadamente <strong>{remaining}</strong> exibições para a análise.</p>
                        </div>
                      );
                    }
                    const best = [...qualified].sort((a, b) => Number(b.ctr) - Number(a.ctr))[0];
                    const bestVariation = variations.find(v => v.id === best.variation_id);
                    const modeLabel = best.page_mode === 'hidden' ? 'Página Fechada (📺 só vídeo)' : 'Página Aberta (📄)';
                    return (
                      <div className="insight-box insight-result">
                        <strong>🏆 Melhor Performance</strong>
                        <p>
                          A variação <strong>"{best.variation_name}"</strong> com <strong>{bestVariation?.price_avista}</strong> e modo <strong>{modeLabel}</strong> tem o maior CTR: <strong>{best.ctr}%</strong> ({best.clicks} cliques em {best.views} exibições).
                        </p>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </>
        )}

        {activeTab === 'config' && (
          <>
            {/* Price Variations */}
            <div className="admin-card">
              <div className="card-header-row">
                <h2>🔄 Rotação de Preços (Teste A/B)</h2>
                {!showVariationForm && (
                  <button className="btn-admin-small btn-add" onClick={() => setShowVariationForm(true)}>
                    + Nova Variação
                  </button>
                )}
              </div>
              <p className="card-description">
                Cada visitante recebe uma variação aleatória. Os preços e links são exibidos em todos os botões CTA.
              </p>

              {/* Variation Form */}
              {showVariationForm && (
                <form className="variation-form" onSubmit={handleSaveVariation}>
                  <h3>{editingVariation ? 'Editar Variação' : 'Nova Variação'}</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nome interno</label>
                      <input value={varName} onChange={e => setVarName(e.target.value)}
                        placeholder='Ex: "Oferta R$ 197"' required />
                    </div>
                    <div className="form-group">
                      <label>Link de checkout</label>
                      <input value={varLink} onChange={e => setVarLink(e.target.value)}
                        placeholder="https://pay.hotmart.com/..." />
                    </div>
                  </div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label>Preço original (riscado)</label>
                      <input value={varPriceOriginal} onChange={e => setVarPriceOriginal(e.target.value)}
                        placeholder="R$ 394" required />
                    </div>
                    <div className="form-group">
                      <label>Preço à vista</label>
                      <input value={varPriceAvista} onChange={e => setVarPriceAvista(e.target.value)}
                        placeholder="R$ 197" required />
                    </div>
                    <div className="form-group">
                      <label>Parcelas</label>
                      <input value={varPriceParcelas} onChange={e => setVarPriceParcelas(e.target.value)}
                        placeholder='12x de R$ 19,70' required />
                    </div>
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <label>Modo da página</label>
                      <select value={varPageMode} onChange={e => setVarPageMode(e.target.value as 'open' | 'hidden')}>
                        <option value="open">📄 Aberta (tudo visível)</option>
                        <option value="hidden">📺 Só vídeo (revelada pelo VTURB)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-admin-primary" disabled={varSaving} style={{ width: 'auto' }}>
                      {varSaving ? 'Salvando...' : editingVariation ? 'Salvar Alterações' : 'Criar Variação'}
                    </button>
                    <button type="button" className="btn-admin-cancel" onClick={resetVarForm}>Cancelar</button>
                  </div>
                </form>
              )}

              {/* Variations List */}
              {variations.length === 0 && !showVariationForm ? (
                <p className="empty-state">Nenhuma variação criada. Clique em "+ Nova Variação" para começar.</p>
              ) : (
                <div className="variations-list">
                  {variations.map((v) => (
                    <div key={v.id} className={`variation-item ${v.active ? '' : 'variation-inactive'}`}>
                      <div className="variation-info">
                        <div className="variation-name">
                          <strong>{v.name}</strong>
                          <span className={`status-dot ${v.active ? 'active' : 'inactive'}`}>
                            {v.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <div className="variation-prices">
                          <span className="var-price-original">{v.price_original}</span>
                          <span className="var-price-avista">{v.price_avista}</span>
                          <span className="var-price-parcelas">ou {v.price_parcelas}</span>
                          <span className={`var-page-mode ${v.page_mode === 'hidden' ? 'mode-hidden' : 'mode-open'}`}>
                            {v.page_mode === 'hidden' ? '📺 Só vídeo' : '📄 Aberta'}
                          </span>
                        </div>
                        {v.link && <div className="variation-link">🔗 {v.link.substring(0, 50)}...</div>}
                      </div>
                      <div className="variation-actions">
                        <button className="btn-icon" onClick={() => handleDuplicateVariation(v)}
                          title={v.page_mode === 'open' ? 'Duplicar como Fechada' : 'Duplicar como Aberta'}>📋</button>
                        <button className="btn-icon" onClick={() => handleToggleVariation(v)}
                          title={v.active ? 'Desativar' : 'Ativar'}>
                          {v.active ? '⏸️' : '▶️'}
                        </button>
                        <button className="btn-icon" onClick={() => startEditVariation(v)} title="Editar">✏️</button>
                        <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteVariation(v.id)} title="Excluir">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* VTURB Video */}
            <div className="admin-card">
              <h2>🎬 Vídeo VTURB</h2>
              <p className="card-description">
                Cole o código de embed do vídeo e o código de velocidade da VTURB.
                O vídeo será exibido no topo da página principal.
              </p>
              <form onSubmit={handleSaveVturb}>
                <div className="form-group">
                  <label>Código do Vídeo</label>
                  <textarea className="admin-textarea" value={vturbVideoCode}
                    onChange={e => setVturbVideoCode(e.target.value)}
                    placeholder='<vturb-smartplayer id="ab-..." style="..."></vturb-smartplayer> <script type="text/javascript">...</script>'
                    rows={4} />
                </div>
                <div className="form-group">
                  <label>Código de Velocidade</label>
                  <textarea className="admin-textarea" value={vturbSpeedCode}
                    onChange={e => setVturbSpeedCode(e.target.value)}
                    placeholder='<script>!function(i,n){...}(window,performance);</script> <link rel="preload" ...>'
                    rows={4} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-admin-primary" disabled={vturbLoading} style={{ width: 'auto' }}>
                    {vturbLoading ? 'Salvando...' : 'Salvar Vídeo'}
                  </button>
                  {vturbSaved && <span className="success-msg">✓ Salvo!</span>}
                </div>
              </form>
            </div>

            {/* Google Tag Manager */}
            <div className="admin-card">
              <h2>📦 Google Tag Manager</h2>
              <p className="card-description">
                Cole o ID do GTM (ex: <code>GTM-XXXXXXX</code>). O GTM gerencia Google Analytics, Meta Pixel e todos os rastreamentos.
              </p>
              <form onSubmit={handleSaveSettings}>
                <div className="form-group">
                  <label htmlFor="gtmId">Container ID</label>
                  <input id="gtmId" type="text" value={gtmId}
                    onChange={(e) => setGtmId(e.target.value)} placeholder="GTM-XXXXXXX" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-admin-primary" disabled={settingsLoading} style={{ width: 'auto' }}>
                    {settingsLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                  {settingsSaved && <span className="success-msg">✓ Salvo!</span>}
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="admin-card">
              <h2>🔑 Trocar Senha</h2>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Senha atual</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Senha atual" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nova senha</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Mín. 6 caracteres" required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label>Confirmar</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha" required />
                  </div>
                </div>
                {passwordError && <p className="error-msg">{passwordError}</p>}
                {passwordMsg && <p className="success-msg">{passwordMsg}</p>}
                <div className="form-actions">
                  <button type="submit" className="btn-admin-primary" disabled={passwordLoading} style={{ width: 'auto' }}>
                    {passwordLoading ? 'Atualizando...' : 'Atualizar Senha'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {activeTab === 'preview' && (
          <>
            <div className="admin-card">
              <h2>👁️ Testar Modo da Página</h2>
              <p className="card-description">
                Use os botões abaixo para visualizar como a página fica em cada modo. Isso não afeta os visitantes reais.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                <a
                  href="/?preview_mode=open"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-admin-preview btn-preview-open"
                >
                  📄 Testar Página Aberta
                </a>
                <a
                  href="/?preview_mode=hidden"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-admin-preview btn-preview-hidden"
                >
                  📺 Testar Página Fechada (só vídeo)
                </a>
              </div>
            </div>

            <div className="admin-card">
              <h2>📝 Como configurar na VTURB</h2>
              <p className="card-description" style={{ marginBottom: '16px' }}>
                Você precisa criar <strong>2 botões Custom HTML</strong> na VTURB, ambos no mesmo tempo de início:
              </p>

              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '16px 20px', marginBottom: '12px' }}>
                <strong style={{ color: '#166534' }}>🔹 Botão 1 — Revela o conteúdo da página</strong>
                <div className="card-description" style={{ lineHeight: '2', marginBottom: 0, marginTop: '8px' }}>
                  <strong>1.</strong> Crie um botão → <strong>Custom HTML</strong><br />
                  <strong>2.</strong> Ative <strong>"Show hidden content"</strong><br />
                  <strong>3.</strong> Selecione: <strong>ID</strong><br />
                  <strong>4.</strong> Nome do ID: <code>lf-reveal</code><br />
                  <strong>5.</strong> Defina o tempo de início (ex: <code>03:00</code>)<br />
                  <strong>6.</strong> Marque ✅ "Set as pitch moment"<br />
                  <strong>7.</strong> Marque ✅ "Show after video ends"<br />
                  <strong>8.</strong> Marque ✅ "Keep displaying on future visits"
                </div>
              </div>

              <div style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: '10px', padding: '16px 20px' }}>
                <strong style={{ color: '#5b21b6' }}>🔹 Botão 2 — Revela o botão e preço (CTA do vídeo)</strong>
                <div className="card-description" style={{ lineHeight: '2', marginBottom: 0, marginTop: '8px' }}>
                  <strong>1.</strong> Crie outro botão → <strong>Custom HTML</strong><br />
                  <strong>2.</strong> Ative <strong>"Show hidden content"</strong><br />
                  <strong>3.</strong> Selecione: <strong>ID</strong><br />
                  <strong>4.</strong> Nome do ID: <code>lf-hero-cta</code><br />
                  <strong>5.</strong> Mesmo tempo de início do botão 1 (ex: <code>03:00</code>)<br />
                  <strong>6.</strong> Marque ✅ "Show after video ends"<br />
                  <strong>7.</strong> Marque ✅ "Keep displaying on future visits"
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
