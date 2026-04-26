"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Trophy, Medal, UserPlus, RefreshCw } from 'lucide-react';

export default function ProgressPage() {
    const { userData, user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLeaderboard = async () => {
        try {
            const d = new Date();
            const yearStart = new Date(d.getFullYear(), 0, 1);
            const days = Math.floor((d.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
            const currentWeekKey = `${d.getFullYear()}_W${Math.ceil((days + yearStart.getDay() + 1) / 7)}`;

            const q = query(
                collection(db, "users"),
                where("activeWeek", "==", currentWeekKey)
            );
            const snap = await getDocs(q);
            let data: any[] = [];
            snap.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            
            if (data.length === 0) {
                const fbq = query(collection(db, "users"), orderBy("xp", "desc"), limit(20));
                const fbsnap = await getDocs(fbq);
                fbsnap.forEach((doc) => {
                    const u: any = { id: doc.id, ...doc.data() };
                    u.weeklyXP = u.xp || 0;
                    data.push(u);
                });
            } else {
                data.sort((a, b) => (b.weeklyXP || 0) - (a.weeklyXP || 0));
                data = data.slice(0, 20);
            }
            
            setUsers(data);
        } catch (err) {
            console.error("Leaderboard fetch failed:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchLeaderboard();
        setRefreshing(false);
    }, []);

    const getMyRank = () => {
        if (!user) return null;
        const idx = users.findIndex((u) => u.id === user.uid);
        if (idx === -1) return "50+";
        return idx + 1;
    };

    if (loading) return <div className="flex h-full items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    const top3 = users.slice(0, 3);
    const others = users.slice(3);
    const myRank = getMyRank();

    return (
        <div className="min-h-full bg-slate-50 p-4 md:p-8 relative">
            <div className="max-w-4xl mx-auto pb-32">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-slate-900">Leaderboard</h1>
                    <button onClick={onRefresh} disabled={refreshing} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Podium Section */}
                {top3.length > 0 && (
                    <div className="flex justify-center items-end gap-4 mt-16 mb-16 h-64">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <div className="flex flex-col items-center w-1/3 max-w-[150px]">
                                <div className="relative flex flex-col items-center mb-4">
                                    <Medal className="w-8 h-8 text-slate-400 absolute -top-8" />
                                    <img 
                                        src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${top3[1].name || "Guest"}&backgroundColor=eef2ff`}
                                        className="w-20 h-20 rounded-full border-4 border-slate-300 shadow-lg bg-indigo-50"
                                    />
                                    <span className="font-bold text-slate-800 mt-3">{top3[1].name}</span>
                                    <span className="text-sm font-black text-slate-500">{top3[1].weeklyXP || 0} XP</span>
                                </div>
                                <div className="w-full h-32 bg-slate-300 rounded-t-3xl border-2 border-b-0 border-white flex justify-center pt-4 shadow-inner">
                                    <span className="text-5xl font-black text-white/90">2</span>
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {top3[0] && (
                            <div className="flex flex-col items-center w-[40%] max-w-[180px] z-10">
                                <div className="relative flex flex-col items-center mb-4">
                                    <Trophy className="w-12 h-12 text-yellow-500 fill-yellow-500 absolute -top-12" />
                                    <img 
                                        src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${top3[0].name || "Guest"}&backgroundColor=fefce8`}
                                        className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-2xl bg-yellow-50"
                                    />
                                    <span className="font-black text-slate-900 mt-3 text-lg">{top3[0].name}</span>
                                    <span className="text-sm font-black text-yellow-600">{top3[0].weeklyXP || 0} XP</span>
                                </div>
                                <div className="w-full h-40 bg-yellow-400 rounded-t-3xl border-2 border-b-0 border-white flex justify-center pt-4 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]">
                                    <span className="text-6xl font-black text-white/90">1</span>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                            <div className="flex flex-col items-center w-1/3 max-w-[150px]">
                                <div className="relative flex flex-col items-center mb-4">
                                    <Medal className="w-8 h-8 text-amber-600 absolute -top-8" />
                                    <img 
                                        src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${top3[2].name || "Guest"}&backgroundColor=fff7ed`}
                                        className="w-20 h-20 rounded-full border-4 border-amber-500 shadow-lg bg-orange-50"
                                    />
                                    <span className="font-bold text-slate-800 mt-3">{top3[2].name}</span>
                                    <span className="text-sm font-black text-slate-500">{top3[2].weeklyXP || 0} XP</span>
                                </div>
                                <div className="w-full h-24 bg-amber-500 rounded-t-3xl border-2 border-b-0 border-white flex justify-center pt-4 shadow-inner">
                                    <span className="text-5xl font-black text-white/90">3</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* List */}
                <div className="space-y-4 max-w-2xl mx-auto">
                    {others.map((u, idx) => (
                        <div key={u.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] ${u.id === user?.uid ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                            <span className="w-8 text-center font-bold text-slate-400 text-lg">{idx + 4}</span>
                            <img 
                                src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${u.name || "Guest"}&backgroundColor=transparent`}
                                className="w-12 h-12 rounded-full border bg-slate-100"
                            />
                            <div className="flex-1">
                                <span className="font-bold text-slate-800 block">{u.name || "Student"}</span>
                                <span className="text-xs text-slate-500 font-medium">{u.institute || "Independent"}</span>
                            </div>
                            <span className="font-black text-blue-600">{u.weeklyXP || 0} XP</span>
                        </div>
                    ))}
                    
                    <div className="mt-12 bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <UserPlus className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-2">Invite more friends</h3>
                        <p className="text-slate-500 mb-6 max-w-md">Studying is better together. Challenge your classmates and climb the ranks!</p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-blue-600/30">
                            Share Invite Link
                        </button>
                    </div>
                </div>
            </div>

            {/* Sticky Current User Row */}
            {user && userData && (
                <div className="fixed md:absolute bottom-20 md:bottom-8 left-4 right-4 md:left-8 md:right-8 z-40 max-w-2xl mx-auto pointer-events-none">
                    <div className="bg-slate-900 rounded-3xl p-4 flex items-center gap-4 border border-white/10 shadow-2xl shadow-slate-900/50 pointer-events-auto">
                        <span className="w-8 text-center font-black text-white/50">{myRank}</span>
                        <img 
                            src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${userData.name || "Guest"}&backgroundColor=transparent`}
                            className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-800"
                        />
                        <div className="flex-1">
                            <span className="font-bold text-white block">You</span>
                            <span className="text-xs font-bold text-blue-400 tracking-wider">KEEP GOING!</span>
                        </div>
                        <span className="font-black text-white text-xl">{userData.weeklyXP || 0} XP</span>
                    </div>
                </div>
            )}
        </div>
    );
}
