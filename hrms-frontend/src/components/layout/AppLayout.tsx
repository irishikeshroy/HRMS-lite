import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Topbar />
                <Toolbar sx={{ minHeight: 72 }} /> {/* Spacer */}
                <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
