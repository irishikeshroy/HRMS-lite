import { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Skeleton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { People, CheckCircle, Cancel } from '@mui/icons-material';
import type { DashboardStats, TodayAttendanceRecord } from '../api/attendance';
import { getDashboardStats, getTodayAttendance } from '../api/attendance';
import type { Employee } from '../api/employees';
import { getEmployees } from '../api/employees';

interface StatCardProps { title: string; value: number; icon: React.ReactNode; color: string; loading: boolean; }
function StatCard({ title, value, icon, color, loading }: StatCardProps) {
    return (
        <Card sx={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', bgcolor: color }} />
            <CardContent sx={{ p: 3 }}>
                {loading ? (
                    <>
                        <Skeleton variant="text" height={16} width={100} sx={{ mb: 1 }} />
                        <Skeleton variant="text" height={48} width={60} />
                    </>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace', fontSize: '0.7rem' }}>{title}</Typography>
                            <Typography variant="h3" fontWeight={800} sx={{ color, lineHeight: 1.1, mt: 0.5 }}>{value}</Typography>
                        </Box>
                        <Box sx={{ color, opacity: 0.5, mt: 0.5 }}>{icon}</Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

// Skeleton rows for tables — fixed height, text-only, matches real row height
function TableSkeletonRows({ rows, cols }: { rows: number; cols: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i} sx={{ height: 44 }}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <TableCell key={j} sx={{ py: 1 }}>
                            <Skeleton variant="text" height={18} width={j === cols - 1 ? 48 : undefined} />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

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
        <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Dashboard</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Today · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>

            {/* Stat Cards */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px' }}>
                    <StatCard title="Total Employees" value={stats?.total_employees ?? 0} icon={<People />} color="#6c63ff" loading={loading} />
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                    <StatCard title="Present Today" value={stats?.present_today ?? 0} icon={<CheckCircle />} color="#43e97b" loading={loading} />
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                    <StatCard title="Absent Today" value={stats?.absent_today ?? 0} icon={<Cancel />} color="#ff6584" loading={loading} />
                </Box>
            </Box>

            {/* Bottom row cards */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {/* Department Breakdown */}
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Department Breakdown</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Department</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Headcount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading
                                            ? <TableSkeletonRows rows={5} cols={2} />
                                            : Object.entries(deptMap).length === 0
                                                ? <TableRow><TableCell colSpan={2} align="center"><Typography variant="body2" color="text.secondary">No employees yet</Typography></TableCell></TableRow>
                                                : Object.entries(deptMap).map(([dept, count]) => (
                                                    <TableRow key={dept}>
                                                        <TableCell>{dept}</TableCell>
                                                        <TableCell align="right">
                                                            <Chip label={count} size="small" sx={{ bgcolor: 'rgba(108,99,255,0.15)', color: 'primary.main', fontWeight: 600 }} />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Box>

                {/* Today's Attendance Log */}
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Today's Attendance Log</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Employee</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading
                                            ? <TableSkeletonRows rows={5} cols={2} />
                                            : recentAttendance.length === 0
                                                ? <TableRow><TableCell colSpan={2} align="center"><Typography variant="body2" color="text.secondary">No records marked today</Typography></TableCell></TableRow>
                                                : recentAttendance.map(a => (
                                                    <TableRow key={a.attendance_id}>
                                                        <TableCell>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 600, fontSize: '0.8rem' }}>{a.employee_code}</Typography>
                                                                <Typography variant="caption" color="text.secondary">{a.full_name}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Chip
                                                                label={a.status}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: a.status === 'Present' ? 'rgba(67,233,123,0.15)' : 'rgba(255,101,132,0.15)',
                                                                    color: a.status === 'Present' ? '#43e97b' : '#ff6584',
                                                                    fontWeight: 600
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
