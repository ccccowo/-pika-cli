import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logout as logoutService, User } from '../services/auth';
import { useNotification } from '../components/NotificationProvider';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const { showNotification } = useNotification();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // 检查登录状态
  const checkAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await getCurrentUser();
      if (response.success && response.user) {
        setAuthState({
          user: response.user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // 登出
  const logout = useCallback(async () => {
    try {
      const success = await logoutService();
      if (success) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('登出失败:', error);
    }
  }, []);

  // 更新用户信息
  const updateUser = useCallback((user: User | null) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  }, []);

  // 组件挂载时检查登录状态
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 监听 URL 参数变化，处理登录回调
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginStatus = urlParams.get('login');
    
    if (loginStatus === 'success') {
      console.log('🎉 检测到登录成功，重新检查用户状态');
      // 显示登录成功提示
      showNotification('🎉 登录成功！欢迎使用 Pika CLI', 'success', 4000);
      // 清除 URL 参数
      window.history.replaceState({}, document.title, window.location.pathname);
      // 重新检查用户状态
      checkAuth();
    } else if (loginStatus === 'error') {
      const message = urlParams.get('message');
      console.error('❌ 登录失败:', message);
      // 显示登录失败提示
      const errorMessage = message === '认证超时，请重试' 
        ? '⏰ 登录超时，请检查网络连接后重试' 
        : `❌ 登录失败: ${message || '未知错误'}`;
      showNotification(errorMessage, 'error', 6000);
      // 清除 URL 参数
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkAuth, showNotification]);

  return {
    ...authState,
    checkAuth,
    logout,
    updateUser,
  };
}
