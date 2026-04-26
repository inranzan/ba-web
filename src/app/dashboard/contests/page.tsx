"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Clock, CalendarX2, Timer } from 'lucide-react';

export default function ContestsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [contests, setContests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchContests = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "contests"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedContests: any[] = [];
            const now = new Date();

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                let isExpired = false;

                if (data.expirationTime) {
                    const expDate = new Date(data.expirationTime);
                    isExpired = now > expDate;
                }

                fetchedContests.push({
                    id: doc.id,
                    ...data,
                    isExpired: isExpired || !data.isActive,
                });
            });
            setContests(fetchedContests);
        } catch (error) {
            console.error("Error fetching contests:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContests();
    }, [fetchContests]);

    const handleContestPress = (contest: any) => {
        const completedData = userData?.completedContests?.[contest.id];
        if (completedData) {
            router.push(`/tests/result?score=${completedData.score}&total=${completedData.total}&xpEarned=${completedData.xpEarned}&isContest=true`);
            return;
        }

        if (contest.isExpired) {
            alert("This contest has expired.");
            return;
        }
        router.push(`/tests/contest/${contest.id}`);
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-blue-600" /> Contests
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">
                        Get twice XP points for every correct answer! Compete with others and climb the leaderboard.
                    </p>
                </div>
                <button onClick={fetchContests} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
                    <Clock className="w-5 h-5" />
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : contests.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
                    <CalendarX2 className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">No Active Contests</h3>
                    <p className="text-slate-500 mt-2 font-medium">There are no contests available right now. Please check back later!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {contests.map((contest) => (
                        <button
                            key={contest.id}
                            onClick={() => handleContestPress(contest)}
                            className={`w-full text-left p-6 rounded-3xl border-2 transition-all relative overflow-hidden flex items-center gap-6 ${
                                contest.isExpired 
                                ? "bg-slate-50 border-slate-200 opacity-75 hover:bg-slate-100" 
                                : "bg-white border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-md"
                            }`}
                        >
                            {!contest.isExpired && (
                                <div className="absolute top-0 right-0 bg-blue-600 px-4 py-1.5 rounded-bl-2xl">
                                    <span className="text-white text-xs font-black uppercase tracking-wider">Live</span>
                                </div>
                            )}

                            <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center ${contest.isExpired ? "bg-slate-200 text-slate-400" : "bg-blue-100 text-blue-600"}`}>
                                <Trophy className="w-8 h-8" />
                            </div>

                            <div className="flex-1">
                                <h3 className={`text-xl font-bold mb-1 ${contest.isExpired ? "text-slate-500" : "text-slate-900"}`}>
                                    {contest.title}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium mb-3 line-clamp-2">
                                    {contest.details}
                                </p>
                                
                                {contest.expirationTime && (
                                    <div className="flex items-center gap-2">
                                        <Timer className={`w-4 h-4 ${contest.isExpired ? "text-red-500" : "text-amber-500"}`} />
                                        <span className={`text-sm font-bold ${contest.isExpired ? "text-red-500" : "text-amber-600"}`}>
                                            {contest.isExpired ? "Expired" : `Ends ${new Date(contest.expirationTime).toLocaleDateString()}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
