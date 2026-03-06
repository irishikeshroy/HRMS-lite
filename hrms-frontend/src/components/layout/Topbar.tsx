import React from 'react';
import { Box, Toolbar, Typography, AppBar, Avatar } from '@mui/material';
import { useLocation } from 'react-router-dom';

const drawerWidth = 260;

export default function Topbar() {
    const location = useLocation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return 'Dashboard Overview';
            case '/employees': return 'Employee Directory';
            case '/attendance': return 'Attendance Records';
            default:
                if (location.pathname.startsWith('/employees/')) return 'Employee Profile';
                return 'HRMS System';
        }
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
                backgroundColor: 'rgba(10, 10, 15, 0.8)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72 }}>
                <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700 }}>
                    {getPageTitle()}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Admin User</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>HR Manager</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>A</Avatar>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
