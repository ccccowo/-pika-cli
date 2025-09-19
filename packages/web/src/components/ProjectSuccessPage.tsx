import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  makeStyles,
  fade,
  Link,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@material-ui/core';
import {
  GitHub,
  FileCopy as ContentCopy,
  OpenInNew,
  CheckCircle,
  Code,
  CloudDownload as Download
} from '@material-ui/icons';
import { DeploymentStatusComponent } from './DeploymentStatus';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${fade(theme.palette.primary.main, 0.1)} 0%, ${fade(theme.palette.secondary.main, 0.1)} 100%)`,
    padding: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    maxWidth: 800,
    width: '100%'
  },
  successCard: {
    background: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[8],
    overflow: 'hidden'
  },
  header: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(4),
    textAlign: 'center'
  },
  successIcon: {
    fontSize: 64,
    marginBottom: theme.spacing(2),
    color: theme.palette.success.main
  },
  content: {
    padding: theme.spacing(4)
  },
  projectInfo: {
    marginBottom: theme.spacing(3)
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main
    }
  },
  repoUrl: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: fade(theme.palette.background.default, 0.5),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    wordBreak: 'break-all'
  },
  copyButton: {
    marginLeft: theme.spacing(1)
  },
  stepsCard: {
    marginTop: theme.spacing(3),
    backgroundColor: fade(theme.palette.background.default, 0.3)
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    border: `1px solid ${fade(theme.palette.divider, 0.1)}`
  },
  stepNumber: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: '50%',
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginRight: theme.spacing(2),
    flexShrink: 0
  },
  stepCode: {
    fontFamily: 'monospace',
    backgroundColor: fade(theme.palette.background.default, 0.8),
    padding: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
    fontSize: '0.9rem',
    flex: 1
  },
  actionButtons: {
    marginTop: theme.spacing(4),
    display: 'flex',
    gap: theme.spacing(2),
    flexWrap: 'wrap'
  },
  statusChip: {
    marginLeft: theme.spacing(1)
  }
}));

interface ProjectSuccessInfo {
  projectName: string;
  repoUrl: string;
  nextSteps: string[];
  createdAt?: string;
  pagesUrl?: string;
  pagesEnabled?: boolean;
  token?: string;
}

interface ProjectSuccessPageProps {
  projectInfo: ProjectSuccessInfo;
  onBackToHome?: () => void;
}

export function ProjectSuccessPage({ projectInfo, onBackToHome }: ProjectSuccessPageProps) {
  const classes = useStyles();
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(projectInfo.repoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleOpenRepo = () => {
    window.open(projectInfo.repoUrl, '_blank');
  };

  const handleDownloadZip = () => {
    const downloadUrl = projectInfo.repoUrl.replace('github.com', 'github.com/archive/refs/heads/main.zip');
    window.open(downloadUrl, '_blank');
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.container}>
        <Card className={classes.successCard}>
          {/* 头部 */}
          <Box className={classes.header}>
            <CheckCircle className={classes.successIcon} />
            <Typography variant="h4" component="h1" gutterBottom>
              🎉 项目创建成功！
            </Typography>
            <Typography variant="h6" color="inherit">
              您的项目已成功创建并推送到 GitHub
            </Typography>
          </Box>

          {/* 内容 */}
          <CardContent className={classes.content}>
            {/* 项目信息 */}
            <Box className={classes.projectInfo}>
              <Typography variant="h5" gutterBottom>
                📦 项目信息
              </Typography>
              
              <Box className={classes.infoRow}>
                <Code />
                <Typography variant="body1">
                  <strong>项目名称：</strong>
                  {projectInfo.projectName}
                  <Chip 
                    label="已创建" 
                    color="primary" 
                    size="small" 
                    className={classes.statusChip}
                  />
                </Typography>
              </Box>

              <Box className={classes.infoRow}>
                <GitHub />
                <Typography variant="body1">
                  <strong>GitHub 仓库：</strong>
                </Typography>
              </Box>

              <Box className={classes.repoUrl}>
                <Typography component="span" style={{ flex: 1 }}>
                  {projectInfo.repoUrl}
                </Typography>
                <Tooltip title={copied ? "已复制!" : "复制链接"}>
                  <IconButton 
                    size="small" 
                    onClick={handleCopyUrl}
                    className={classes.copyButton}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* GitHub Pages 信息 */}
              {projectInfo.pagesEnabled && projectInfo.pagesUrl && (
                <>
                  <Box className={classes.infoRow}>
                    <OpenInNew />
                    <Typography variant="body1">
                      <strong>网站地址：</strong>
                    </Typography>
                  </Box>

                  <Box className={classes.repoUrl}>
                    <Typography component="span" style={{ flex: 1 }}>
                      {projectInfo.pagesUrl}
                    </Typography>
                    <Tooltip title="打开网站">
                      <IconButton 
                        size="small" 
                        onClick={() => window.open(projectInfo.pagesUrl, '_blank')}
                        className={classes.copyButton}
                      >
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </>
              )}
            </Box>

            <Divider style={{ margin: '24px 0' }} />

            {/* GitHub Pages 部署状态 */}
            {projectInfo.pagesEnabled && projectInfo.token && (
              <>
                <DeploymentStatusComponent
                  token={projectInfo.token}
                  repoUrl={projectInfo.repoUrl}
                  pagesUrl={projectInfo.pagesUrl}
                />
                <Divider style={{ margin: '24px 0' }} />
              </>
            )}

            {/* 下一步操作 */}
            <Box>
              <Typography variant="h5" gutterBottom>
                🚀 下一步操作
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                请按照以下步骤开始开发您的项目：
              </Typography>

              <Box className={classes.stepsCard}>
                {projectInfo.nextSteps.map((step, index) => (
                  <Box key={index} className={classes.stepItem}>
                    <Box className={classes.stepNumber}>
                      {index + 1}
                    </Box>
                    <Box className={classes.stepCode}>
                      {step}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* 操作按钮 */}
            <Box className={classes.actionButtons}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<GitHub />}
                onClick={handleOpenRepo}
              >
                打开 GitHub 仓库
              </Button>
              
              {projectInfo.pagesEnabled && projectInfo.pagesUrl && (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<OpenInNew />}
                  onClick={() => window.open(projectInfo.pagesUrl, '_blank')}
                >
                  打开网站
                </Button>
              )}
              
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<Download />}
                onClick={handleDownloadZip}
              >
                下载 ZIP
              </Button>
              
              {onBackToHome && (
                <Button
                  variant="text"
                  size="large"
                  onClick={onBackToHome}
                >
                  返回首页
                </Button>
              )}
            </Box>

            {/* 提示信息 */}
            <Box style={{ marginTop: 24, padding: 16, backgroundColor: fade('#4caf50', 0.1), borderRadius: 8 }}>
              <Typography variant="body2" color="textSecondary">
                💡 <strong>提示：</strong> 您的项目已成功创建！现在可以克隆仓库到本地开始开发了。
                {projectInfo.pagesEnabled && (
                  <> 网站将在几分钟后自动部署完成，请耐心等待。</>
                )}
                如果遇到任何问题，请检查 GitHub 仓库设置或联系技术支持。
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}