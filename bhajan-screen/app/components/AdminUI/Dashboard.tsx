"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Music2,
  Globe2,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  History,
  Sparkles,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MOCK_SONGS } from "@/app/lib/MockData";



const categoryData = [
  { name: "Praise", value: 35, color: "#6366f1" },
  { name: "Worship", value: 45, color: "#8b5cf6" },
  { name: "Cross", value: 12, color: "#ec4899" },
  { name: "Repentance", value: 8, color: "#f43f5e" },
];

const analyticData = [
  { name: "Jan", songs: 4 },
  { name: "Feb", songs: 7 },
  { name: "Mar", songs: 12 },
  { name: "Apr", songs: 18 },
  { name: "May", songs: 24 },
];

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Overview
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
            Manage your worship library and AI insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold"
              >
                U{i}
              </div>
            ))}
          </div>

          <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2">
            Generate Report <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Songs", value: "1,284", icon: Music2 },
          { label: "AI Usage", value: "452", icon: Globe2 },
          { label: "Active Users", value: "24", icon: Users },
          { label: "Weekly Growth", value: "18%", icon: Activity },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-50">
            <stat.icon className="text-indigo-600 mb-3" />
            <h3 className="text-slate-500 text-sm">{stat.label}</h3>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-50">
          <h3 className="font-bold mb-4">Library Growth</h3>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="songs" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-50">
          <h3 className="font-bold mb-4">Categories</h3>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" outerRadius={80}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent songs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        <div className="bg-white p-6 rounded-3xl border border-gray-50">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <History size={18} /> Recently Added
          </h3>

          {MOCK_SONGS.slice(0, 3).map((song, i) => (
            <div key={i} className="p-4 border-b">
              <h4 className="font-semibold">{song.title}</h4>
              <p className="text-sm text-slate-500">
                {song.category} • {song.scale}
              </p>
            </div>
          ))}
        </div>



        {/* Tips */}
        <div className="bg-white p-6 rounded-3xl border border-gray-50">
          <h3 className="font-bold mb-4">Pro Tips</h3>

          <div className="p-4 bg-indigo-600 text-white rounded-xl">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles size={16} /> AI Insights
            </div>
            <p className="text-sm mt-2">
              Use AI to generate worship notes automatically.
            </p>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
}