"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { LayoutList, ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

const STATIC_SUBJECTS = [
    { id: "mathematics", name: "Mathematics" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "biology", name: "Biology" },
    { id: "english", name: "English" },
    { id: "social_science", name: "Social Science" },
];

export default function AdminContestEditor() {
    const router = useRouter();
    const { userData } = useAuth();

    const [contests, setContests] = useState<any[]>([]);
    const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
    const [isFetchingContests, setIsFetchingContests] = useState(true);

    const [selectedSubjectId, setSelectedSubjectId] = useState(STATIC_SUBJECTS[0].id);

    const [qType, setQType] = useState("subjective"); 
    const [questionText, setQuestionText] = useState("");

    const [optA, setOptA] = useState("");
    const [optB, setOptB] = useState("");
    const [optC, setOptC] = useState("");
    const [optD, setOptD] = useState("");
    const [correctOpt, setCorrectOpt] = useState("A");

    const [rubricText, setRubricText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadActiveContests = async () => {
            try {
                const q = query(collection(db, "contests"), where("isActive", "==", true));
                const snap = await getDocs(q);
                const fetched: any[] = [];
                snap.forEach((doc) => {
                    fetched.push({ id: doc.id, ...doc.data() });
                });
                fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setContests(fetched);
                if (fetched.length > 0) setSelectedContestId(fetched[0].id);
            } catch (error: any) {
                alert("Error: Could not fetch contests: " + error.message);
            } finally {
                setIsFetchingContests(false);
            }
        };
        loadActiveContests();
    }, []);

    if (userData?.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="text-xl font-bold text-slate-900">Access Denied</div>
            </div>
        );
    }

    const handleSave = async () => {
        if (!selectedContestId || !selectedSubjectId || !questionText.trim()) {
            alert("Error: Please fill out required Target Contest and Question details.");
            return;
        }

        if (qType === "objective" && (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim() || !correctOpt)) {
            alert("Error: Objective questions require all 4 options and a correct answer selection.");
            return;
        }

        if (qType === "subjective" && !rubricText.trim()) {
            alert("Error: Subjective questions require a grading rubric.");
            return;
        }

        setLoading(true);
        try {
            const questionsRef = collection(db, "contests", selectedContestId, "questions");

            const payload: any = {
                type: qType,
                subjectId: selectedSubjectId,
                question: questionText.trim(),
            };

            if (qType === "objective") {
                payload.options = [
                    { id: "A", text: optA.trim() },
                    { id: "B", text: optB.trim() },
                    { id: "C", text: optC.trim() },
                    { id: "D", text: optD.trim() },
                ];
                payload.answer = correctOpt;
            } else {
                payload.rubric = rubricText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
            }

            await addDoc(questionsRef, payload);

            alert("Success: Question successfully added to Contest!");

            setQuestionText("");
            setOptA("");
            setOptB("");
            setOptC("");
            setOptD("");
            setRubricText("");
        } catch (err: any) {
            alert("Error: Failed to save: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto pb-32">
                <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Admin
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center">
                        <LayoutList className="w-7 h-7 text-teal-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Contest Editor</h1>
                        <p className="text-slate-500 font-medium mt-1">Append questions directly to active contests.</p>
                    </div>
                </div>

                {isFetchingContests ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                    </div>
                ) : contests.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
                        <h3 className="text-2xl font-bold text-slate-900">No Active Contests</h3>
                        <p className="text-slate-500 mt-2">Create a contest in the Contest Setup page first.</p>
                    </div>
                ) : (
                    <>
                        {/* 1. Target Event */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">1. Target Event & Subject</h2>
                            
                            <label className="block text-sm font-bold text-slate-700 mb-2">Select Active Contest</label>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {contests.map((con) => (
                                    <button
                                        key={con.id}
                                        onClick={() => setSelectedContestId(con.id)}
                                        className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                                            selectedContestId === con.id ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        {con.title}
                                    </button>
                                ))}
                            </div>

                            <label className="block text-sm font-bold text-slate-700 mb-2">Subject Context Modifier</label>
                            <div className="flex flex-wrap gap-2">
                                {STATIC_SUBJECTS.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setSelectedSubjectId(sub.id)}
                                        className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                                            selectedSubjectId === sub.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        {sub.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Format configuration */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">2. Question Format</h2>
                            <div className="flex bg-slate-100 p-1.5 rounded-xl">
                                <button
                                    onClick={() => setQType('objective')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${qType === 'objective' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Multiple Choice
                                </button>
                                <button
                                    onClick={() => setQType('subjective')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${qType === 'subjective' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Written (Subjective)
                                </button>
                            </div>
                        </div>

                        {/* 3. Question Data */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">3. Question Definition</h2>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">The Question Text</label>
                                <textarea
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 outline-none focus:border-teal-500 transition-all min-h-[100px] resize-y"
                                    placeholder="Type the question..."
                                />
                            </div>

                            {qType === "objective" ? (
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Answers Details</label>
                                    
                                    {[
                                        { letter: 'A', val: optA, set: setOptA },
                                        { letter: 'B', val: optB, set: setOptB },
                                        { letter: 'C', val: optC, set: setOptC },
                                        { letter: 'D', val: optD, set: setOptD },
                                    ].map((opt) => (
                                        <div key={opt.letter} className="flex gap-3 items-center">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 shrink-0">
                                                {opt.letter}
                                            </div>
                                            <input
                                                type="text"
                                                value={opt.val}
                                                onChange={(e) => opt.set(e.target.value)}
                                                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 outline-none focus:border-teal-500 transition-all"
                                                placeholder={`Option ${opt.letter}`}
                                            />
                                        </div>
                                    ))}

                                    <div className="pt-4 border-t border-slate-100 mt-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Identify Correct Answer</label>
                                        <div className="flex gap-4">
                                            {['A', 'B', 'C', 'D'].map((letter) => (
                                                <button
                                                    key={letter}
                                                    onClick={() => setCorrectOpt(letter)}
                                                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 font-black text-xl transition-all ${
                                                        correctOpt === letter ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {letter}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold text-slate-700">Grading Points / Rubric</label>
                                        <span className="text-xs font-bold text-slate-400">One criteria per line</span>
                                    </div>
                                    <textarea
                                        value={rubricText}
                                        onChange={(e) => setRubricText(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 outline-none focus:border-teal-500 transition-all min-h-[140px] resize-y"
                                        placeholder="Point 1...&#10;Point 2..."
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Append to Contest</>}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
