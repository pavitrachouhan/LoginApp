import React from 'react';
import { LayoutDashboard, Users, Box, CalendarDays, BarChart3, Settings, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
    { icon: <Users size={20} />, label: 'Employees', active: false },
    { icon: <Box size={20} />, label: 'Assets', active: false },
    { icon: <CalendarDays size={20} />, label: 'Leaves', active: false },
    { icon: <BarChart3 size={20} />, label: 'Reports', active: false },
    { icon: <Settings size={20} />, label: 'Settings', active: false },
  ];

  return (
    <div className="w-64 bg-slate-900 flex flex-col hidden lg:flex">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">EnterpriseOS</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
              item.active 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">AD</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">admin@enterprise.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;