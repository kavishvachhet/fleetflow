import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Soft background gradient mesh for premium feel */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none"></div>

            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                <header className="glass-header h-16 flex items-center px-8 transition-all">
                    <h2 className="text-xl font-bold text-slate-800 font-heading tracking-tight">Command Center</h2>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 lg:px-12 pb-24">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
