'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Globe, Send, BarChart3, Brain } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  {
    href: '/',
    label: '儀表板',
    labelEn: 'Dashboard',
    icon: BarChart3,
  },
  {
    href: '/seo',
    label: 'SEO 分析',
    labelEn: 'SEO Analysis',
    icon: Search,
  },
  {
    href: '/website-analysis',
    label: '網站分析',
    labelEn: 'Website Analysis',
    icon: Globe,
  },
  {
    href: '/publishing',
    label: 'AI 發佈建議',
    labelEn: 'Publishing AI',
    icon: Send,
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col shadow-xl z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">Claude SME</div>
            <div className="text-xs text-slate-400">AI Tools Platform</div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              <div>
                <div>{item.label}</div>
                <div className="text-xs opacity-60">{item.labelEn}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 text-center">
          Powered by Claude Opus 4.6
        </div>
      </div>
    </nav>
  );
}
