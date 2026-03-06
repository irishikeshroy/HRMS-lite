import { useState, useEffect, useRef } from 'react';
import {
    Box, Card, CardContent, Typography, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert,
    Skeleton, Stack, Breadcrumbs, Link, TablePagination, Pagination
} from '@mui/material';
import { CheckCircle, Cancel, CalendarMonth } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Employee } from '../api/employees';
import { getEmployee } from '../api/employees';
import type { Attendance, AttendanceCreate } from '../api/attendance';
import { getEmployeeAttendance, markAttendance, updateAttendance } from '../api/attendance';

export default function EmployeeDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [openMark, setOpenMark] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

    const fromDateRef = useRef<HTMLInputElement>(null);
    const toDateRef = useRef<HTMLInputElement>(null);
    const markDateRef = useRef<HTMLInputElement>(null);

    const handlePicker = (ref: React.RefObject<HTMLInputElement | null>) => () => {
        if (ref.current) {
            try {
                // @ts-ignore
                ref.current.showPicker();
            } catch {
                ref.current.focus();
            }
        }
    };

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ date: string; status: string }>();

    const fetchAttendance = () => {
        if (!id) return;
        getEmployeeAttendance(id, {
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
            page: page + 1,
            page_size: rowsPerPage
        })
            .then(r => {
                setAttendance(r.data.items);
                setTotal(r.data.total);
            })
            .catch(console.error);
    };

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        Promise.all([
            getEmployee(id),
            getEmployeeAttendance(id, { page: 1, page_size: rowsPerPage })
        ]).then(([empRes, attRes]) => {
            setEmployee(empRes.data);
            setAttendance(attRes.data.items);
            setTotal(attRes.data.total);
        }).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!loading) fetchAttendance();
    }, [fromDate, toDate, page, rowsPerPage]);

    const handleDateChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const onMarkAttendance = async (data: any) => {
        if (!id) return;
        try {
            await markAttendance({ employee_id: id, date: data.date, status: data.status } as AttendanceCreate);
            setSnack({ open: true, msg: 'Attendance marked!', severity: 'success' });
            setOpenMark(false); reset();
            fetchAttendance();
        } catch (e: any) {
            setSnack({ open: true, msg: e.response?.data?.detail || 'Failed to mark attendance', severity: 'error' });
        }
    };

    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const absentDays = attendance.filter(a => a.status === 'Absent').length;

    return (
        <Box>
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link component="button" variant="body2" onClick={() => navigate('/employees')} underline="hover" color="text.secondary">Employees</Link>
                <Typography variant="body2" color="text.primary">{loading ? '…' : employee?.full_name}</Typography>
            </Breadcrumbs>

            {loading ? <Skeleton height={140} sx={{ borderRadius: 3, mb: 3 }} /> : employee && (
                <Card sx={{ mb: 3, position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #6c63ff, transparent)' }} />
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>{employee.full_name}</Typography>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{employee.employee_id}</Typography>
                                    <Chip label={employee.department} size="small" sx={{ bgcolor: 'rgba(108,99,255,0.12)', color: 'primary.light' }} />
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{employee.email}</Typography>
                            </Box>
                            <Stack direction="row" spacing={2}>
                                <Box sx={{ textAlign: 'center', bgcolor: 'rgba(67,233,123,0.1)', borderRadius: 2, p: 2, minWidth: 80 }}>
                                    <Typography variant="h4" fontWeight={800} color="success.main">{presentDays}</Typography>
                                    <Typography variant="caption" color="text.secondary">Present</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,101,132,0.1)', borderRadius: 2, p: 2, minWidth: 80 }}>
                                    <Typography variant="h4" fontWeight={800} color="secondary.main">{absentDays}</Typography>
                                    <Typography variant="caption" color="text.secondary">Absent</Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Attendance History</Typography>
                    <Typography variant="caption" color="text.secondary">{total} records found</Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                        size="small" type="date" label="From"
                        value={fromDate} onChange={handleDateChange(setFromDate)}
                        inputRef={fromDateRef}
                        inputProps={{ max: new Date().toISOString().split('T')[0] }}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconButton size="small" onClick={handlePicker(fromDateRef)} sx={{ p: 0.5, ml: -0.5 }}>
                                        <CalendarMonth sx={{ fontSize: 18, color: 'primary.main' }} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            width: 180,
                            '& input::-webkit-calendar-picker-indicator': { cursor: 'pointer' }
                        }}
                    />
                    <TextField
                        size="small" type="date" label="To"
                        value={toDate} onChange={handleDateChange(setToDate)}
                        inputRef={toDateRef}
                        inputProps={{ max: new Date().toISOString().split('T')[0] }}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconButton size="small" onClick={handlePicker(toDateRef)} sx={{ p: 0.5, ml: -0.5 }}>
                                        <CalendarMonth sx={{ fontSize: 18, color: 'primary.main' }} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            width: 180,
                            '& input::-webkit-calendar-picker-indicator': { cursor: 'pointer' }
                        }}
                    />
                    <Button variant="contained" onClick={() => setOpenMark(true)} size="small" disableElevation sx={{ borderRadius: 2 }}>Mark Attendance</Button>
                </Stack>
            </Stack>

            <Card>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                {['Date', 'Status', 'Marked At'].map(h => (
                                    <TableCell key={h} sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: rowsPerPage }).map((_, i) => (
                                    <TableRow key={i} sx={{ height: 44 }}>
                                        {Array.from({ length: 3 }).map((_, j) => (
                                            <TableCell key={j} sx={{ py: 1 }}><Skeleton variant="text" height={18} /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : attendance.length === 0 ? (
                                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No attendance records found</Typography></TableCell></TableRow>
                            ) : attendance.map(a => (
                                <TableRow key={a.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>{new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                    <TableCell>
                                        <Chip icon={a.status === 'Present' ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Cancel sx={{ fontSize: '14px !important' }} />}
                                            label={a.status} size="small"
                                            onClick={() => handleToggleStatus(a)}
                                            sx={{
                                                bgcolor: a.status === 'Present' ? 'rgba(67,233,123,0.15)' : 'rgba(255,101,132,0.15)',
                                                color: a.status === 'Present' ? '#43e97b' : '#ff6584',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: a.status === 'Present' ? 'rgba(67,233,123,0.25)' : 'rgba(255,101,132,0.25)',
                                                }
                                            }} />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.8rem' }}>{new Date(a.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{
                    p: 2, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 2
                }}>
                    <TablePagination
                        component="div" count={total} page={page}
                        onPageChange={(_: any, newPage: number) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[5, 10, 25]}
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

            <Dialog open={openMark} onClose={() => { setOpenMark(false); reset(); }} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700 }}>Mark Attendance</DialogTitle>
                <form onSubmit={handleSubmit(onMarkAttendance)}>
                    <DialogContent>
                        <Stack spacing={2.5}>
                            <TextField
                                type="date" label="Date" fullWidth size="small"
                                InputLabelProps={{ shrink: true }}
                                inputRef={markDateRef}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton size="small" onClick={handlePicker(markDateRef)} sx={{ p: 0.5, ml: -0.5 }}>
                                                <CalendarMonth sx={{ fontSize: 18, color: 'primary.main' }} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                {...register('date', { required: true })}
                                inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                defaultValue={new Date().toISOString().split('T')[0]}
                                sx={{ '& input::-webkit-calendar-picker-indicator': { cursor: 'pointer' } }}
                            />
                            <TextField select label="Status" fullWidth size="small" defaultValue="Present" {...register('status', { required: true })}>
                                <MenuItem value="Present">✅ Present</MenuItem>
                                <MenuItem value="Absent">❌ Absent</MenuItem>
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => { setOpenMark(false); reset(); }} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving…' : 'Mark'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
