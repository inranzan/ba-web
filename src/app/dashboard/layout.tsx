"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Library, TrendingUp, User, LogOut, Trophy } from 'lucide-react';
import { auth } from '@/config/firebaseConfig';
import Image from 'next/image';
import baLogo from '../../../public/images/ba_logo.png';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
    
    if (!user) {
        router.push('/login');
        return null;
    }

    const navigation = [
        { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Subjects', href: '/dashboard/subjects', icon: Library },
        { name: 'Contests', href: '/dashboard/contests', icon: Trophy },
        { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden relative">
                            <Image src={baLogo} alt="Logo" className="object-contain p-1" fill sizes="40px" />
                        </div>
                        <span className="font-bold text-xl text-slate-900">BoardAbhyarthi</span>
                    </div>
                    
                    <nav className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                <div className="mt-auto p-6 border-t border-slate-100">
                    <button onClick={() => auth.signOut()} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 w-full transition-colors">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto pb-20 md:pb-0">
                {children}
            </div>
            
            {/* Mobile Bottom Bar (visible only on small screens) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                            <item.icon className="w-6 h-6" />
                            <span className="text-[10px] font-bold">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
