import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  makeStyles,
  fade
} from '@material-ui/core';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon
} from '@material-ui/icons';
import { checkDeploymentStatus, type DeploymentStatus } from '../services/project';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: fade(theme.palette.background.paper, 0.8),
    borderRadius: theme.spacing(1),
    border: `1px solid ${fade(theme.palette.divider, 0.1)}`,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  statusIcon: {
    marginRight: theme.spacing(1),
    fontSize: 20,
  },
  progress: {
    marginTop: theme.spacing(1),
  },
  statusChip: {
    marginLeft: theme.spacing(1),
  },
}));

interface DeploymentStatusProps {
  token: string;
  repoUrl: string;
  pagesUrl?: string;
  onStatusChange?: (status: DeploymentStatus) => void;
}

export function DeploymentStatusComponent({ 
  token, 
  repoUrl, 
  pagesUrl, 
  onStatusChange 
}: DeploymentStatusProps) {
  const classes = useStyles();
  const [status, setStatus] = useState<DeploymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    if (!token || !repoUrl) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await checkDeploymentStatus(token, repoUrl);
      setStatus(result);
      onStatusChange?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查状态失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始检查
  useEffect(() => {
    checkStatus();
  }, [token, repoUrl]);

  // 定期检查状态（如果还在构建中）
  useEffect(() => {
    if (!status?.isBuilding) return;

    const interval = setInterval(() => {
      checkStatus();
    }, 30000); // 每30秒检查一次

    return () => clearInterval(interval);
  }, [status?.isBuilding]);

  const getStatusIcon = () => {
    if (loading) return <ScheduleIcon className={classes.statusIcon} />;
    if (error) return <ErrorIcon className={classes.statusIcon} color="error" />;
    if (status?.isDeployed) return <CheckCircleIcon className={classes.statusIcon} color="primary" />;
    if (status?.isBuilding) return <BuildIcon className={classes.statusIcon} color="action" />;
    return <ScheduleIcon className={classes.statusIcon} />;
  };

  const getStatusText = () => {
    if (loading) return '检查状态中...';
    if (error) return '检查失败';
    if (status?.isDeployed) return '部署完成';
    if (status?.isBuilding) return '正在构建...';
    return '等待部署';
  };

  const getStatusColor = (): 'default' | 'primary' | 'secondary' => {
    if (error) return 'default';
    if (status?.isDeployed) return 'primary';
    if (status?.isBuilding) return 'secondary';
    return 'default';
  };

  if (!token || !repoUrl) {
    return null;
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Typography variant="subtitle2">
          🌐 GitHub Pages 部署状态
        </Typography>
        <Tooltip title="刷新状态">
          <IconButton 
            size="small" 
            onClick={checkStatus}
            disabled={loading}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box className={classes.statusRow}>
        {getStatusIcon()}
        <Typography variant="body2">
          {getStatusText()}
        </Typography>
        <Chip 
          label={status?.pages.status || 'unknown'} 
          size="small" 
          color={getStatusColor()}
          className={classes.statusChip}
        />
      </Box>

      {status?.isBuilding && (
        <LinearProgress 
          className={classes.progress}
          color="primary"
        />
      )}

      {status?.isDeployed && pagesUrl && (
        <Typography variant="caption" color="textSecondary">
          🎉 网站已成功部署！访问地址: {pagesUrl}
        </Typography>
      )}

      {error && (
        <Typography variant="caption" color="error">
          ❌ {error}
        </Typography>
      )}

      {status?.workflow.status && (
        <Typography variant="caption" color="textSecondary" display="block">
          工作流状态: {status.workflow.status}
          {status.workflow.conclusion && ` (${status.workflow.conclusion})`}
        </Typography>
      )}
    </Box>
  );
}

