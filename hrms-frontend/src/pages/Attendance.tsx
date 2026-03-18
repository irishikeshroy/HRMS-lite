import { useState, useEffect, useRef } from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { Attendance } from '../api/attendance';
import { getAttendance, updateAttendance } from '../api/attendance';

const STATUS_OPTIONS = ['Present', 'Absent'];

/* ── Skeleton placeholder ── */
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`skeleton ${className}`} />;
}

export default function AttendancePage() {
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

    const dateInputRef = useRef<HTMLInputElement>(null);

    const handleIconClick = () => {
        if (dateInputRef.current) {
            try {
                // @ts-ignore
                dateInputRef.current.showPicker();
            } catch {
                dateInputRef.current.focus();
            }
        }
    };

    useEffect(() => {
        setLoading(true);
        getAttendance({
            date: filterDate || undefined,
            status: filterStatus || undefined,
            page: page + 1,
            page_size: rowsPerPage,
        })
            .then(r => {
                setAttendance(r.data.items);
                setTotal(r.data.total);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filterDate, filterStatus, page, rowsPerPage]);

    const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const totalPages = Math.ceil(total / rowsPerPage);
    const startItem = total === 0 ? 0 : page * rowsPerPage + 1;
    const endItem = Math.min((page + 1) * rowsPerPage, total);

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: number[] = [];
        const maxVisible = 5;
        let start = Math.max(0, page - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible);
        if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
        for (let i = start; i < end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Attendance Records</h1>
                    <p className="text-slate-500 mt-1">{total} total records</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* <div className="relative hidden md:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-64"
                            placeholder="Search records..."
                            type="text"
                        />
                    </div> */}
                    {/* <button className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">notifications</span>
                    </button> */}
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex flex-col gap-1.5 flex-1 max-w-[240px]">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Filter by Date</label>
                    <div className="relative group">
                        <button type="button" onClick={handleIconClick} className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer">
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">event</span>
                        </button>
                        <input
                            ref={dateInputRef}
                            type="date"
                            value={filterDate}
                            onChange={handleFilterChange(setFilterDate)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full pl-10 pr-4 py-3 bg-white/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-white transition-all text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-1 max-w-[200px]">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Status</label>
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary group-hover:scale-110 transition-transform pointer-events-none">filter_list</span>
                        <select
                            value={filterStatus}
                            onChange={handleFilterChange(setFilterStatus)}
                            className="w-full pl-10 pr-8 py-3 bg-white/60 border border-slate-200 rounded-xl appearance-none cursor-pointer hover:bg-white transition-all text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                </div>
                {/* <div className="ml-auto flex items-end h-full pt-6">
                    <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                        style={{ boxShadow: '0 4px 14px rgba(76, 174, 130, 0.3)' }}>
                        <span className="material-symbols-outlined text-xl">download</span>
                        Export Data
                    </button>
                </div> */}
            </div>

            {/* Table */}
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col shadow-xl">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white/40 backdrop-blur-md z-10 border-b border-slate-200/50">
                            <tr>
                                {['Employee ID', 'Date', 'Status', 'Recorded At'].map(h => (
                                    <th key={h} className={`px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/30">
                            {loading ? (
                                Array.from({ length: rowsPerPage }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                                        {/* <td className="px-6 py-4"><Skeleton className="h-5 w-8 ml-auto" /></td> */}
                                    </tr>
                                ))
                            ) : attendance.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined text-3xl text-slate-300">event_busy</span>
                                            </div>
                                            <p className="text-slate-500 font-medium">No attendance records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                attendance.map(a => (
                                    <tr key={a.id} className="hover:bg-primary/5 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-700">{a.employee_code}</td>
                                        <td className="px-6 py-4 text-slate-600">{new Date(a.date).toLocaleDateString('en-GB')}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(a)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                                                    a.status === 'Present'
                                                        ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                                                        : 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200'
                                                }`}
                                            >
                                                {a.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {new Date(a.created_at).toLocaleString('en-GB')}
                                        </td>
                                        {/* <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 hover:text-primary transition-colors cursor-pointer">
                                                <span className="material-symbols-outlined">more_vert</span>
                                            </button>
                                        </td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 bg-white/20 backdrop-blur-sm border-t border-slate-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 font-medium">Rows:</span>
                            <select
                                value={rowsPerPage}
                                onChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                                className="bg-transparent border border-slate-200 rounded px-2 py-0.5 text-sm focus:ring-primary focus:border-primary outline-none"
                            >
                                {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <span className="text-sm text-slate-500">{startItem}-{endItem} of {total}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 text-slate-400 disabled:cursor-not-allowed disabled:opacity-30 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                                        p === page
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {p + 1}
                                </button>
                            ))}
                        </div>
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

            {/* Snackbar (MUI) */}
            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
            </Snackbar>
        </div>
    );
}
