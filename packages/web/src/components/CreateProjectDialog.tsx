import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Typography,
  makeStyles,
  fade,
  Snackbar,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Link,
} from '@material-ui/core';
import type { ProjectOptions, ScaffoldId } from '../types';
import { createProject, selectFolder } from '../services/project';

// 添加 FileSystem API 类型声明
declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite'
    }): Promise<FileSystemDirectoryHandle>;
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiDialog-paper': {
      width: '100%',
      maxWidth: 600,
      backgroundColor: theme.palette.background.paper,
    }
  },
  title: {
    borderBottom: `1px solid ${fade(theme.palette.divider, 0.1)}`,
    padding: theme.spacing(3),
    '& h2': {
      fontSize: '1.5rem',
      fontWeight: 600,
    }
  },
  content: {
    padding: theme.spacing(3),
  },
  field: {
    marginBottom: theme.spacing(3),
  },
  githubSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: fade(theme.palette.primary.main, 0.05),
    borderRadius: theme.shape.borderRadius,
  },
  actions: {
    padding: theme.spacing(2, 3),
    borderTop: `1px solid ${fade(theme.palette.divider, 0.1)}`,
  },
  pathField: {
    '& .MuiInputBase-root': {
      paddingRight: 0,
    },
  },
  hiddenInput: {
    display: 'none'
  },
  commandDialog: {
    backgroundColor: fade(theme.palette.background.paper, 0.9),
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
  },
  commandText: {
    fontFamily: 'monospace',
    backgroundColor: fade(theme.palette.background.default, 0.6),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto',
    marginBottom: theme.spacing(2),
  },
  copyButton: {
    marginLeft: theme.spacing(1),
  },
}));

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

// 脚手架选项
const scaffoldOptions: Array<{ value: ScaffoldId; label: string }> = [
  { value: 'vite', label: 'Vite' },
  { value: 'next', label: 'Next.js' }
];

// 框架选项
const frameworkOptions = [
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'preact', label: 'Preact' },
  { value: 'lit', label: 'Lit' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
  { value: 'angular', label: 'Angular' }
];

// 变体选项
const variantOptions = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'typescript-swc', label: 'TypeScript + SWC' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'javascript-swc', label: 'JavaScript + SWC' }
];

export function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps) {
  const classes = useStyles();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectPath, setProjectPath] = useState('');
  const [scaffold, setScaffold] = useState<ScaffoldId>('vite');
  const [framework, setFramework] = useState('react');
  const [variant, setVariant] = useState('typescript');
  const [createGithub, setCreateGithub] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [description, setDescription] = useState('');
  const [token, setToken] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    localPath: string;
    projectName: string;
    framework: string;
    variant: string;
    scaffold: ScaffoldId;
    nextSteps: string[];
  } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const options: ProjectOptions = {
        scaffold,
        name: projectName,
        projectPath,
        framework: scaffold === 'vite' ? framework : undefined,
        variant: scaffold === 'vite' ? variant : undefined,
        createGithub,
        isPrivate,
        description,
        token
      };

      const result = await createProject(options);
      
      if (result.success) {
        // 先关闭创建对话框
        onClose();

        // 显示成功对话框
        setSuccessDialogOpen(true);
        setSuccessInfo({
          localPath: result.localPath,
          projectName: result.projectName || projectName,
          framework: result.framework || framework,
          variant: result.variant || variant,
          scaffold: scaffold,
          nextSteps: result.nextSteps || [
            `cd ${projectName}`,
            'pnpm install',
            'pnpm run dev'
          ]
        });

        // 显示成功提示
        setSnackbarMessage({
          type: 'success',
          text: '✨ 项目创建成功！'
        });
      } else {
        setSnackbarMessage({
          type: 'error',
          text: result.error || '创建失败，请重试'
        });
      }
    } catch (error) {
      setSnackbarMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '创建失败，请重试'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} className={classes.root}>
        <DialogTitle className={classes.title}>
          创建新项目
        </DialogTitle>
        <DialogContent className={classes.content}>
          <FormControl fullWidth variant="outlined" className={classes.field}>
            <InputLabel>选择脚手架</InputLabel>
            <Select
              value={scaffold}
              onChange={(e) => setScaffold(e.target.value as ScaffoldId)}
              label="选择脚手架"
            >
              {scaffoldOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {scaffold === 'vite' && (
            <>
              <FormControl fullWidth variant="outlined" className={classes.field}>
                <InputLabel>选择框架</InputLabel>
                <Select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value as string)}
                  label="选择框架"
                >
                  {frameworkOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined" className={classes.field}>
                <InputLabel>选择变体</InputLabel>
                <Select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value as string)}
                  label="选择变体"
                >
                  {variantOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          <TextField
            fullWidth
            label="项目名称"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={classes.field}
            variant="outlined"
            placeholder="my-app"
          />
          
          <TextField
            fullWidth
            label="项目路径"
            value={projectPath}
            onChange={(e) => setProjectPath(e.target.value)}
            className={classes.field}
            variant="outlined"
            placeholder="请输入项目路径，例如：D:\projects"
            helperText="请输入完整的项目路径"
          />

          <FormControlLabel
            control={
              <Switch
                checked={createGithub}
                onChange={(e) => setCreateGithub(e.target.checked)}
                color="primary"
              />
            }
            label="同时创建 GitHub 仓库"
          />

          {createGithub && (
            <Box className={classes.githubSection}>
              <Typography variant="subtitle2" gutterBottom>
                GitHub 仓库设置
              </Typography>
              
              <TextField
                fullWidth
                label="GitHub Token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className={classes.field}
                variant="outlined"
                size="small"
              />
              
              <TextField
                fullWidth
                label="仓库描述"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={classes.field}
                variant="outlined"
                size="small"
                multiline
                rows={2}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    color="primary"
                  />
                }
                label="设为私有仓库"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading || !projectName || !projectPath}
          >
            {loading ? '创建中...' : '创建项目'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 成功提示对话框 */}
      <Dialog 
        open={successDialogOpen} 
        onClose={() => setSuccessDialogOpen(false)}
        className={classes.root}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className={classes.title}>
          ✨ 项目创建成功
        </DialogTitle>
        <DialogContent className={classes.content}>
          {successInfo && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                项目信息：
              </Typography>
              <Box className={classes.commandText}>
                <Typography>📁 本地路径：{successInfo.localPath}</Typography>
                <Typography>📦 项目名称：{successInfo.projectName}</Typography>
                <Typography>🛠️ 脚手架：{scaffoldOptions.find(opt => opt.value === successInfo.scaffold)?.label}</Typography>
                <Typography>⚛️ 框架：{frameworkOptions.find(opt => opt.value === successInfo.framework)?.label}</Typography>
                <Typography>🔧 变体：{variantOptions.find(opt => opt.value === successInfo.variant)?.label}</Typography>
              </Box>

              <Typography variant="subtitle1" style={{ marginTop: theme.spacing(2) }}>
                下一步操作：
              </Typography>
              <Box className={classes.commandText}>
                {successInfo.nextSteps.map((step, index) => (
                  <Typography key={index} style={{ fontFamily: 'monospace' }}>
                    $ {step}
                  </Typography>
                ))}
              </Box>

              <Typography variant="body2" color="textSecondary" style={{ marginTop: theme.spacing(2) }}>
                提示：项目创建后，请按照上述步骤进行初始化和启动。
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button 
            onClick={() => setSuccessDialogOpen(false)}
            color="primary"
          >
            关闭
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // 可以添加打开项目目录的功能
              window.open(`file://${successInfo?.localPath}`);
            }}
          >
            打开项目目录
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage?.text}
        ContentProps={{
          style: {
            backgroundColor: snackbarMessage?.type === 'success' 
              ? theme.palette.success.main 
              : theme.palette.error.main
          }
        }}
      />
    </>
  );
} 