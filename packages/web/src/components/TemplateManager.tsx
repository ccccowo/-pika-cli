import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  makeStyles,
  fade,
  Grid,
  Paper,
  Divider,
  Snackbar
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GitHub as GitHubIcon,
  Visibility as PreviewIcon,
  Share as ShareIcon,
  Download as DownloadIcon
} from '@material-ui/icons';
import { 
  getMyTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  Template 
} from '../services/templates';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  templateCard: {
    height: '100%',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
  templateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
  },
  templateActions: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  templateInfo: {
    marginBottom: theme.spacing(2),
  },
  templateTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
  addButton: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    color: 'white',
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    },
  },
  formField: {
    marginBottom: theme.spacing(3),
  },
  previewSection: {
    backgroundColor: fade(theme.palette.background.default, 0.5),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
}));

interface CustomTemplate {
  id: number;
  name: string;
  description?: string;
  templateOwner: string;
  templateRepo: string;
  scaffold: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface TemplateManagerProps {
  onTemplateSelect?: (template: CustomTemplate) => void;
}

export function TemplateManager({ onTemplateSelect }: TemplateManagerProps) {
  const classes = useStyles();
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateOwner: '',
    templateRepo: '',
    scaffold: 'vite',
    tags: [] as string[],
    isPublic: false,
  });

  // 加载模板列表
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await getMyTemplates();
      if (response.success) {
        // 将 API 返回的模板转换为 CustomTemplate 格式
        const customTemplates: CustomTemplate[] = response.templates.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description,
          templateOwner: template.owner,
          templateRepo: template.repo,
          scaffold: 'vite', // 默认值，实际应该从模板配置中获取
          tags: template.tags,
          isPublic: template.isPublic,
          createdAt: template.createdAt,
        }));
        setTemplates(customTemplates);
      } else {
        setSnackbar({
          open: true,
          message: '加载模板失败',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('加载模板失败:', error);
      setSnackbar({
        open: true,
        message: '加载模板失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // 显示消息
  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      templateOwner: '',
      templateRepo: '',
      scaffold: 'vite',
      tags: [],
      isPublic: false,
    });
    setOpenDialog(true);
  };

  const handleEditTemplate = (template: CustomTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      templateOwner: template.templateOwner,
      templateRepo: template.templateRepo,
      scaffold: template.scaffold,
      tags: template.tags,
      isPublic: template.isPublic,
    });
    setOpenDialog(true);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (window.confirm('确定要删除这个模板吗？')) {
      try {
        const response = await deleteTemplate(templateId);
        if (response.success) {
          showMessage('模板删除成功');
          loadTemplates(); // 重新加载模板列表
        } else {
          showMessage(response.error || '删除失败', 'error');
        }
      } catch (error) {
        console.error('删除模板失败:', error);
        showMessage('删除模板失败', 'error');
      }
    }
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.templateOwner || !formData.templateRepo) {
      showMessage('请填写必要信息', 'error');
      return;
    }

    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        owner: formData.templateOwner,
        repo: formData.templateRepo,
        isPublic: formData.isPublic,
        tags: formData.tags,
      };

      let response;
      if (editingTemplate) {
        response = await updateTemplate({
          id: editingTemplate.id,
          ...templateData,
        });
      } else {
        response = await createTemplate(templateData);
      }

      if (response.success) {
        showMessage(editingTemplate ? '模板更新成功' : '模板创建成功');
        setOpenDialog(false);
        loadTemplates(); // 重新加载模板列表
      } else {
        showMessage(response.error || '保存失败', 'error');
      }
    } catch (error) {
      console.error('保存模板失败:', error);
      showMessage('保存模板失败', 'error');
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Box className={classes.root}>
      {/* 头部 */}
      <Box className={classes.header}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            📚 我的模板库
          </Typography>
          <Typography variant="body1" color="textSecondary">
            管理您的自定义项目模板，支持 GitHub 模板仓库
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTemplate}
          className={classes.addButton}
          size="large"
        >
          添加模板
        </Button>
      </Box>

      {/* 模板列表 */}
      <Grid container spacing={3}>
        {templates.length === 0 ? (
          <Grid item xs={12}>
            <Paper style={{ padding: 48, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                🎯 还没有自定义模板
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                点击"添加模板"开始创建您的第一个自定义模板
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddTemplate}
              >
                立即添加
              </Button>
            </Paper>
          </Grid>
        ) : (
          templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card className={classes.templateCard}>
                <CardContent>
                  <Box className={classes.templateHeader}>
                    <Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {template.scaffold} • {template.isPublic ? '公开' : '私有'}
                      </Typography>
                    </Box>
                    <Box className={classes.templateActions}>
                      <Tooltip title="编辑">
                        <IconButton
                          size="small"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box className={classes.templateInfo}>
                    <Typography variant="body2" paragraph>
                      {template.description || '暂无描述'}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" marginBottom={1}>
                      <GitHubIcon fontSize="small" style={{ marginRight: 8 }} />
                      <Typography variant="caption" color="textSecondary">
                        {template.templateOwner}/{template.templateRepo}
                      </Typography>
                    </Box>

                    {template.tags.length > 0 && (
                      <Box className={classes.templateTags}>
                        {template.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  <Divider style={{ margin: '16px 0' }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="textSecondary">
                      更新于 {new Date(template.updatedAt).toLocaleDateString()}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onTemplateSelect?.(template)}
                    >
                      使用模板
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* 添加/编辑模板对话框 */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTemplate ? '编辑模板' : '添加新模板'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="模板名称"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={classes.formField}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className={classes.formField}>
                <InputLabel>脚手架类型</InputLabel>
                <Select
                  value={formData.scaffold}
                  onChange={(e) => setFormData(prev => ({ ...prev, scaffold: e.target.value as string }))}
                >
                  <MenuItem value="vite">Vite</MenuItem>
                  <MenuItem value="next">Next.js</MenuItem>
                  <MenuItem value="react">React</MenuItem>
                  <MenuItem value="vue">Vue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="模板描述"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={classes.formField}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GitHub 用户名/组织"
                value={formData.templateOwner}
                onChange={(e) => setFormData(prev => ({ ...prev, templateOwner: e.target.value }))}
                className={classes.formField}
                required
                placeholder="例如: facebook"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="仓库名称"
                value={formData.templateRepo}
                onChange={(e) => setFormData(prev => ({ ...prev, templateRepo: e.target.value }))}
                className={classes.formField}
                required
                placeholder="例如: create-react-app"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="标签 (用逗号分隔)"
                value={formData.tags.join(', ')}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                  setFormData(prev => ({ ...prev, tags }));
                }}
                className={classes.formField}
                placeholder="例如: react, typescript, vite"
              />
            </Grid>
          </Grid>

          {/* 预览区域 */}
          <Box className={classes.previewSection}>
            <Typography variant="subtitle2" gutterBottom>
              📋 模板预览
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>仓库地址:</strong> https://github.com/{formData.templateOwner}/{formData.templateRepo}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>脚手架:</strong> {formData.scaffold}
            </Typography>
            {formData.tags.length > 0 && (
              <Box className={classes.templateTags} style={{ marginTop: 8 }}>
                {formData.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            取消
          </Button>
          <Button
            onClick={handleSaveTemplate}
            variant="contained"
            color="primary"
          >
            {editingTemplate ? '更新' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 消息提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
