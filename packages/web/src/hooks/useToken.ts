import { useState, useEffect } from 'react';
import type { TokenConfig } from '../types';

const TOKEN_KEY = 'github_token';

export function useToken() {
  const [token, setToken] = useState<TokenConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载 Token
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      try {
        const tokenConfig = JSON.parse(savedToken) as TokenConfig;
        // 检查 Token 是否过期
        if (tokenConfig.expiresAt && new Date(tokenConfig.expiresAt) > new Date()) {
          setToken(tokenConfig);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  // 保存 Token
  const saveToken = (newToken: string, expiresIn: number = 30) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);
    
    const tokenConfig: TokenConfig = {
      token: newToken,
      expiresAt: expiresAt.toISOString()
    };
    
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenConfig));
    setToken(tokenConfig);
  };

  // 清除 Token
  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return {
    token,
    loading,
    saveToken,
    clearToken
  };
} 