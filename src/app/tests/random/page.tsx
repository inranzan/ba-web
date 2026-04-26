"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collectionGroup, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { X, Timer, CheckCircle } from 'lucide-react';

export default function RandomTest() {
    const router = useRouter();
    const { user, userData, setUserData } = useAuth();

    const [questions, setQuestions] = useState<any[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [testActive, setTestActive] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const qRef = collectionGroup(db, "questions");
                const qSnap = await getDocs(query(qRef, where("type", "==", "objective")));
                
                let qData: any[] = [];
                qSnap.forEach((doc) => {
                    qData.push({ id: doc.id, ...doc.data() });
                });
                
                qData = qData.sort(() => Math.random() - 0.5).slice(0, 10);

                setQuestions(qData);
                setTimeLeft(qData.length * 60);
            } catch (err) {
                console.error("Fetch random failed:", err);
            }
            setLoading(false);
        };

        fetchQuestions();
    }, []);

    useEffect(() => {
        if (!testActive || timeLeft === null) return;
        if (timeLeft <= 0) {
            handleTestSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, testActive]);

    const handleTestSubmit = async () => {
        if (!testActive) return;
        setTestActive(false);

        let correctAnswers = 0;
        questions.forEach((q) => {
            if (userAnswers[q.id] === q.answer) correctAnswers += 1;
        });

        let gainedXP = correctAnswers;

        if (user && userData && gainedXP > 0) {
            try {
                const userRef = doc(db, 'users', user.uid);
                const today = new Date().toISOString().split('T')[0];
                
                const newDailyActivity = { ...(userData.dailyActivity || {}) };
                newDailyActivity[today] = (newDailyActivity[today] || 0) + gainedXP;
                
                const newDailyMissions = { ...(userData.dailyMissions || {}) };
                const tStats = newDailyMissions[today] || { obs: 0, subs: 0, rnds: 0 };
                tStats.rnds += 1;
                newDailyMissions[today] = tStats;

                let currentXP = userData.xp || 0;
                currentXP += gainedXP;

                const d = new Date();
                const yearStart = new Date(d.getFullYear(), 0, 1);
                const days = Math.floor((d.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
                const currentWeekKey = `${d.getFullYear()}_W${Math.ceil((days + yearStart.getDay() + 1) / 7)}`;

                let currentWeeklyXP = userData.weeklyXP || 0;
                if (userData.activeWeek !== currentWeekKey) {
                    currentWeeklyXP = gainedXP;
                } else {
                    currentWeeklyXP += gainedXP;
                }

                await updateDoc(userRef, {
                    xp: currentXP,
                    dailyActivity: newDailyActivity,
                    dailyMissions: newDailyMissions,
                    weeklyXP: currentWeeklyXP,
                    activeWeek: currentWeekKey
                });

                setUserData({ ...userData, xp: currentXP, dailyActivity: newDailyActivity, dailyMissions: newDailyMissions, weeklyXP: currentWeeklyXP, activeWeek: currentWeekKey });
            } catch (e) {
                console.error("Failed to update XP:", e);
            }
        }

        router.replace(`/tests/result?score=${correctAnswers}&total=${questions.length}&xpEarned=${gainedXP}&isContest=false`);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-900"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><span className="text-slate-400 ml-4 font-bold tracking-widest">ASSEMBLING DROP...</span></div>;

    if (questions.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
                <div className="text-center">
                    <p className="text-slate-400 mb-4 font-medium">You need to upload some objective questions globally first!</p>
                    <button onClick={() => router.back()} className="px-6 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors">Go Back</button>
                </div>
            </div>
        );
    }

    const questionData = questions[currentQuestionIndex];
    const currentSelection = userAnswers[questionData?.id];

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col text-slate-200">
            {/* Progress Bar & Header */}
            <div className="w-full z-10 bg-slate-800 shadow-sm border-b border-slate-700">
                <div className="w-full h-2 bg-slate-700">
                    <div className="h-full bg-green-500 rounded-r-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between p-4 max-w-4xl mx-auto w-full">
                    <button 
                        className="w-12 h-12 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 transition-colors flex"
                        onClick={() => {
                            if (window.confirm("Are you sure you want to quit? Progress will be lost.")) {
                                router.back();
                            }
                        }}
                        disabled={!testActive}
                    >
                        <X className="w-6 h-6 text-slate-300" />
                    </button>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-colors ${timeLeft !== null && timeLeft < 60 ? "bg-red-900/50 border-red-800" : "bg-slate-700 border-slate-600"}`}>
                        <Timer className={`w-5 h-5 ${timeLeft !== null && timeLeft < 60 ? "text-red-400" : "text-blue-400"}`} />
                        <span className={`font-mono font-black tracking-widest text-lg ${timeLeft !== null && timeLeft < 60 ? "text-red-300" : "text-blue-300"}`}>
                            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8 flex flex-col pb-32">
                <div className="w-full pb-8 items-center text-center">
                    <span className="inline-block text-xs font-black text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                        Drop {currentQuestionIndex + 1} / {questions.length}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white text-center leading-snug">
                        {questionData?.question}
                    </h2>
                    {questionData?.questionHindi && (
                        <h3 className="text-xl md:text-2xl font-bold text-slate-400 text-center leading-snug mt-3">
                            {questionData.questionHindi}
                        </h3>
                    )}
                    {questionData?.imageUrl && (
                        <img src={questionData.imageUrl} alt="Question Reference" className="w-full max-h-[300px] object-contain mt-6 rounded-2xl border border-slate-700 bg-slate-800" />
                    )}
                </div>

                <div className="flex flex-col gap-4 w-full">
                    {questionData?.options && questionData.options.map((option: any) => {
                        const isSelected = currentSelection === option.id;
                        return (
                            <button
                                key={option.id}
                                disabled={!testActive}
                                onClick={() => setUserAnswers({ ...userAnswers, [questionData.id]: option.id })}
                                className={`flex items-center p-6 bg-slate-800 border-2 rounded-2xl transition-all text-left group
                                    ${isSelected ? "border-blue-500 bg-slate-700 shadow-md translate-x-2" : "border-slate-700 hover:border-slate-500 hover:bg-slate-700/50"}`}
                            >
                                <div className="flex-1">
                                    <span className={`block text-lg font-bold ${isSelected ? "text-blue-400" : "text-slate-300"}`}>
                                        {option.text}
                                    </span>
                                    {option.textHindi && (
                                        <span className={`block text-base font-medium mt-1 ${isSelected ? "text-blue-400/80" : "text-slate-500"}`}>
                                            {option.textHindi}
                                        </span>
                                    )}
                                </div>
                                {isSelected && <CheckCircle className="w-8 h-8 text-blue-500" />}
                            </button>
                        );
                    })}
                </div>
            </main>

            {/* Fixed Action Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-4 z-20">
                <div className="max-w-3xl mx-auto flex gap-4">
                    {currentQuestionIndex > 0 && testActive && (
                        <button
                            className="py-4 px-8 rounded-2xl font-black text-slate-400 hover:text-white hover:bg-slate-700 bg-slate-800 uppercase tracking-widest transition-colors"
                            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                        >
                            Back
                        </button>
                    )}
                    
                    <button
                        className={`flex-1 py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all ${currentSelection && testActive ? "bg-white hover:bg-slate-200 text-slate-900 shadow-lg shadow-white/10" : "bg-slate-800 text-slate-600 cursor-not-allowed"}`}
                        disabled={!testActive || !currentSelection}
                        onClick={() => {
                            if (!currentSelection) return;
                            if (currentQuestionIndex < questions.length - 1) {
                                setCurrentQuestionIndex(currentQuestionIndex + 1);
                            } else {
                                handleTestSubmit();
                            }
                        }}
                    >
                        {currentQuestionIndex < questions.length - 1 ? (currentSelection ? "Next Drop" : "Select Option") : "Submit Drop"}
                    </button>
                </div>
            </div>
        </div>
    );
}
