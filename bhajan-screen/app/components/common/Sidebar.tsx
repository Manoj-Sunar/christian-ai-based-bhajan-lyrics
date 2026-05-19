"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Music,
  PlusCircle,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { View } from "@/app/types";
import { cn } from "@/app/lib/utils";
import Link from "next/link";


interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard,href:"/admin/dashboard" },
    { id: "songs", label: "All Songs", icon: Music ,href:"/admin/song"},
    { id: "add-song", label: "Add Song", icon: PlusCircle,href:"/admin/song-editor" },
    { id: "ai-tools", label: "AI Tools", icon: Sparkles,href:"" },
    { id: "settings", label: "Settings", icon: Settings ,href:""},
  ];

  const NavItem = ({ item }: { item: (typeof menuItems)[0] }) => {
    const isActive = currentView === item.id;

    return (
      <Link
      href={item.href}
        onClick={() => {
          onViewChange(item.id as View);
          setIsMobileMenuOpen(false);
        }}
        className={cn(
          "flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all relative",
          isActive
            ? "bg-indigo-600 text-white shadow-lg"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <item.icon size={20} />
        <span className="font-medium text-sm hidden lg:block">
          {item.label}
        </span>

        {isActive && (
          <motion.div
            layoutId="active-indicator"
            className="absolute left-0 w-1 h-6 bg-white rounded-r-full hidden lg:block"
          />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white  flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Music className="text-indigo-600" />
          <span className="font-bold">WorshipFlow</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-2"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white  h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <Music className="text-indigo-600" />
          <span className="font-bold text-xl">WorshipFlow</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t">
          <button className="flex items-center gap-2 text-red-500 text-sm">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-white z-40 pt-20 px-4"
          >
            <nav className="space-y-4">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id as View);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center w-full gap-4 px-5 py-4 rounded-xl text-lg",
                      currentView === item.id
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600"
                    )}
                  >
                    <Icon size={22} />
                    {item.label}

                    {currentView === item.id && (
                      <ChevronRight className="ml-auto" size={18} />
                    )}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}