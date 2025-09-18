import React from 'react';
import { 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography,
  Box,
  Divider
} from '@material-ui/core';
import { 
  AccountCircle, 
  ExitToApp as LogoutIcon,
  GitHub as GitHubIcon
} from '@material-ui/icons';
import { User } from '../services/auth';

interface UserAvatarProps {
  user: User;
  onLogout: () => void;
}

export function UserAvatar({ user, onLogout }: UserAvatarProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    handleClose();
  };

  const handleGitHubProfile = () => {
    if (user.githubUrl) {
      window.open(user.githubUrl, '_blank');
    }
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          src={user.avatarUrl}
          alt={user.displayName || user.username}
          style={{ width: 32, height: 32 }}
        >
          {!user.avatarUrl && (user.displayName?.[0] || user.username[0])}
        </Avatar>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {user.displayName || user.username}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            @{user.username}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleGitHubProfile}>
          <GitHubIcon sx={{ mr: 1 }} />
          查看 GitHub 主页
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          退出登录
        </MenuItem>
      </Menu>
    </>
  );
}
