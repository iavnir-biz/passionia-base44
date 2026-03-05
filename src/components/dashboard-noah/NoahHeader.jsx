import React from 'react';
import { Bell, LayoutGrid, Menu, ArrowRight } from 'lucide-react';

export default function NoahHeader({ onMenuClick, onToggleSidebar }) {
  return (
    <header className="h-14 bg-white border-b border-[#e5e5e5] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 -ml-2 rounded-lg text-[#888] hover:bg-[#f5f5f5] lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <button onClick={onToggleSidebar} className="hidden lg:flex p-2 rounded-lg text-[#888] hover:bg-[#f5f5f5] -ml-1">
          <LayoutGrid className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 text-sm text-[#888]">
          <span className="font-medium text-[#1a1a1a]">Overview</span>
          <span>›</span>
          <span>Accueil</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#1a1a1a', color: '#fff', border: 'none',
            padding: '7px 16px', borderRadius: '100px', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          Parrainer un ami <span style={{ fontSize: '10px', opacity: 0.6 }}>(gagner 20€)</span>
          <ArrowRight size={12} />
        </a>
        <button className="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#888] hover:text-[#1a1a1a] hover:bg-[#eee] transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}