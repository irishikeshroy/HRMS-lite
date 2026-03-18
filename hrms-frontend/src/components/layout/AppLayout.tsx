import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto relative">
                {/* Decorative gradient blobs for glassmorphism */}
                <div className="fixed top-[-10%] left-[15%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
                <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

                <Topbar />

                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
