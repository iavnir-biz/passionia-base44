import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Target, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Sparkles,
  ChevronRight,
  MessageCircle,
  Lock,
  Send,
  User,
  Magnet,
  Share2,
  Package,
  ChevronDown,
  BarChart3
} from "lucide-react";
import ProgressBar from '@/components/ui/ProgressBar';

const menuStructure = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Ressources IA', icon: Sparkles, page: 'AIResources' },
  { name: 'Plan d\'action', icon: Target, page: 'PlanAction' },
  { name: 'Discuter avec Noah', icon: MessageCircle, page: 'NovaChat', locked: true },
];

export default function Sidebar({ currentPage, progress = 0 }) {
  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">PASSION IA</h1>
            <p className="text-xs text-gray-600">Transformer son savoir-faire en activité de formation en ligne</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progression globale</span>
          <span className="text-sm font-semibold text-[#61f7a2]">{progress}%</span>
        </div>
        <ProgressBar value={progress} max={100} size="sm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuStructure.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-[#61f7a2]/10 text-[#61f7a2] border border-[#61f7a2]/20" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-blue-900/10"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 font-medium">{item.name}</span>
              {item.locked && <Lock className="w-3.5 h-3.5 text-gray-500" />}
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to={createPageUrl('Settings')}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1",
            currentPage === 'Settings'
              ? "bg-[#61f7a2]/10 text-[#61f7a2] border border-[#61f7a2]/20"
              : "text-gray-600 hover:text-gray-900 hover:bg-blue-900/10"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Paramètres</span>
        </Link>
        <button 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-red-500 hover:bg-blue-900/10 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}