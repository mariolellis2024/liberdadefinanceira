import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getPasswordHash, updatePassword } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'liberdade-financeira-secret-2026';
const TOKEN_EXPIRY = '24h';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: 'Senha é obrigatória' });
    return;
  }

  const hash = await getPasswordHash();
  const valid = await bcrypt.compare(password, hash);

  if (!valid) {
    res.status(401).json({ error: 'Senha incorreta' });
    return;
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24h
  });

  res.json({ success: true });
}

export async function changePassword(
  req: Request,
  res: Response
): Promise<void> {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
    return;
  }

  const hash = await getPasswordHash();
  const valid = await bcrypt.compare(currentPassword, hash);

  if (!valid) {
    res.status(401).json({ error: 'Senha atual incorreta' });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await updatePassword(newHash);

  res.json({ success: true, message: 'Senha atualizada com sucesso' });
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie('token');
  res.json({ success: true });
}
