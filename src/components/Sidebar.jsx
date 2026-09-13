import React from 'react';
import {
  LayoutDashboard,
  Network,
  Cpu,
  Users,
  LineChart,
  ShieldAlert,
  FileCheck2,
  Server,
  HeartPulse,
  FileText,
  Settings,
  BookOpen,
  Info,
  Lock,
  Terminal
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate, alertCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Core Monitoring' },
    { id: 'network', label: 'Network', icon: Network, category: 'Core Monitoring' },
    { id: 'processes', label: 'Processes', icon: Cpu, category: 'Core Monitoring' },
    { id: 'users', label: 'Users', icon: Users, category: 'Core Monitoring' },
    { id: 'history', label: 'History', icon: LineChart, category: 'Analytics' },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert, badge: alertCount > 0 ? alertCount : null, category: 'Security' },
    { id: 'file-monitor', label: 'File Monitor', icon: FileCheck2, category: 'Security' },
    { id: 'service', label: 'Service', icon: Server, category: 'Management' },
    { id: 'doctor', label: 'Doctor', icon: HeartPulse, category: 'Management' },
    { id: 'reports', label: 'Reports', icon: FileText, category: 'Management' },
    { id: 'configuration', label: 'Configuration', icon: Settings, category: 'Management' },
    { id: 'documentation', label: 'Documentation', icon: BookOpen, category: 'Information' },
    { id: 'about', label: 'About', icon: Info, category: 'Information' },
    { id: 'privacy', label: 'Privacy', icon: Lock, category: 'Information' }
  ];

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-[#1f293d] flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1f293d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
            NW
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-white font-mono flex items-center gap-1.5">
              NETWATCH
              <span className="text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate max-w-[130px]">Defensive SOC Monitor</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {['Core Monitoring', 'Security', 'Analytics', 'Management', 'Information'].map((cat) => {
          const items = navItems.filter((item) => item.category === cat);
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {cat}
              </div>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#151c2e]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-red-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* CLI Quick Reference */}
      <div className="p-4 border-t border-[#1f293d] bg-[#0a0f1d]/50">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1.5 font-mono font-semibold">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>CLI Dispatcher</span>
        </div>
        <code className="block bg-[#111827] text-cyan-300 font-mono text-[11px] p-2 rounded border border-[#1f293d]">
          monitor-ctl status
        </code>
      </div>
    </aside>
  );
}
