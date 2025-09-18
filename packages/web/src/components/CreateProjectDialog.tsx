import { useState } from 'react';
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
  Link,
} from '@material-ui/core';
import type { ProjectOptions, ScaffoldId, TemplateConfig } from '../types';
import { createProject } from '../services/project';
import { scaffolds } from '../config/templates';


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

interface ProjectSuccessInfo {
  projectName: string;
  repoUrl: string;
  nextSteps: string[];
  createdAt?: string;
}

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  template?: TemplateConfig;
  onProjectCreated?: (projectInfo: ProjectSuccessInfo) => void;
}



export function CreateProjectDialog({ open, onClose, template, onProjectCreated }: CreateProjectDialogProps) {
  const classes = useStyles();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [createGithub] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [description, setDescription] = useState('');
  const [token, setToken] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    projectName: string;
    repoUrl?: string;
    nextSteps: string[];
  } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 使用传入的模板，如果没有则使用默认模板
      const tpl = template || (scaffolds[0].templates as TemplateConfig[]).find(t => t.id === 'vite-react-ts') as TemplateConfig;
      
      if (!tpl) {
        throw new Error('未找到可用的模板');
      }

      const options: ProjectOptions = {
        scaffold: tpl.scaffold as ScaffoldId,
        name: projectName,
        templateOwner: tpl.templateOwner,
        templateRepo: tpl.templateRepo,
        createGithub: true,
        isPrivate,
        description,
        token
      };

      const result = await createProject(options);
      
      if (result.success) {
        // 先关闭创建对话框
        onClose();

        // 准备成功信息
        const successInfo = {
          projectName: result.projectName || projectName,
          repoUrl: result.repoUrl || '',
          nextSteps: result.nextSteps || [
            `git clone ${result.repoUrl}`,
            `cd ${result.projectName || projectName}`,
            'npm install',
            'npm run dev'
          ],
          createdAt: new Date().toISOString()
        };

        // 如果有成功回调，调用它跳转到成功页面
        if (onProjectCreated) {
          onProjectCreated(successInfo);
        } else {
          // 否则显示成功对话框（向后兼容）
          setSuccessDialogOpen(true);
          setSuccessInfo(successInfo);
        }

        // 显示成功提示
        setSnackbarMessage({
          type: 'success',
          text: '🎉 项目创建成功！正在跳转到成功页面...'
        });
      } else {
        // 根据错误类型显示不同的友好提示
        let errorMessage = result.error || '创建失败，请重试';
        
        if (errorMessage.includes('同名仓库已存在')) {
          errorMessage = '😅 仓库名称已被占用，请尝试其他名称（如：MyProject123、TestApp2024 等）';
        } else if (errorMessage.includes('无效的 GitHub Token')) {
          errorMessage = '🔑 GitHub Token 无效，请检查 Token 是否正确或是否已过期';
        } else if (errorMessage.includes('缺少模板仓库信息')) {
          errorMessage = '⚠️ 模板配置错误，请联系管理员';
        } else if (errorMessage.includes('权限')) {
          errorMessage = '🚫 权限不足，请确保 Token 有创建仓库的权限';
        } else if (errorMessage.includes('HTTP error! status: 400')) {
          errorMessage = '❌ 请求参数错误，请检查输入信息';
        } else if (errorMessage.includes('HTTP error! status: 401')) {
          errorMessage = '🔐 认证失败，请检查 GitHub Token';
        } else if (errorMessage.includes('HTTP error! status: 403')) {
          errorMessage = '🚫 权限不足，请检查 Token 权限';
        } else if (errorMessage.includes('HTTP error! status: 404')) {
          errorMessage = '🔍 模板仓库不存在，请检查仓库地址';
        } else if (errorMessage.includes('HTTP error! status: 500')) {
          errorMessage = '⚠️ 服务器内部错误，请稍后重试';
        } else {
          // 如果后端返回了其他错误信息，直接显示
          errorMessage = result.error || '创建失败，请重试';
        }
        
        setSnackbarMessage({
          type: 'error',
          text: errorMessage
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
          <TextField
            fullWidth
            label="项目名称"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={classes.field}
            variant="outlined"
            placeholder="my-app"
          />
          

          {/* 默认创建 GitHub 仓库，不展示开关 */}

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
            disabled={loading || !projectName || !token}
          >
            {loading ? '🚀 创建中...' : '✨ 创建项目'}
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
          🎉 项目创建成功！
        </DialogTitle>
        <DialogContent className={classes.content}>
          {successInfo && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                项目信息：
              </Typography>
              <Box className={classes.commandText}>
                <Typography>📦 项目名称：{successInfo.projectName}</Typography>
                {successInfo.repoUrl && (
                  <Typography>🔗 仓库地址：<Link href={successInfo.repoUrl} target="_blank" rel="noopener">{successInfo.repoUrl}</Link></Typography>
                )}
              </Box>

              <Typography variant="subtitle2" gutterBottom style={{ marginTop: theme.spacing(2) }}>
                下一步操作：
              </Typography>
              <Box className={classes.commandText}>
                {successInfo.nextSteps.map((step, index) => (
                  <Typography key={index} component="div">
                    {index + 1}. {step}
                  </Typography>
                ))}
              </Box>

              <Typography variant="body2" color="textSecondary" style={{ marginTop: theme.spacing(2) }}>
                💡 提示：您的项目已成功创建！请按照上述步骤克隆仓库并开始开发。
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
          {successInfo?.repoUrl && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              window.open(successInfo.repoUrl, '_blank');
            }}
          >
            🚀 打开 GitHub 仓库
          </Button>
          )}
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