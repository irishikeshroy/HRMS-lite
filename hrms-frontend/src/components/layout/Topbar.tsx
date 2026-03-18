import { useLocation } from 'react-router-dom';

export default function Topbar() {
    const location = useLocation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return 'Dashboard Overview';
            case '/employees': return 'Employee Directory';
            case '/attendance': return 'Attendance Records';
            default:
                if (location.pathname.startsWith('/employees/')) return 'Employee Profile';
                return 'HRMS System';
        }
    };

    return (
        <header className="sticky top-0 z-10 glass-panel px-8 py-4 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{getPageTitle()}</h2>
            </div>
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input
                        className="bg-slate-100/80 border-none rounded-full pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-primary/50 text-sm transition-all outline-none"
                        placeholder="Search..."
                        type="text"
                    />
                </div>
                {/* Notification */}
                <button className="p-2.5 rounded-full hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-slate-600">notifications</span>
                </button>
                {/* Settings */}
                <button className="p-2.5 rounded-full hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-slate-600">settings</span>
                </button>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border-2 border-primary/20">
                    A
                </div>
            </div>
        </header>
    );
}
