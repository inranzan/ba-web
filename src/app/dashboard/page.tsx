"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { STATIC_SUBJECTS } from '@/constants/data';
import { Flame, Activity, Award, Dices, BookOpen, Ticket, RefreshCw, CheckCircle2, History } from 'lucide-react';

export default function DashboardHome() {
    const { userData } = useAuth();
    const router = useRouter();
    const [latestContest, setLatestContest] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    const fetchLatest = async () => {
        try {
            const q = query(
                collection(db, "contests"),
                orderBy("createdAt", "desc"),
                limit(1),
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                setLatestContest({
                    id: snap.docs[0].id,
                    ...snap.docs[0].data(),
                });
            }
        } catch (e) {
            console.log("Error fetching latest contest", e);
        }
    };

    useEffect(() => {
        fetchLatest();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchLatest();
        setRefreshing(false);
    }, []);

    const missionsState = userData?.dailyMissions?.[today] || {
        obs: 0,
        subs: 0,
        rnds: 0,
    };
    
    const missionsList = [
        { id: "m1", title: "Deep Writer", subtitle: "Solve 2 Subjectives", current: missionsState.subs, target: 2, xp: 20 },
        { id: "m2", title: "Quick Thinker", subtitle: "Solve 10 Objectives", current: missionsState.obs, target: 10, xp: 15 },
        { id: "m3", title: "Roulette", subtitle: "Survive 1 Random Drop", current: missionsState.rnds, target: 1, xp: 25 },
    ];
    
    const missionsCompleted = missionsList.filter((m) => m.current >= m.target).length;

    return (
        <div className="min-h-full bg-slate-50 flex flex-col p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
                        <img 
                            src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${userData?.name || "Guest"}&backgroundColor=transparent`}
                            alt="Avatar"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                        Hi, {userData?.name?.split(" ")[0] || "Student"}
                    </h1>
                </div>
                <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-2xl border-2 border-yellow-200 shadow-sm">
                    <Flame className="w-6 h-6 text-yellow-600 fill-yellow-500" />
                    <span className="font-bold text-yellow-800 text-lg">{userData?.streak || 0} Streak</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full space-y-8">
                {/* Refresh Header */}
                <div className="flex justify-end">
                    <button onClick={onRefresh} disabled={refreshing} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                </div>

                {/* Today Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 flex items-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mr-6">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Today's XP</p>
                            <p className="text-4xl font-black text-slate-800">{userData?.dailyActivity?.[today] || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 flex items-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-6">
                            <Award className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total XP</p>
                            <p className="text-4xl font-black text-slate-800">{userData?.xp || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Action Carousel */}
                <div>
                    <h2 className="text-base font-bold text-slate-500 mb-4 uppercase tracking-wider">Start Learning</h2>
                    
                    <button 
                        onClick={() => router.push(`/tests/random`)}
                        className="w-full text-left bg-slate-900 rounded-3xl p-8 mb-4 relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                    >
                        <div className="absolute -right-10 -top-10 w-48 h-48 bg-slate-800 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-slate-800 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 delay-75" />
                        
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-slate-300">
                                    <Dices className="w-5 h-5" />
                                    <span className="font-semibold text-sm">Quick Play</span>
                                </div>
                                <h3 className="text-3xl font-black text-white mb-2">Randomizer Drop</h3>
                                <p className="text-slate-400 font-medium">10 random questions across all subjects</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            onClick={() => {
                                const availSubjects = STATIC_SUBJECTS.filter(s => s.classId === (userData?.class || "12th"));
                                const tgt = availSubjects.length > 0 ? availSubjects[Math.floor(Math.random() * availSubjects.length)] : STATIC_SUBJECTS[0];
                                router.push(`/dashboard/subjects`);
                            }}
                            className="bg-blue-600 rounded-3xl p-6 border-2 border-blue-700 relative overflow-hidden group shadow-md hover:-translate-y-1 transition-all"
                        >
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                            <div className="relative z-10 flex flex-col h-full justify-between items-start text-left">
                                <BookOpen className="w-10 h-10 text-white mb-4" />
                                <span className="text-white text-xl font-bold">Subject Select</span>
                            </div>
                        </button>

                        {latestContest ? (
                            <button 
                                onClick={() => router.push(`/tests/contest/${latestContest.id}`)}
                                className="bg-amber-500 rounded-3xl p-6 border-2 border-amber-600 relative overflow-hidden group shadow-md hover:-translate-y-1 transition-all text-left"
                            >
                                <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-400 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                                <div className="relative z-10 flex flex-col h-full justify-between items-start">
                                    <Ticket className="w-10 h-10 text-white mb-4" />
                                    <span className="text-white text-xl font-bold leading-tight mb-2 line-clamp-2">{latestContest.title}</span>
                                    <span className="bg-white/30 px-3 py-1 rounded-lg text-white text-xs font-black tracking-widest">LATEST CONTEST</span>
                                </div>
                            </button>
                        ) : (
                            <button 
                                disabled
                                className="bg-slate-200 rounded-3xl p-6 border-2 border-slate-300 flex flex-col items-center justify-center gap-3"
                            >
                                <History className="w-10 h-10 text-slate-400" />
                                <span className="text-slate-500 font-bold text-lg">No Contests</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Daily Quests */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-slate-500 uppercase tracking-wider">Missions</h2>
                        <span className="text-blue-600 font-black text-sm px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                            {missionsCompleted} / {missionsList.length} Done
                        </span>
                    </div>

                    <div className="space-y-4">
                        {missionsList.map((m) => {
                            const isComplete = m.current >= m.target;
                            const progressWidth = Math.min((m.current / m.target) * 100, 100);

                            return (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        if (m.title === "Roulette") router.push('/tests/random');
                                        else router.push('/dashboard/subjects');
                                    }}
                                    className={`w-full text-left rounded-3xl p-5 border-2 shadow-sm flex items-center gap-5 transition-all hover:-translate-y-1 ${isComplete ? "bg-green-50 border-green-200 hover:shadow-green-100" : "bg-white border-slate-200 hover:border-blue-300"}`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isComplete ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold mb-1 ${isComplete ? "text-green-800" : "text-slate-800"}`}>{m.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium mb-3">{m.subtitle}</p>
                                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${isComplete ? "bg-green-500" : "bg-blue-600"}`}
                                                style={{ width: `${progressWidth}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0">
                                        <span className={`text-sm font-bold mb-2 ${isComplete ? "text-green-600" : "text-slate-500"}`}>
                                            {Math.min(m.current, m.target)} / {m.target}
                                        </span>
                                        <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 px-3 py-1.5 rounded-xl">
                                            <Flame className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-bold text-yellow-700">{m.xp}</span>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
