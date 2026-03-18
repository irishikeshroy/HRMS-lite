import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
    { text: 'Dashboard', icon: 'dashboard', path: '/' },
    { text: 'Employees', icon: 'group', path: '/employees' },
    { text: 'Attendance', icon: 'calendar_today', path: '/attendance' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="w-72 flex flex-col glass-panel border-r border-slate-200 p-6 z-20 shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="bg-primary rounded-xl p-2 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-2xl">event_available</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-tight tracking-tight">HRMS Lite</h1>
                    <p className="text-xs text-slate-500 font-medium">Management Portal</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1">
                {menuItems.map((item) => {
                    const active =
                        item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                    return (
                        <button
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left w-full ${
                                active
                                    ? 'sidebar-item-active border border-primary/20 font-semibold'
                                    : 'text-slate-600 hover:bg-primary/10 hover:text-primary'
                            }`}
                        >
                            <span className={`material-symbols-outlined ${active ? 'fill-1' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium text-sm">{item.text}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom user section */}
            <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">Admin User</p>
                        <p className="text-xs text-slate-500 truncate">Administrator</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-xl">settings</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
