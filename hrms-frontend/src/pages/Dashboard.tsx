import { useState, useEffect } from 'react';
import type { DashboardStats, TodayAttendanceRecord } from '../api/attendance';
import { getDashboardStats, getTodayAttendance } from '../api/attendance';
import type { Employee } from '../api/employees';
import { getEmployees } from '../api/employees';

/* ── Skeleton placeholder ── */
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`skeleton ${className}`} />;
}

/* ── Department icon helper ── */
const DEPT_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
    Finance: { icon: 'payments', color: 'text-primary', bg: 'bg-primary/10' },
    Engineering: { icon: 'engineering', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    HR: { icon: 'group', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    Marketing: { icon: 'campaign', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    Sales: { icon: 'storefront', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    Operations: { icon: 'settings', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    Legal: { icon: 'gavel', color: 'text-rose-500', bg: 'bg-rose-500/10' },
};

const defaultDeptStyle = { icon: 'business', color: 'text-slate-500', bg: 'bg-slate-500/10' };

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [recentAttendance, setRecentAttendance] = useState<TodayAttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getDashboardStats(),
            getEmployees({ page: 1, page_size: 1000 }),
            getTodayAttendance()
        ]).then(([statsRes, empRes, attRes]) => {
            setStats(statsRes.data);
            setEmployees(empRes.data.items);
            setRecentAttendance(attRes.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const deptMap: Record<string, number> = {};
    employees.forEach(e => { deptMap[e.department] = (deptMap[e.department] || 0) + 1; });

    return (
        <div className="space-y-8">
            {/* Page Title */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">event</span>
                    Today • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Employees */}
                <div className="glass-panel m3-card p-6 flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">groups</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee Base</span>
                    </div>
                    <div>
                        {loading ? (
                            <Skeleton className="h-10 w-16 mb-1" />
                        ) : (
                            <p className="text-4xl font-bold text-slate-900">{stats?.total_employees ?? 0}</p>
                        )}
                        <p className="text-sm font-semibold text-slate-500 uppercase mt-1">TOTAL EMPLOYEES</p>
                    </div>
                </div>

                {/* Present Today */}
                <div className="glass-panel m3-card p-6 flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">check_circle</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active State</span>
                    </div>
                    <div>
                        {loading ? (
                            <Skeleton className="h-10 w-16 mb-1" />
                        ) : (
                            <p className="text-4xl font-bold text-slate-900">{stats?.present_today ?? 0}</p>
                        )}
                        <p className="text-sm font-semibold text-slate-500 uppercase mt-1">PRESENT TODAY</p>
                    </div>
                </div>

                {/* Absent Today */}
                <div className="glass-panel m3-card p-6 flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-md transition-shadow border-red-100">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-red-500 p-2 bg-red-50 rounded-lg">cancel</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Absence State</span>
                    </div>
                    <div>
                        {loading ? (
                            <Skeleton className="h-10 w-16 mb-1" />
                        ) : (
                            <p className="text-4xl font-bold text-slate-900">{stats?.absent_today ?? 0}</p>
                        )}
                        <p className="text-sm font-semibold text-slate-500 uppercase mt-1">ABSENT TODAY</p>
                    </div>
                </div>
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Breakdown */}
                <div className="glass-panel m3-card p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">domain</span>
                            Department Breakdown
                        </h3>
                        <button className="text-primary text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-7 w-10 rounded-full" />
                                </div>
                            ))
                        ) : Object.entries(deptMap).length === 0 ? (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">business</span>
                                <p className="text-slate-500 text-sm">No departments yet</p>
                            </div>
                        ) : (
                            Object.entries(deptMap).map(([dept, count]) => {
                                const style = DEPT_ICONS[dept] || defaultDeptStyle;
                                return (
                                    <div key={dept} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center ${style.color}`}>
                                                <span className="material-symbols-outlined">{style.icon}</span>
                                            </div>
                                            <span className="font-bold text-slate-700">{dept}</span>
                                        </div>
                                        <span className={`text-lg font-bold ${style.bg} ${style.color} px-3 py-1 rounded-full`}>
                                            {count}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Today's Attendance Log */}
                <div className="glass-panel m3-card p-8 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">list_alt</span>
                            Today's Attendance Log
                        </h3>
                        <span className="material-symbols-outlined text-slate-400">filter_list</span>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : recentAttendance.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-5xl text-slate-300">history</span>
                            </div>
                            <h4 className="text-slate-900 font-bold text-lg mb-2">No records marked today</h4>
                            <p className="text-slate-500 text-sm max-w-[240px]">Once employees check in, their activity will appear here in real-time.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentAttendance.map(a => (
                                <div key={a.attendance_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                            {a.full_name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-primary">{a.employee_code}</p>
                                            <p className="text-xs text-slate-500">{a.full_name}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                        a.status === 'Present'
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'bg-red-100 text-red-600 border border-red-200'
                                    }`}>
                                        {a.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
