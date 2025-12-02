import React from 'react';
import { Bell, User } from "lucide-react";

export default function TopBar({ title, subtitle, user }) {
  return (
    <header className="h-20 bg-[#11112b]/80 backdrop-blur-xl border-b border-[#2a2a45] flex items-center justify-between px-8 sticky top-0 z-40">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-xl bg-[#1b1b33] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a2a45] transition-all">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-[#2a2a45]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
            <User className="w-5 h-5 text-[#11112b]" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.full_name || 'Utilisateur'}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}