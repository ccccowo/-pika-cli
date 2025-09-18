import React, { useState } from 'react';
import { Button, Box, CircularProgress } from '@material-ui/core';
import { GitHub as GitHubIcon } from '@material-ui/icons';
import { getGitHubLoginUrl } from '../services/auth';

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // 立即跳转，但保持加载状态
    window.location.href = getGitHubLoginUrl();
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <GitHubIcon />}
      onClick={handleLogin}
      disabled={isLoading}
      sx={{
        backgroundColor: '#24292e',
        '&:hover': {
          backgroundColor: '#1a1e22',
        },
        '&:disabled': {
          backgroundColor: '#6c757d',
        },
        textTransform: 'none',
        fontWeight: 500,
        px: 3,
        py: 1,
      }}
    >
      {isLoading ? '正在跳转...' : '使用 GitHub 登录'}
    </Button>
  );
}
