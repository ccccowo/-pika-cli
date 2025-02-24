import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@material-ui/core';
import { TemplateList } from './components/TemplateList';
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

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main className={cn(
        "min-h-screen bg-background",
        "p-4 md:p-8"
      )}>
        <div className="max-w-6xl mx-auto space-y-8">
          <TemplateList 
            selectedId={selectedTemplate} 
            onSelect={setSelectedTemplate} 
          />
        </div>
      </main>
    </ThemeProvider>
  );
} 