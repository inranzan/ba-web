"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { X, Timer, CheckCircle, ChevronLeft } from 'lucide-react';

export default function UnifiedContestRunner() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { user, userData, setUserData } = useAuth();

    const [questions, setQuestions] = useState<any[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [testActive, setTestActive] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!id) return;
            try {
                const qRef = collection(db, "contests", id, "questions");
                const qSnap = await getDocs(qRef);

                let qData: any[] = [];
                qSnap.forEach((doc) => {
                    qData.push({ id: doc.id, ...doc.data() });
                });

                qData = qData.sort(() => Math.random() - 0.5);
                setQuestions(qData);

                let initialTime = 0;
                qData.forEach(q => {
                    if (q.type === 'objective') initialTime += 60;
                    else if (q.type === 'subjective') initialTime += 180;
                    else initialTime += 60;
                });
                setTimeLeft(initialTime);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };

        fetchQuestions();
    }, [id]);

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

        let correctObjective = 0;
        let validSubjectiveCount = 0;

        questions.forEach((q) => {
            if (q.type === 'objective') {
                if (userAnswers[q.id] === q.answer) correctObjective += 1;
            } else if (q.type === 'subjective') {
                const entry = userAnswers[q.id] || "";
                if (entry.trim().length > 5) validSubjectiveCount += 1;
            }
        });

        let baseXP = (correctObjective * 1) + (validSubjectiveCount * 5);
        let gainedXP = baseXP * 2;

        if (user && userData && gainedXP > 0) {
            try {
                const userRef = doc(db, 'users', user.uid);
                const today = new Date().toISOString().split('T')[0];

                const newDailyActivity = { ...(userData.dailyActivity || {}) };
                newDailyActivity[today] = (newDailyActivity[today] || 0) + gainedXP;

                const newDailyMissions = { ...(userData.dailyMissions || {}) };
                const tStats = newDailyMissions[today] || { obs: 0, subs: 0, rnds: 0 };
                tStats.obs += questions.length;
                newDailyMissions[today] = tStats;

                const completedContests = { ...(userData.completedContests || {}) };
                completedContests[id] = {
                    score: correctObjective + validSubjectiveCount,
                    total: questions.length,
                    xpEarned: gainedXP
                };

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
                    completedContests: completedContests,
                    weeklyXP: currentWeeklyXP,
                    activeWeek: currentWeekKey
                });

                setUserData({ ...userData, xp: currentXP, dailyActivity: newDailyActivity, dailyMissions: newDailyMissions, completedContests: completedContests, weeklyXP: currentWeeklyXP, activeWeek: currentWeekKey });
            } catch (e) {
                console.error("XP Tally Failure:", e);
            }
        }

        router.replace(`/tests/result?score=${correctObjective + validSubjectiveCount}&total=${questions.length}&xpEarned=${gainedXP}&isContest=true`);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-900"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

    if (questions.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
                <div className="text-center">
                    <p className="text-slate-400 mb-4 font-medium">No content has been deployed inside this contest.</p>
                    <button onClick={() => router.back()} className="px-6 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors">Go Back</button>
                </div>
            </div>
        );
    }

    const questionData = questions[currentQuestionIndex];
    const qType = questionData?.type || 'objective';
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
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
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
                        {qType === 'subjective' ? 'Written Event' : 'Selection Event'} {currentQuestionIndex + 1} / {questions.length}
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
                        <img src={questionData.imageUrl} alt="Reference" className="w-full max-h-[300px] object-contain mt-6 rounded-2xl border border-slate-700 bg-slate-800" />
                    )}
                </div>

                <div className="w-full flex-1 flex flex-col">
                    {qType === 'objective' ? (
                        <div className="flex flex-col gap-4">
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
                    ) : (
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm font-bold text-slate-400 px-1 uppercase tracking-widest">Your Official Answer</label>
                            <textarea
                                className="w-full flex-1 min-h-[250px] rounded-3xl border-2 border-slate-700 bg-slate-800 p-6 text-lg text-slate-100 shadow-sm focus:border-blue-500 outline-none resize-y transition-colors"
                                placeholder="Provide a comprehensive response..."
                                value={currentSelection || ""}
                                onChange={(e) => setUserAnswers({ ...userAnswers, [questionData.id]: e.target.value })}
                                disabled={!testActive}
                            />
                            <div className="flex justify-end mt-1">
                                <span className="text-xs font-medium text-slate-500">Auto-saved to device memory</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-md border-t border-slate-700 p-4 z-20">
                <div className="max-w-3xl mx-auto flex gap-4">
                    {currentQuestionIndex > 0 && testActive && (
                        <button
                            className="py-4 px-6 rounded-2xl flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors"
                            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                        >
                            <ChevronLeft className="w-6 h-6 text-slate-400" />
                            <span className="font-bold text-slate-300 uppercase tracking-widest">Prev</span>
                        </button>
                    )}
                    
                    <button
                        className={`flex-1 py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all ${currentSelection && testActive ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
                        disabled={!testActive || (qType === 'objective' && !currentSelection)}
                        onClick={() => {
                            if (qType === 'objective' && !currentSelection) return;
                            if (currentQuestionIndex < questions.length - 1) {
                                setCurrentQuestionIndex(currentQuestionIndex + 1);
                            } else {
                                if (window.confirm("You are about to securely compile your contest data. Proceed?")) {
                                    handleTestSubmit();
                                }
                            }
                        }}
                    >
                        {currentQuestionIndex < questions.length - 1 ? (currentSelection ? "Confirm & Next" : "Select Option") : "Finalize Contest"}
                    </button>
                </div>
            </div>
        </div>
    );
}
