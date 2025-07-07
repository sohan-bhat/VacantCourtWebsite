import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    Box,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../auth/AuthContext';

const AccountPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    const isLinkActive = (path: string) => {
        if (path === '/account/profile') {
            return location.pathname === '/account' || location.pathname === '/account/profile';
        }
        return location.pathname === path;
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>

            <Box
                component="aside"
                sx={{
                    width: '280px',
                    flexShrink: 0,
                    bgcolor: '#ffffff',
                    borderRight: '1px solid',
                    borderColor: 'grey.200',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'grey.200' }}>
                    <img src='/ground.png' alt="Logo" style={{ height: 32 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Account Center
                    </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, p: 1.5 }}>
                    <List component="nav">
                        <ListItemButton
                            selected={isLinkActive('/account/profile')}
                            onClick={() => navigate('/account/profile')}
                            sx={{ borderRadius: '8px', mb: 1 }}
                        >
                            <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                            <ListItemText primary="Profile Settings" />
                        </ListItemButton>
                        <ListItemButton
                            selected={isLinkActive('/account/subscriptions')}
                            onClick={() => navigate('/account/subscriptions')}
                            sx={{ borderRadius: '8px' }}
                        >
                            <ListItemIcon><NotificationsIcon /></ListItemIcon>
                            <ListItemText primary="My Subscriptions" />
                        </ListItemButton>
                    </List>
                </Box>
                <Divider />
                <Box sx={{ p: 1.5 }}>
                    <ListItemButton onClick={() => navigate('/')} sx={{ borderRadius: '8px' }}>
                        <ListItemIcon><ArrowBackIcon /></ListItemIcon>
                        <ListItemText primary="Back to Dashboard" />
                    </ListItemButton>
                </Box>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3, md: 4 },
                    overflowY: 'auto',
                    backgroundColor: '#f4f6f8',
                    backgroundImage: `
            linear-gradient(rgba(244, 246, 248, 0.9), rgba(244, 246, 248, 0.9)),
            url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"%3E%3Cg fill-rule="evenodd"%3E%3Cg id="dot-grid" fill="%23dce2e8"%3E%3Cpath d="M2,2 L0,2 L0,0 L2,0 L2,2 Z M6,2 L4,2 L4,0 L6,0 L6,2 Z M10,2 L8,2 L8,0 L10,0 L10,2 Z M14,2 L12,2 L12,0 L14,0 L14,2 Z M18,2 L16,2 L16,0 L18,0 L18,2 Z M2,6 L0,6 L0,4 L2,4 L2,6 Z M6,6 L4,6 L4,4 L6,4 L6,6 Z M10,6 L8,6 L8,4 L10,4 L10,6 Z M14,6 L12,6 L12,4 L14,4 L14,6 Z M18,6 L16,6 L16,4 L18,4 L18,6 Z M2,10 L0,10 L0,8 L2,8 L2,10 Z M6,10 L4,10 L4,8 L6,8 L6,10 Z M10,10 L8,10 L8,8 L10,8 L10,10 Z M14,10 L12,10 L12,8 L14,8 L14,10 Z M18,10 L16,10 L16,8 L18,8 L18,10 Z M2,14 L0,14 L0,12 L2,12 L2,14 Z M6,14 L4,14 L4,12 L6,12 L6,14 Z M10,14 L8,14 L8,12 L10,12 L10,14 Z M14,14 L12,14 L12,12 L14,12 L14,14 Z M18,14 L16,14 L16,12 L18,12 L18,14 Z M2,18 L0,18 L0,16 L2,16 L2,18 Z M6,18 L4,18 L4,16 L6,16 L6,18 Z M10,18 L8,18 L8,16 L10,16 L10,18 Z M14,18 L12,18 L12,16 L14,16 L14,18 Z M18,18 L16,18 L16,16 L18,18 L18,18 Z"%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E')
        `
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default AccountPage;