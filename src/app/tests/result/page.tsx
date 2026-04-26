"use client";
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trophy, ArrowRight, Activity, Zap } from 'lucide-react';

export default function TestResult() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const score = parseInt(searchParams.get('score') || '0');
    const total = parseInt(searchParams.get('total') || '0');
    const xpEarned = parseInt(searchParams.get('xpEarned') || '0');
    const isContest = searchParams.get('isContest') === 'true';

    const percentage = total > 0 ? (score / total) * 100 : 0;
    
    let message = "Good effort!";
    if (percentage === 100) message = "Perfect Score! Amazing!";
    else if (percentage >= 80) message = "Excellent work!";
    else if (percentage >= 50) message = "Well done! Keep practicing.";

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
                <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping opacity-20"></div>
                    <Trophy className="w-16 h-16 text-blue-600" />
                </div>

                <h1 className="text-4xl font-black text-slate-900 mb-2">{message}</h1>
                <p className="text-slate-500 font-medium mb-8">You completed the {isContest ? "Contest" : "Test"}.</p>

                <div className="flex items-center justify-center gap-6 mb-10">
                    <div className="bg-slate-50 rounded-3xl p-6 flex-1 border-2 border-slate-100">
                        <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Score</p>
                        <p className="text-3xl font-black text-slate-900">{score}<span className="text-lg text-slate-400">/{total}</span></p>
                    </div>
                    <div className="bg-yellow-50 rounded-3xl p-6 flex-1 border-2 border-yellow-100">
                        <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2 fill-yellow-500" />
                        <p className="text-sm font-bold text-yellow-600 uppercase tracking-widest mb-1">XP Earned</p>
                        <p className="text-3xl font-black text-yellow-700">+{xpEarned}</p>
                    </div>
                </div>

                <button 
                    onClick={() => router.replace('/dashboard')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 shadow-xl shadow-blue-600/30"
                >
                    Return to Hub
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
