"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { CalendarCheck, ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function ContestSetup() {
    const router = useRouter();
    const { userData } = useAuth();

    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [expirationText, setExpirationText] = useState("");
    const [loading, setLoading] = useState(false);

    if (userData?.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="text-xl font-bold text-slate-900">Access Denied</div>
            </div>
        );
    }

    const handleCreateContest = async () => {
        if (!title.trim()) {
            alert("Validation Error: Contest title is required.");
            return;
        }

        let isoDate = null;
        if (expirationText.trim()) {
            const parsed = new Date(expirationText);
            if (isNaN(parsed.getTime())) {
                alert("Format Error: Invalid date format. Use YYYY-MM-DD.");
                return;
            }
            parsed.setHours(23, 59, 59, 999);
            isoDate = parsed.toISOString();
        }

        setLoading(true);
        try {
            await addDoc(collection(db, "contests"), {
                title: title.trim(),
                details: details.trim(),
                expirationTime: isoDate,
                isActive: true,
                createdAt: new Date().toISOString(),
            });

            alert("Success! Contest created! You can now add questions to it in the Contest Editor.");
            setTitle("");
            setDetails("");
            setExpirationText("");
            router.push('/admin');
        } catch (err: any) {
            alert("Database Error: Failed to create contest: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto pb-32">
                <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Admin
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                        <CalendarCheck className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Create Contest</h1>
                        <p className="text-slate-500 font-medium mt-1">Define a new active contest event.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-6 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">1. Basic Information</h2>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Contest Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                            placeholder="e.g., Grand Weekly Assessment"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Details & Instructions</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all h-32 resize-none"
                            placeholder="e.g., This contest covers Science and Math topics from Week 3."
                        />
                    </div>
                </div>

                <div className="bg-purple-50 rounded-3xl p-8 border-2 border-purple-100 mb-8 space-y-4">
                    <h2 className="text-lg font-bold text-purple-900">2. Expiration Rules</h2>

                    <div>
                        <label className="block text-sm font-bold text-purple-800 mb-2">Expiration Date (Format: YYYY-MM-DD)</label>
                        <input
                            type="text"
                            value={expirationText}
                            onChange={(e) => setExpirationText(e.target.value)}
                            className="w-full bg-white border-2 border-purple-200 rounded-xl px-4 py-3 font-medium text-purple-900 outline-none focus:border-purple-500 transition-all"
                            placeholder="e.g., 2026-10-31"
                        />
                        <p className="text-xs font-bold text-purple-600 mt-2">
                            Leave this blank if the contest never expires natively. The exact cut-off will default to 23:59 on the selected date.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleCreateContest}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Initialize Contest Event</>}
                </button>
            </div>
        </div>
    );
}
