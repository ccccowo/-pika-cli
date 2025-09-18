import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar } from '@material-ui/core';
import { Alert, AlertProps } from '@material-ui/lab';

interface Notification {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, severity: AlertProps['severity'], duration?: number) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((
    message: string, 
    severity: AlertProps['severity'] = 'info', 
    duration: number = 6000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      message,
      severity: severity as any,
      duration,
    };

    setNotifications(prev => [...prev, notification]);

    // 自动隐藏通知
    if (duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      
      {/* 渲染所有通知 */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => hideNotification(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          style={{ marginTop: 64 }} // 避免被 AppBar 遮挡
        >
          <Alert
            onClose={() => hideNotification(notification.id)}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
}
