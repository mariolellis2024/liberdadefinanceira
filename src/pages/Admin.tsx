import { useState, useEffect } from 'react';
import './Admin.css';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Login state
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Settings state
  const [gaTrackingId, setGaTrackingId] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Check auth on mount
  useEffect(() => {
    fetch('/api/auth/check')
      .then((res) => {
        if (res.ok) setIsAuthenticated(true);
      })
      .finally(() => setLoading(false));
  }, []);

  // Load settings when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setGaTrackingId(data.ga_tracking_id || '');
      });
  }, [isAuthenticated]);

  // Login handler
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

      if (res.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setLoginError(data.error || 'Erro ao fazer login');
      }
    } catch {
      setLoginError('Erro de conexão');
    } finally {
      setLoginLoading(false);
    }
  };

  // Save GA settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSaved(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ga_tracking_id: gaTrackingId }),
      });

      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setSettingsLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setPasswordMsg('Senha atualizada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMsg(''), 3000);
      } else {
        setPasswordError(data.error || 'Erro ao trocar senha');
      }
    } catch {
      setPasswordError('Erro de conexão');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <p className="admin-loading">Carregando...</p>
        </div>
      </div>
    );
  }

  // ==================== LOGIN SCREEN ====================
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
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  autoFocus
                  required
                />
              </div>

              {loginError && <p className="error-msg">{loginError}</p>}

              <button
                type="submit"
                className="btn-admin-primary"
                disabled={loginLoading}
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD ====================
  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <h1>⚙️ Admin — Liberdade Financeira</h1>
          <button className="btn-admin-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="admin-container">
        {/* Google Analytics Card */}
        <div className="admin-card">
          <h2>📊 Google Analytics</h2>
          <p className="card-description">
            Cole o ID de rastreamento do Google Analytics (ex:{' '}
            <code>G-XXXXXXXXXX</code>). O script será injetado automaticamente
            em todas as páginas.
          </p>

          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label htmlFor="gaId">Measurement ID</label>
              <input
                id="gaId"
                type="text"
                value={gaTrackingId}
                onChange={(e) => setGaTrackingId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-admin-primary"
                disabled={settingsLoading}
              >
                {settingsLoading ? 'Salvando...' : 'Salvar'}
              </button>
              {settingsSaved && (
                <span className="success-msg">✓ Salvo com sucesso!</span>
              )}
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="admin-card">
          <h2>🔑 Trocar Senha</h2>
          <p className="card-description">
            Atualize a senha de acesso ao painel administrativo.
          </p>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label htmlFor="currentPwd">Senha atual</label>
              <input
                id="currentPwd"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Senha atual"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPwd">Nova senha</label>
              <input
                id="newPwd"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha (mín. 6 caracteres)"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPwd">Confirmar nova senha</label>
              <input
                id="confirmPwd"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
              />
            </div>

            {passwordError && <p className="error-msg">{passwordError}</p>}
            {passwordMsg && <p className="success-msg">{passwordMsg}</p>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn-admin-primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
