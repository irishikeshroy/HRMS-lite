import { useState, useEffect, useRef } from 'react';
import {
    Box, Card, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, MenuItem, Chip, Skeleton, Stack,
    TablePagination, Pagination, Snackbar, Alert
} from '@mui/material';
import { CheckCircle, Cancel, CalendarMonth } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';
import type { Attendance } from '../api/attendance';
import { getAttendance, updateAttendance } from '../api/attendance';

const STATUS_OPTIONS = ['Present', 'Absent'];

export default function AttendancePage() {
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    // MUI TablePagination uses 0-indexed page; backend uses 1-indexed
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

    const dateInputRef = useRef<HTMLInputElement>(null);

    const handleIconClick = () => {
        if (dateInputRef.current) {
            try {
                // @ts-ignore - showPicker is modern but might not be in all TS types yet
                dateInputRef.current.showPicker();
            } catch (e) {
                dateInputRef.current.focus();
            }
        }
    };

    useEffect(() => {
        setLoading(true);
        getAttendance({
            date: filterDate || undefined,
            status: filterStatus || undefined,
            page: page + 1,         // backend is 1-indexed
            page_size: rowsPerPage,
        })
            .then(r => {
                setAttendance(r.data.items);
                setTotal(r.data.total);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filterDate, filterStatus, page, rowsPerPage]);

    // Reset to first page when filters change
    const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        setPage(0);
    };

    const handleToggleStatus = async (a: Attendance) => {
        const newStatus = a.status === 'Present' ? 'Absent' : 'Present';
        try {
            await updateAttendance(a.id, { status: newStatus });
            setAttendance(prev => prev.map(item => item.id === a.id ? { ...item, status: newStatus as any } : item));
            setSnack({ open: true, msg: `Status updated to ${newStatus}`, severity: 'success' });
        } catch {
            setSnack({ open: true, msg: 'Failed to update status', severity: 'error' });
        }
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Attendance Records</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {total} total records
                    </Typography>
                </Box>
            </Stack>

            {/* Filters */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <TextField
                    size="small" type="date" label="Filter by Date"
                    value={filterDate} onChange={handleFilterChange(setFilterDate)}
                    InputLabelProps={{ shrink: true }}
                    inputRef={dateInputRef}
                    inputProps={{ max: new Date().toISOString().split('T')[0] }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconButton size="small" onClick={handleIconClick} sx={{ p: 0.5, ml: -0.5 }}>
                                    <CalendarMonth sx={{ fontSize: 18, color: 'primary.main' }} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        width: 220,
                        '& input::-webkit-calendar-picker-indicator': {
                            cursor: 'pointer',
                        }
                    }}
                />
                <TextField
                    size="small" select label="Status"
                    value={filterStatus} onChange={handleFilterChange(setFilterStatus)}
                    sx={{ width: 150 }}
                >
                    <MenuItem value="">All Statuses</MenuItem>
                    {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
            </Stack>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                {['Employee ID', 'Date', 'Status', 'Recorded At'].map(h => (
                                    <TableCell key={h} sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading
                                ? Array.from({ length: rowsPerPage }).map((_, i) => (
                                    <TableRow key={i} sx={{ height: 52 }}>
                                        {Array.from({ length: 4 }).map((_, j) => (
                                            <TableCell key={j} sx={{ py: 1 }}>
                                                <Skeleton variant="text" height={20} />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                                : attendance.length === 0
                                    ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                                <Typography color="text.secondary">No attendance records found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )
                                    : attendance.map(a => (
                                        <TableRow key={a.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'primary.light' }}>
                                                {a.employee_id.slice(0, 8)}…
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace' }}>
                                                {new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={a.status === 'Present'
                                                        ? <CheckCircle sx={{ fontSize: '14px !important' }} />
                                                        : <Cancel sx={{ fontSize: '14px !important' }} />}
                                                    label={a.status}
                                                    size="small"
                                                    onClick={() => handleToggleStatus(a)}
                                                    sx={{
                                                        bgcolor: a.status === 'Present' ? 'rgba(67,233,123,0.15)' : 'rgba(255,101,132,0.15)',
                                                        color: a.status === 'Present' ? '#43e97b' : '#ff6584',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            bgcolor: a.status === 'Present' ? 'rgba(67,233,123,0.25)' : 'rgba(255,101,132,0.25)',
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                {new Date(a.created_at).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* ── Custom Pagination Footer ── */}
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{
                    p: 2, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 2
                }}>
                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        labelRowsPerPage="Rows:"
                        sx={{
                            borderBottom: 0,
                            color: 'text.secondary',
                            '.MuiTablePagination-actions': { display: 'none' },
                            '.MuiTablePagination-toolbar': { minHeight: 0, p: 0 }
                        }}
                    />
                    <Pagination
                        count={Math.ceil(total / rowsPerPage)}
                        page={page + 1}
                        onChange={(_, p) => setPage(p - 1)}
                        size="small"
                        color="primary"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                            }
                        }}
                    />
                </Stack>
            </Card>

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
