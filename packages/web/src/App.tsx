import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Tabs, Tab, Box } from '@material-ui/core';
import { TemplateList } from './components/TemplateList';
import { ProjectSuccessPage } from './components/ProjectSuccessPage';
import { TemplateManager } from './components/TemplateManager';
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

  const handleProjectCreated = (projectInfo: ProjectSuccessInfo) => {
    setSuccessInfo(projectInfo);
    setShowSuccessPage(true);
  };

  const handleBackToHome = () => {
    setShowSuccessPage(false);
    setSuccessInfo(null);
    setSelectedTemplate(undefined);
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setCurrentTab(newValue);
  };

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
      <main className={cn(
        "min-h-screen bg-background",
        "p-4 md:p-8"
      )}>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 导航标签 */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 4 }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label="🏠 官方模板" />
              <Tab label="📚 我的模板" />
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
      </main>
    </ThemeProvider>
  );
} 