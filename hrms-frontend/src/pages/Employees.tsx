import { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Card, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, MenuItem, Dialog, DialogTitle,
    DialogContent, DialogActions, Chip, IconButton, Snackbar, Alert, Skeleton,
    InputAdornment, Stack, TablePagination, Pagination
} from '@mui/material';
import { Add, Delete, Search, Visibility } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { Employee, EmployeeCreate } from '../api/employees';
import { getEmployees, createEmployee, deleteEmployee } from '../api/employees';

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal'];

export default function Employees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [department, setDepartment] = useState('');
    const [page, setPage] = useState(0);               // MUI: 0-indexed
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openAdd, setOpenAdd] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });
    const navigate = useNavigate();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EmployeeCreate>();

    const fetchEmployees = useCallback(() => {
        setLoading(true);
        getEmployees({
            search: search || undefined,
            department: department || undefined,
            page: page + 1,
            page_size: rowsPerPage,
        })
            .then(r => { setEmployees(r.data.items); setTotal(r.data.total); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [search, department, page, rowsPerPage]);

    useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        setPage(0);
    };

    const onAdd = async (data: EmployeeCreate) => {
        try {
            await createEmployee(data);
            setSnack({ open: true, msg: 'Employee added successfully!', severity: 'success' });
            setOpenAdd(false);
            reset();
            fetchEmployees();
        } catch (e: any) {
            setSnack({ open: true, msg: e.response?.data?.detail || 'Failed to create employee', severity: 'error' });
        }
    };

    const onDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteEmployee(deleteTarget.id);
            setSnack({ open: true, msg: 'Employee deleted.', severity: 'success' });
            setDeleteTarget(null);
            fetchEmployees();
        } catch {
            setSnack({ open: true, msg: 'Failed to delete employee.', severity: 'error' });
        }
    };

    // Fixed-height skeleton rows that match actual row height (~52px)
    const skeletonRows = Array.from({ length: rowsPerPage }).map((_, i) => (
        <TableRow key={i} sx={{ height: 52 }}>
            {Array.from({ length: 6 }).map((_, j) => (
                <TableCell key={j} sx={{ py: 1 }}>
                    <Skeleton variant="text" height={20} />
                </TableCell>
            ))}
        </TableRow>
    ));

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Employee Directory</Typography>
                    <Typography variant="body2" color="text.secondary">{total} total records</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAdd(true)}>
                    Add Employee
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <TextField
                    size="small" placeholder="Search name or ID…" value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment> }}
                    sx={{ width: 300 }}
                />
                <TextField select size="small" value={department}
                    onChange={handleFilterChange(setDepartment)}
                    label="Department" sx={{ width: 180 }}>
                    <MenuItem value="">All Departments</MenuItem>
                    {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
            </Stack>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                {['Employee ID', 'Full Name', 'Email', 'Department', 'Joined', 'Actions'].map(h => (
                                    <TableCell key={h} sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading
                                ? skeletonRows
                                : employees.length === 0
                                    ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                                <Typography color="text.secondary">No employees found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )
                                    : employees.map(e => (
                                        <TableRow key={e.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                            <TableCell sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.85rem' }}>{e.employee_id}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{e.full_name}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{e.email}</TableCell>
                                            <TableCell>
                                                <Chip label={e.department} size="small" sx={{ bgcolor: 'rgba(108,99,255,0.12)', color: 'primary.light', borderRadius: 1 }} />
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                                {new Date(e.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1}>
                                                    <IconButton size="small" onClick={() => navigate(`/employees/${e.id}`)}
                                                        sx={{ color: 'primary.main', '&:hover': { bgcolor: 'rgba(108,99,255,0.15)' } }}>
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => setDeleteTarget(e)}
                                                        sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(255,101,132,0.15)' } }}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>

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

            {/* Add Employee Dialog */}
            <Dialog open={openAdd} onClose={() => { setOpenAdd(false); reset(); }} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700 }}>Add New Employee</DialogTitle>
                <form onSubmit={handleSubmit(onAdd)}>
                    <DialogContent sx={{ pt: 1 }}>
                        <Stack spacing={2.5}>
                            <TextField label="Employee ID" fullWidth size="small"
                                {...register('employee_id', { required: 'Required', maxLength: { value: 20, message: 'Max 20 chars' } })}
                                error={!!errors.employee_id} helperText={errors.employee_id?.message}
                                placeholder="e.g. EMP001" />
                            <TextField label="Full Name" fullWidth size="small"
                                {...register('full_name', { required: 'Required' })}
                                error={!!errors.full_name} helperText={errors.full_name?.message} />
                            <TextField label="Email" type="email" fullWidth size="small"
                                {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                                error={!!errors.email} helperText={errors.email?.message} />
                            <TextField select label="Department" fullWidth size="small"
                                defaultValue=""
                                {...register('department', { required: 'Required' })}
                                error={!!errors.department} helperText={errors.department?.message}>
                                {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => { setOpenAdd(false); reset(); }} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving…' : 'Add Employee'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Delete Employee?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete <strong>{deleteTarget?.full_name}</strong>? This will also remove all attendance records.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} color="inherit">Cancel</Button>
                    <Button onClick={onDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
