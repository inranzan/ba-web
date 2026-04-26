"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { X, Timer, CheckCircle } from 'lucide-react';

export default function ObjectiveTest() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    
    const id = params.id as string;
    const subjectId = searchParams.get('subjectId');
    const limit = searchParams.get('limit');
    const isContest = searchParams.get('isContest') === 'true';
    
    const { user, userData, setUserData } = useAuth();

    const [questions, setQuestions] = useState<any[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [testActive, setTestActive] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!id || (!subjectId && !isContest)) return;
            try {
                let qSnap;
                if (isContest) {
                    const qRef = collection(db, "contests", id, "questions");
                    qSnap = await getDocs(query(qRef, where("type", "==", "objective")));
                } else {
                    if (!subjectId) return;
                    const qRef = collection(db, "subjects", subjectId, "chapters", id, "questions");
                    qSnap = await getDocs(query(qRef, where("type", "==", "objective")));
                }

                let qData: any[] = [];
                qSnap.forEach((doc) => {
                    qData.push({ id: doc.id, ...doc.data() });
                });

                qData = qData.sort(() => Math.random() - 0.5);
                if (limit && parseInt(limit) > 0) {
                    qData = qData.slice(0, parseInt(limit));
                }

                setQuestions(qData);
                setTimeLeft(qData.length * 60);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };

        fetchQuestions();
    }, [id, subjectId, isContest, limit]);

    useEffect(() => {
        if (!testActive || timeLeft === null) return;
        if (timeLeft <= 0) {
            handleTestSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, testActive]);

    const handleTestSubmit = async () => {
        if (!testActive) return;
        setTestActive(false);

        let correctAnswers = 0;
        questions.forEach((q) => {
            if (userAnswers[q.id] === q.answer) {
                correctAnswers += 1;
            }
        });

        let gainedXP = correctAnswers;
        if (isContest) gainedXP *= 2;

        if (user && userData && gainedXP > 0) {
            try {
                const userRef = doc(db, "users", user.uid);
                const today = new Date().toISOString().split("T")[0];

                const newDailyActivity = { ...(userData.dailyActivity || {}) };
                newDailyActivity[today] = (newDailyActivity[today] || 0) + gainedXP;

                const newDailyMissions = { ...(userData.dailyMissions || {}) };
                const tStats = newDailyMissions[today] || { obs: 0, subs: 0, rnds: 0 };
                tStats.obs += questions.length;
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
                    activeWeek: currentWeekKey,
                });

                setUserData({
                    ...userData,
                    xp: currentXP,
                    dailyActivity: newDailyActivity,
                    dailyMissions: newDailyMissions,
                    weeklyXP: currentWeeklyXP,
                    activeWeek: currentWeekKey,
                });
            } catch (e) {
                console.error("Failed to update XP:", e);
            }
        }

        router.replace(`/tests/result?score=${correctAnswers}&total=${questions.length}&xpEarned=${gainedXP}&isContest=${isContest}`);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    if (questions.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="text-center">
                    <p className="text-slate-500 mb-4 font-medium">No objective questions found for this context.</p>
                    <button onClick={() => router.back()} className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">Go Back</button>
                </div>
            </div>
        );
    }

    const questionData = questions[currentQuestionIndex];
    const currentSelection = userAnswers[questionData?.id];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Progress Bar & Header */}
            <div className="w-full z-10 bg-white shadow-sm border-b-2 border-slate-100">
                <div className="w-full h-2 bg-slate-100">
                    <div className="h-full bg-green-500 rounded-r-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between p-4 max-w-4xl mx-auto w-full">
                    <button 
                        className="w-12 h-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors flex"
                        onClick={() => {
                            if (window.confirm("Are you sure you want to quit? Progress will be lost.")) {
                                router.back();
                            }
                        }}
                        disabled={!testActive}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-colors ${timeLeft !== null && timeLeft < 60 ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
                        <Timer className={`w-5 h-5 ${timeLeft !== null && timeLeft < 60 ? "text-red-500" : "text-blue-600"}`} />
                        <span className={`font-mono font-black tracking-widest text-lg ${timeLeft !== null && timeLeft < 60 ? "text-red-600" : "text-blue-700"}`}>
                            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8 flex flex-col pb-32">
                <div className="w-full pb-8 items-center text-center">
                    <span className="inline-block text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center leading-snug">
                        {questionData?.question}
                    </h2>
                    {questionData?.questionHindi && (
                        <h3 className="text-xl md:text-2xl font-bold text-slate-500 text-center leading-snug mt-3">
                            {questionData.questionHindi}
                        </h3>
                    )}
                    {questionData?.imageUrl && (
                        <img src={questionData.imageUrl} alt="Question Reference" className="w-full max-h-[300px] object-contain mt-6 rounded-2xl border border-slate-200 shadow-sm bg-white" />
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
                                className={`flex items-center p-6 bg-white border-2 rounded-2xl transition-all text-left group
                                    ${isSelected ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100 translate-x-2" : "border-slate-200 hover:border-blue-300 hover:shadow-sm"}`}
                            >
                                <div className="flex-1">
                                    <span className={`block text-lg font-bold ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                                        {option.text}
                                    </span>
                                    {option.textHindi && (
                                        <span className={`block text-base font-medium mt-1 ${isSelected ? "text-blue-500" : "text-slate-500"}`}>
                                            {option.textHindi}
                                        </span>
                                    )}
                                </div>
                                {isSelected && <CheckCircle className="w-8 h-8 text-blue-600" />}
                            </button>
                        );
                    })}
                </div>
            </main>

            {/* Fixed Action Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t-2 border-slate-100 p-4 z-20">
                <div className="max-w-3xl mx-auto flex gap-4">
                    {currentQuestionIndex > 0 && testActive && (
                        <button
                            className="py-4 px-8 rounded-2xl font-black text-slate-500 hover:text-slate-700 hover:bg-slate-200 bg-slate-100 uppercase tracking-widest transition-colors"
                            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                        >
                            Back
                        </button>
                    )}
                    
                    <button
                        className={`flex-1 py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all ${currentSelection && testActive ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
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
                        {currentQuestionIndex < questions.length - 1 ? (currentSelection ? "Next" : "Select Option") : "Submit Test"}
                    </button>
                </div>
            </div>
        </div>
    );
}
