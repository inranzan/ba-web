"use client";
import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/config/firebaseConfig';
import { Flame, Settings, Upload, Bell, LogOut, ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
    const { userData } = useAuth();
    const router = useRouter();
    const [reminders, setReminders] = useState(true);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.push('/login');
        } catch (error) {
            console.error("Logout Error", error);
        }
    };

    return (
        <div className="min-h-full bg-slate-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto pb-32">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-slate-900">Profile</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-xl border-2 border-yellow-200">
                            <Flame className="w-5 h-5 text-yellow-600 fill-yellow-500" />
                            <span className="font-bold text-yellow-800">{userData?.streak || 0} Streak</span>
                        </div>
                    </div>
                </div>

                {/* Avatar & Info */}
                <div className="flex flex-col items-center mb-12">
                    <div className="relative w-32 h-32 mb-4">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white bg-blue-50 shadow-xl p-2">
                            <img 
                                src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${userData?.name || "Student"}&backgroundColor=eef2ff`}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-1">{userData?.name || "Student"}</h2>
                    <p className="text-slate-500 font-medium">Class {userData?.class || "N/A"} • {userData?.board || "N/A"}</p>
                </div>

                {/* Admin Section */}
                {userData?.role === "admin" && (
                    <div className="mb-10">
                        <h3 className="text-slate-900 font-bold text-xl mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                            Administration
                        </h3>
                        <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <button onClick={() => router.push("/admin")} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="font-bold text-slate-800 text-lg">Content Upload Portal</span>
                                </div>
                                <span className="text-slate-400 font-medium">Open &rarr;</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* 30-Day Activity Heatmap */}
                <div className="mb-10">
                    <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-8 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">30-Day Activity</h3>
                        <div className="flex justify-center">
                            <div className="flex gap-2 md:gap-3">
                                {[...Array(6)].map((_, colIdx) => (
                                    <div key={colIdx} className="flex flex-col gap-2 md:gap-3">
                                        {[...Array(5)].map((_, rowIdx) => {
                                            const dayOffset = (5 - colIdx) * 5 + (4 - rowIdx);
                                            const d = new Date();
                                            d.setDate(d.getDate() - dayOffset);
                                            const dateStr = d.toISOString().split("T")[0];

                                            const xpVal = userData?.dailyActivity?.[dateStr] || 0;

                                            let opacityLevel = 0;
                                            if (xpVal > 0) opacityLevel = 30;
                                            if (xpVal >= 5) opacityLevel = 50;
                                            if (xpVal >= 10) opacityLevel = 70;
                                            if (xpVal >= 20) opacityLevel = 90;
                                            if (xpVal >= 40) opacityLevel = 100;

                                            const isBlank = opacityLevel === 0;

                                            let textColor = "text-slate-400";
                                            if (opacityLevel > 50) textColor = "text-white";
                                            else if (opacityLevel > 0) textColor = "text-blue-900";

                                            return (
                                                <div 
                                                    key={rowIdx}
                                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-110 cursor-default ${isBlank ? "bg-slate-100 border border-slate-200" : ""}`}
                                                    style={!isBlank ? { backgroundColor: `rgba(37, 99, 235, ${opacityLevel / 100})` } : {}}
                                                    title={`${d.toDateString()}: ${xpVal} XP`}
                                                >
                                                    <span className={`text-[9px] md:text-[10px] font-black ${textColor}`}>
                                                        {d.getDate()}/{d.getMonth() + 1}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 px-1">Preferences</h3>
                    <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <Bell className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="font-bold text-slate-800 text-lg">Daily Reminders</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={reminders} onChange={(e) => setReminders(e.target.checked)} />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 p-5 bg-white border-2 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-3xl transition-colors group shadow-sm"
                >
                    <LogOut className="w-6 h-6 text-red-500 group-hover:text-red-600 transition-colors" />
                    <span className="font-bold text-red-500 group-hover:text-red-600 transition-colors text-lg">Log Out</span>
                </button>
            </div>
        </div>
    );
}
