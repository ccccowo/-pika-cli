import React, { useState } from 'react';
import { scaffolds } from '../config/templates';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Paper,
  useTheme,
  makeStyles,
  fade
} from '@material-ui/core';
import {
  OpenInNew as OpenInNewIcon,
  Code as CodeIcon,
  Code as TerminalIcon
} from '@material-ui/icons';
import type { TemplateId, TemplateConfig } from '../types';
import { CreateProjectDialog } from './CreateProjectDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(8, 0),
  },
  title: {
    marginBottom: theme.spacing(8),
    textAlign: 'center',
  },
  gradientText: {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    marginBottom: theme.spacing(8),
    textAlign: 'center',
  },
  tabsContainer: {
    marginBottom: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'hidden',
  },
  tab: {
    fontSize: '1rem',
    padding: theme.spacing(2),
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: fade(theme.palette.primary.main, 0.08),
    },
  },
  tabIcon: {
    marginRight: theme.spacing(1),
  },
  card: {
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
  cardSelected: {
    border: `2px solid ${theme.palette.primary.main}`,
  },
  chip: {
    marginBottom: theme.spacing(1),
    backgroundColor: fade(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
  },
  featureChip: {
    margin: theme.spacing(0.5),
    backgroundColor: fade(theme.palette.primary.main, 0.05),
    borderColor: fade(theme.palette.primary.main, 0.2),
  },
  commandPaper: {
    padding: theme.spacing(1.5),
    backgroundColor: fade(theme.palette.background.default, 0.6),
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(6),
  },
  commandText: {
    display: 'block',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    color: theme.palette.primary.light,
    fontSize: '0.8rem'
  },
  docButton: {
    marginTop: theme.spacing(2),
  },
}));

interface TemplateListProps {
  onSelect?: (templateId: TemplateId) => void;
  selectedId?: string;
}

export function TemplateList({ onSelect, selectedId }: TemplateListProps) {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const theme = useTheme();
  const classes = useStyles();

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleTemplateClick = (template: TemplateConfig) => {
    setSelectedTemplate(template);
  };

  const handleDialogClose = () => {
    setSelectedTemplate(null);
  };

  return (
    <>
      <Container className={classes.root}>
        <Box className={classes.title}>
          <Typography variant="h1" className={classes.gradientText}>
            创建新项目
          </Typography>
          <Typography variant="h6" className={classes.subtitle}>
            选择你喜欢的框架和工具，快速开始一个新项目。所有模板都包含了最佳实践和基础配置。
          </Typography>
        </Box>

        <Paper className={classes.tabsContainer} elevation={0}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
          >
            {scaffolds.map((scaffold) => (
              <Tab
                key={scaffold.id}
                label={scaffold.name}
                icon={<CodeIcon className={classes.tabIcon} />}
                className={classes.tab}
              />
            ))}
          </Tabs>
        </Paper>

        {scaffolds.map((scaffold, index) => (
          <Box key={scaffold.id} hidden={currentTab !== index}>
            {currentTab === index && (
              <>
                <Box className={classes.gridContainer}>
                  {scaffold.templates.map((template) => (
                    <Card
                      key={template.id}
                      onClick={() => handleTemplateClick(template)}
                      className={`${classes.card} ${selectedId === template.id ? classes.cardSelected : ''}`}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box>
                            <Chip
                              label={template.name}
                              color="primary"
                              size="small"
                              className={classes.chip}
                            />
                            <Typography variant="body1" style={{ marginTop: 8, opacity: 0.8 }}>
                              {template.description}
                            </Typography>
                          </Box>
                        </Box>

                        <Box display="flex" flexWrap="wrap" mb={3}>
                          {template.features.map((feature) => (
                            <Chip
                              key={feature}
                              label={feature}
                              variant="outlined"
                              size="small"
                              className={classes.featureChip}
                            />
                          ))}
                        </Box>

                        <Paper variant="outlined" className={classes.commandPaper}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <TerminalIcon fontSize="small" style={{ opacity: 0.7 }} />
                            <Typography variant="caption" style={{ marginLeft: 8, opacity: 0.7 }}>
                              安装命令
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            component="code"
                            className={classes.commandText}
                          >
                            {template.command.replace('{name}', 'my-app')}
                          </Typography>
                        </Paper>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                <Box display="flex" justifyContent="center">
                  <Button
                    variant="outlined"
                    endIcon={<OpenInNewIcon />}
                    href={scaffold.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.docButton}
                  >
                    查看 {scaffold.name} 文档
                  </Button>
                </Box>
              </>
            )}
          </Box>
        ))}
      </Container>

      {selectedTemplate && (
        <CreateProjectDialog
          open={true}
          onClose={handleDialogClose}
          template={selectedTemplate}
        />
      )}
    </>
  );
} 