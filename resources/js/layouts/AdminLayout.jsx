import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    ShieldCheck, 
    Wrench, 
    BarChart3, 
    Plus, 
    Settings, 
    HelpCircle, 
    LogOut, 
    Search, 
    Bell
} from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    
    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
        { icon: <Users size={20} />, label: 'User Management', path: '/admin/users' },
        { icon: <ShieldCheck size={20} />, label: 'Partner Verification', path: '/admin/partners' },
        { icon: <Wrench size={20} />, label: 'Service Content', path: '/admin/services' },
        { icon: <BarChart3 size={20} />, label: 'Reports', path: '/admin/reports' },
    ];

    const bottomItems = [
        { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
        { icon: <HelpCircle size={20} />, label: 'Support', path: '/admin/support' },
    ];

    return (
        <div className="flex h-screen bg-background text-on-background font-sans overflow-hidden">
            {/* SideNavBar */}
            <nav className="hidden md:flex flex-col h-screen w-64 bg-surface-container border-r border-outline-variant shadow-md flex-shrink-0 z-50">
                {/* Header */}
                <div className="px-6 py-8 flex flex-col items-start gap-1 border-b border-outline-variant/30">
                    <h1 className="text-xl font-black text-primary tracking-tight">GoTam</h1>
                    <span className="text-[12px] font-semibold text-on-surface-variant tracking-wider">Admin Console</span>
                </div>

                {/* Main Tabs */}
                <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all rounded-lg ${
                                    isActive 
                                    ? 'bg-secondary-container text-on-secondary-container font-bold scale-95' 
                                    : 'text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                            >
                                <span className={isActive ? 'fill-icon' : ''}>{item.icon}</span>
                                <span className="text-[14px]">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* CTA & Footer Tabs */}
                <div className="p-4 flex flex-col gap-2 border-t border-outline-variant/30">
                    <button className="w-full bg-primary text-on-primary py-3 rounded-lg flex items-center justify-center gap-2 mb-2 hover:bg-primary/90 transition-colors shadow-sm font-semibold">
                        <Plus size={20} />
                        <span>New Service Audit</span>
                    </button>
                    {bottomItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="text-on-surface-variant hover:bg-surface-container-high rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-colors text-[14px]"
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <button className="text-on-surface-variant hover:bg-surface-container-high rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-colors text-[14px]">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>

            {/* Main Content Wrapper */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* TopAppBar */}
                <header className="flex justify-between items-center w-full px-6 h-16 sticky top-0 z-40 bg-surface shadow-sm transition-colors text-primary border-b border-outline-variant/20">
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant focus-within:border-primary transition-all">
                            <Search size={18} className="text-outline mr-2" />
                            <input 
                                className="bg-transparent border-none outline-none text-[14px] text-on-surface placeholder:text-outline w-64 p-0 focus:ring-0" 
                                placeholder="Search records..." 
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors opacity-80 hover:opacity-100">
                            <Bell size={20} />
                        </button>
                        <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors opacity-80 hover:opacity-100 mr-2">
                            <HelpCircle size={20} />
                        </button>
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant cursor-pointer ring-2 ring-surface-container">
                            <img 
                                alt="Admin Profile" 
                                className="w-full h-full object-cover" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4LlosYiyHlwfAldcktXsb6Ixar7zasujxgZRoDDAi_dds3KE7alsN8P83bnnp9K3eJZRul4jPcYt9a97G4ggiUQGo0FQcvsmSsKQG2x6nuKkjNIowiajWHtQHePrrN7R1Kjc_OhHTWGU1VGYHb2Kh8rEBUzO90o0dcunmqxxOPts_ZrmwEiRP9cRzYYFUtSzbxiGtYwNIkbMPLWX66RtGn_hRNms4vnAdD7Bn9OPaLh0baxXYGXyaeE7AMFPcWDsAt8vTCopsdnxq"
                            />
                        </div>
                    </div>
                </header>

                {/* Scrollable Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-6 pb-10 flex flex-col bg-background custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
