import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Box, IconButton, Tooltip, Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, WhatsApp, Apps, Message, Webhook as WebhookIcon,
  Notifications, Schedule, SmartToy, ReceiptLong, Logout,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'WhatsApp', icon: <WhatsApp />, path: '/whatsapp' },
  { text: 'Aplikasi', icon: <Apps />, path: '/applications' },
  { text: 'Pesan', icon: <Message />, path: '/messages' },
  { text: 'Webhook', icon: <WebhookIcon />, path: '/webhooks' },
  { text: 'Notifikasi', icon: <Notifications />, path: '/notifications' },
  { text: 'Scheduler', icon: <Schedule />, path: '/scheduler' },
  { text: 'AI', icon: <SmartToy />, path: '/ai' },
  { text: 'Logs', icon: <ReceiptLong />, path: '/logs' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Automation Server
          </Typography>
          <Tooltip title={admin?.username || ''}>
            <Avatar sx={{ bgcolor: 'secondary.main', mr: 1, width: 32, height: 32, fontSize: 14 }}>
              {admin?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
          <IconButton color="inherit" onClick={logout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', pt: '64px' },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{ mx: 1, borderRadius: 1 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
