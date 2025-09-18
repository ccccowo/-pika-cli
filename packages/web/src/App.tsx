import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Tabs, Tab, Box, AppBar, Toolbar, Typography, Container } from '@material-ui/core';
import { TemplateList } from './components/TemplateList';
import { ProjectSuccessPage } from './components/ProjectSuccessPage';
import { TemplateManager } from './components/TemplateManager';
import { UserAvatar } from './components/UserAvatar';
import { LoginButton } from './components/LoginButton';
import { useAuth } from './hooks/useAuth';
import type { TemplateId } from './types';
import { cn } from './lib/utils';

// 创建主题
const theme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  }
});

interface ProjectSuccessInfo {
  projectName: string;
  repoUrl: string;
  nextSteps: string[];
  createdAt?: string;
}

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>();
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [successInfo, setSuccessInfo] = useState<ProjectSuccessInfo | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleProjectCreated = (projectInfo: ProjectSuccessInfo) => {
    setSuccessInfo(projectInfo);
    setShowSuccessPage(true);
  };

  const handleBackToHome = () => {
    setShowSuccessPage(false);
    setSuccessInfo(null);
    setSelectedTemplate(undefined);
  };

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setCurrentTab(newValue);
  };

  // 处理 GitHub 登录回调
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginStatus = urlParams.get('login');
    
    if (loginStatus === 'success') {
      // 登录成功，重新检查用户状态
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (showSuccessPage && successInfo) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ProjectSuccessPage 
          projectInfo={successInfo}
          onBackToHome={handleBackToHome}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            🚀 Pika CLI
          </Typography>
          {isLoading ? (
            <Typography variant="body2">加载中...</Typography>
          ) : isAuthenticated && user ? (
            <UserAvatar user={user} onLogout={logout} />
          ) : (
            <LoginButton />
          )}
        </Toolbar>
      </AppBar>
      
      <main className={cn(
        "min-h-screen bg-background",
        "p-4 md:p-8"
      )}>
        <Container maxWidth="lg">
          <div className="space-y-8">
            {/* 导航标签 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 4 }}>
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab label="🏠 官方模板" />
                <Tab label="📚 我的模板" disabled={!isAuthenticated} />
              </Tabs>
            </Box>

          {/* 内容区域 */}
          {currentTab === 0 && (
            <TemplateList 
              selectedId={selectedTemplate} 
              onSelect={setSelectedTemplate}
              onProjectCreated={handleProjectCreated}
            />
          )}
          
            {currentTab === 1 && (
              <TemplateManager 
                onTemplateSelect={(template) => {
                  // 将自定义模板转换为标准格式
                  const customTemplate = {
                    id: template.id,
                    name: template.name,
                    description: template.description,
                    scaffold: template.scaffold,
                    templateOwner: template.templateOwner,
                    templateRepo: template.templateRepo,
                  };
                  setSelectedTemplate(customTemplate as any);
                }}
              />
            )}
          </div>
        </Container>
      </main>
    </ThemeProvider>
  );
} 