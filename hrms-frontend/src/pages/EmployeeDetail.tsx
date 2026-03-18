import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Snackbar, Alert, Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Employee } from '../api/employees';
import { getEmployee } from '../api/employees';
import type { Attendance, AttendanceCreate } from '../api/attendance';
import { getEmployeeAttendance, markAttendance, updateAttendance } from '../api/attendance';

/* ── Skeleton placeholder ── */
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`skeleton ${className}`} />;
}

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
    const totalPages = Math.ceil(total / rowsPerPage);
    const startItem = total === 0 ? 0 : page * rowsPerPage + 1;
    const endItem = Math.min((page + 1) * rowsPerPage, total);

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm font-medium">
                <button onClick={() => navigate('/employees')} className="text-primary hover:underline cursor-pointer">
                    Employees
                </button>
                <span className="material-symbols-outlined text-slate-400 text-sm leading-none">chevron_right</span>
                <span className="text-slate-500">{loading ? '…' : employee?.full_name}</span>
            </nav>

            {/* Profile Summary */}
            {loading ? (
                <div className="glass-panel rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-6">
                        <Skeleton className="w-24 h-24 rounded-3xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-40" />
                        </div>
                    </div>
                </div>
            ) : employee && (
                <section className="glass-panel rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-8 items-start md:items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-primary shadow-inner overflow-hidden border-4 border-white/50 flex items-center justify-center text-white text-4xl font-bold">
                                {employee.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-xl border-2 border-white">
                                <span className="material-symbols-outlined text-sm">verified</span>
                            </div>
                        </div>
                        {/* Info */}
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{employee.full_name}</h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span className="flex items-center gap-1 text-slate-600 font-medium">
                                    <span className="material-symbols-outlined text-lg">badge</span> {employee.employee_id}
                                </span>
                                <span className="flex items-center gap-1 text-slate-600 font-medium">
                                    <span className="material-symbols-outlined text-lg">corporate_fare</span> {employee.department}
                                </span>
                            </div>
                            <p className="text-primary font-medium mt-1">{employee.email}</p>
                        </div>
                    </div>
                    {/* Right side: Button + Stats */}
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setOpenMark(true)}
                            className="bg-primary text-white flex items-center justify-center gap-2 px-6 h-12 rounded-xl font-semibold shadow-lg active:scale-95 transition-all w-full cursor-pointer"
                            style={{ boxShadow: '0 4px 14px rgba(76, 174, 130, 0.3)' }}
                        >
                            <span className="material-symbols-outlined">how_to_reg</span>
                            Mark Attendance
                        </button>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-white/60 p-3 rounded-2xl border border-white/40 text-center">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Present</p>
                                <p className="text-2xl font-black text-primary">{presentDays}</p>
                            </div>
                            <div className="flex-1 bg-white/60 p-3 rounded-2xl border border-white/40 text-center">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Absent</p>
                                <p className="text-2xl font-black text-rose-500">{absentDays}</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Attendance History */}
            <section className="glass-panel rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Attendance History</h3>
                        <p className="text-sm text-slate-500">{total} records found</p>
                    </div>
                    {/* Date filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 md:flex-none">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-primary tracking-widest uppercase z-[1]">From</label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white/50 focus-within:border-primary transition-colors">
                                <button type="button" onClick={handlePicker(fromDateRef)} className="cursor-pointer">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">calendar_today</span>
                                </button>
                                <input
                                    ref={fromDateRef}
                                    type="date"
                                    value={fromDate}
                                    onChange={handleDateChange(setFromDate)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="bg-transparent border-none p-0 text-sm font-medium focus:ring-0 w-28 outline-none"
                                />
                            </div>
                        </div>
                        <div className="relative flex-1 md:flex-none">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-primary tracking-widest uppercase z-[1]">To</label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white/50 focus-within:border-primary transition-colors">
                                <button type="button" onClick={handlePicker(toDateRef)} className="cursor-pointer">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">event_available</span>
                                </button>
                                <input
                                    ref={toDateRef}
                                    type="date"
                                    value={toDate}
                                    onChange={handleDateChange(setToDate)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="bg-transparent border-none p-0 text-sm font-medium focus:ring-0 w-28 outline-none"
                                />
                            </div>
                        </div>
                        {/* <button className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button> */}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Marked At</th>
                                {/* <th className="px-6 py-4 text-right">Action</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: rowsPerPage }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                                        {/* <td className="px-6 py-4"><Skeleton className="h-5 w-8 ml-auto" /></td> */}
                                    </tr>
                                ))
                            ) : attendance.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-16 text-center">
                                        <p className="text-slate-500">No attendance records found</p>
                                    </td>
                                </tr>
                            ) : (
                                attendance.map(a => (
                                    <tr key={a.id} className="hover:bg-white/40 transition-colors group">
                                        <td className="px-6 py-4 font-semibold text-slate-700">
                                            {new Date(a.date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(a)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                                                    a.status === 'Present'
                                                        ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                                                        : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'Present' ? 'bg-primary' : 'bg-rose-600'}`} />
                                                {a.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {new Date(a.created_at).toLocaleString('en-GB')}
                                        </td>
                                        {/* <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 rounded-lg hover:bg-primary/10 text-primary cursor-pointer">
                                                <span className="material-symbols-outlined text-lg">info</span>
                                            </button>
                                        </td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-200/50">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Rows:</span>
                        <select
                            value={rowsPerPage}
                            onChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            className="bg-transparent border border-slate-200 rounded px-2 py-0.5 text-sm focus:ring-primary focus:border-primary outline-none"
                        >
                            {[5, 10, 25].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600 font-medium">{startItem}-{endItem} of {total}</span>
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
            </section>

            {/* Mark Attendance Dialog (MUI) */}
            <Dialog open={openMark} onClose={() => { setOpenMark(false); reset(); }} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Mark Attendance</DialogTitle>
                <form onSubmit={handleSubmit(onMarkAttendance)}>
                    <DialogContent>
                        <Stack spacing={2.5}>
                            <TextField
                                type="date" label="Date" fullWidth size="small"
                                InputLabelProps={{ shrink: true }}
                                inputRef={markDateRef}
                                {...register('date', { required: true })}
                                inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                defaultValue={new Date().toISOString().split('T')[0]}
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

            {/* Snackbar (MUI) */}
            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
            </Snackbar>
        </div>
    );
}
