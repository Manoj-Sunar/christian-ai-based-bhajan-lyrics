"use client";

import React from "react";
import { Music4, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthLayout({
    children,
    title,
    subtitle,
}: {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4  relative overflow-hidden">
          

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl grid lg:grid-cols-2   rounded-3xl overflow-hidden border border-white/10"
            >
                {/* LEFT SIDE */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600/95 to-violet-600/95">
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                                <Music4 className="text-indigo-600" />
                            </div>
                            <h1 className="text-white font-bold text-2xl">WorshipFlow</h1>
                        </div>

                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Empower your <span className="text-indigo-300">ministry</span>
                            <br />
                            with music & AI
                        </h2>

                        <p className="text-indigo-100/70 mt-6 max-w-md">
                            Manage songs, Bhajans, and worship experiences with modern tools.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 p-5 bg-white/10 rounded-2xl">
                        <Heart className="text-white" />
                        <p className="text-sm text-white">
                            Built with love for worship communities
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="bg-white border border-gray-200 p-8 lg:p-14">
                    <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
                    <p className="text-slate-500 mt-2 mb-8">{subtitle}</p>

                    {children}
                </div>
            </motion.div>
        </div>
    );
}