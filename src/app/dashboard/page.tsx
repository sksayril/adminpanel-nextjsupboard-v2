"use client";

import { motion } from 'framer-motion';
import { Users, BookOpen, Search, Activity } from 'lucide-react';

const stats = [
  { name: 'Total Students', value: '1,245', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Class 10 Results', value: '850', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { name: 'Class 12 Results', value: '395', icon: BookOpen, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { name: 'Queries Today', value: '124', icon: Search, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Overview</h2>
          <p className="text-slate-400 mt-1">Welcome to the UP Board Admin Panel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.name}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${stat.bg} blur-2xl group-hover:scale-150 transition-transform duration-500`} />
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
         >
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
             <Activity className="text-slate-400 w-5 h-5" />
           </div>
           <div className="space-y-4">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-800/50 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-white text-sm">Result published for Class 10</p>
                    <p className="text-slate-500 text-xs mt-1">2 hours ago</p>
                  </div>
               </div>
             ))}
           </div>
         </motion.div>
      </div>
    </div>
  );
}
