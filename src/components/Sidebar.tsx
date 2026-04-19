"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Search, 
  Users, 
  BuildingIcon, 
  FileText, 
  ListOrdered, 
  Award,
  Link as LinkIcon,
  LogOut,
  Image as ImageIcon,
  Megaphone
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Manage URLs', path: '/dashboard/urls', icon: LinkIcon },
  { name: 'App Banners', path: '/dashboard/banners', icon: ImageIcon },
  { name: 'Ads Control', path: '/dashboard/ads', icon: Megaphone },
  { name: 'Class 10', path: '/dashboard/class10', icon: BookOpen },
  { name: 'Class 12', path: '/dashboard/class12', icon: GraduationCap },
  { name: 'Roll Number Search', path: '/dashboard/rollnumbersearch', icon: Search },
  { name: 'Name Wise', path: '/dashboard/namewise', icon: Users },
  { name: 'School Code', path: '/dashboard/schoolcode', icon: BuildingIcon },
  { name: 'Results', path: '/dashboard/results', icon: FileText },
  { name: 'Roll Number Wise', path: '/dashboard/rollnumberwise', icon: ListOrdered },
  { name: 'Grading', path: '/dashboard/grading', icon: Award },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-2">
          <GraduationCap className="text-primary" /> UP Board Panel
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 sidebar-scroll">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path}>
              <div className={`relative flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/20 rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 mr-3 relative z-10 ${isActive ? 'text-primary-light' : 'group-hover:text-slate-300'}`} />
                <span className="font-medium relative z-10">{item.name}</span>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md z-10" />}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
