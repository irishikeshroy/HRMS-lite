import { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Snackbar, Alert, Stack
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { Employee, EmployeeCreate } from '../api/employees';
import { getEmployees, createEmployee, deleteEmployee } from '../api/employees';

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal'];

/* ── Skeleton placeholder ── */
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`skeleton ${className}`} />;
}

export default function Employees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [department, setDepartment] = useState('');
    const [page, setPage] = useState(0);
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

    const totalPages = Math.ceil(total / rowsPerPage);
    const startItem = total === 0 ? 0 : page * rowsPerPage + 1;
    const endItem = Math.min((page + 1) * rowsPerPage, total);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employee Directory</h1>
                    <p className="text-slate-500 text-sm">{total} total records</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpenAdd(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg cursor-pointer"
                        style={{ boxShadow: '0 4px 14px rgba(76, 174, 130, 0.3)' }}
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        <span>Add Employee</span>
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative w-full lg:max-w-md">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-none glass-panel focus:ring-2 focus:ring-primary/50 text-sm outline-none"
                        placeholder="Search name or ID..."
                        type="text"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 p-1.5 glass-panel rounded-xl overflow-x-auto w-full lg:w-auto">
                    <button
                        onClick={() => { setDepartment(''); setPage(0); }}
                        className={`px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                            department === '' ? 'bg-primary text-white' : 'hover:bg-primary/10 text-slate-600'
                        }`}
                    >
                        All Departments
                    </button>
                    {DEPARTMENTS.map(d => (
                        <button
                            key={d}
                            onClick={() => { setDepartment(d); setPage(0); }}
                            className={`px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                                department === d ? 'bg-primary text-white' : 'hover:bg-primary/10 text-slate-600'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Table */}
            <div className="glass-panel rounded-xl flex flex-col overflow-hidden shadow-xl border-slate-200/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200/30">
                                {['Employee ID', 'Full Name', 'Email', 'Department', 'Joined', 'Actions'].map(h => (
                                    <th key={h} className={`px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/20">
                            {loading ? (
                                Array.from({ length: rowsPerPage }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-5"><Skeleton className="h-5 w-20" /></td>
                                        <td className="px-6 py-5"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-24" /></div></td>
                                        <td className="px-6 py-5"><Skeleton className="h-5 w-40" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-5 w-20" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-5 w-16" /></td>
                                    </tr>
                                ))
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined text-3xl text-slate-300">group_off</span>
                                            </div>
                                            <p className="text-slate-500 font-medium">No employees found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                employees.map(e => (
                                    <tr key={e.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-5 text-sm font-semibold text-primary">{e.employee_id}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {e.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <span className="text-sm font-medium">{e.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">{e.email}</td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary border border-primary/20">
                                                {e.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {new Date(e.created_at).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/employees/${e.id}`)}
                                                    className="w-9 h-9 rounded-lg glass-panel flex items-center justify-center text-primary hover:bg-primary/20 transition-all cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(e)}
                                                    className="w-9 h-9 rounded-lg glass-panel flex items-center justify-center text-red-500 hover:bg-red-100 transition-all cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="mt-auto px-6 py-4 flex items-center justify-between border-t border-slate-200/30">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">Rows:</span>
                        <select
                            value={rowsPerPage}
                            onChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            className="bg-transparent border border-slate-200 rounded px-2 py-0.5 text-sm focus:ring-primary focus:border-primary outline-none"
                        >
                            {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-600">{startItem}-{endItem} of {total}</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 text-slate-400 disabled:cursor-not-allowed disabled:opacity-30 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i)
                                .filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1)
                                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) => p === '...' ? (
                                    <span key={`dots-${i}`} className="px-1 text-slate-400">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p as number)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                                            p === page
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {(p as number) + 1}
                                    </button>
                                ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Employee Dialog (MUI) */}
            <Dialog open={openAdd} onClose={() => { setOpenAdd(false); reset(); }} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Add New Employee</DialogTitle>
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

            {/* Delete Confirmation Dialog (MUI) */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Delete Employee?</DialogTitle>
                <DialogContent>
                    <p className="text-slate-700">
                        Are you sure you want to delete <strong>{deleteTarget?.full_name}</strong>? This will also remove all attendance records.
                    </p>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} color="inherit">Cancel</Button>
                    <Button onClick={onDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar (MUI) */}
            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
            </Snackbar>
        </div>
    );
}
