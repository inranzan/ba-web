"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { STATIC_SUBJECTS } from '@/constants/data';
import { uploadToImageKit } from '@/utils/imagekit';
import { Image as ImageIcon, Send, X, Plus } from 'lucide-react';

export default function AdminManualObjective() {
    const router = useRouter();
    const { userData } = useAuth();

    const [selectedSubjectId, setSelectedSubjectId] = useState(STATIC_SUBJECTS[0].id);
    const [chapters, setChapters] = useState<any[]>([]);
    const [selectedChapterDocId, setSelectedChapterDocId] = useState<string | null>(null);
    const [chapterTitle, setChapterTitle] = useState("");
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    const [questionText, setQuestionText] = useState("");
    const [questionHindi, setQuestionHindi] = useState("");

    const [optA, setOptA] = useState("");
    const [optB, setOptB] = useState("");
    const [optC, setOptC] = useState("");
    const [optD, setOptD] = useState("");
    const [optAHindi, setOptAHindi] = useState("");
    const [optBHindi, setOptBHindi] = useState("");
    const [optCHindi, setOptCHindi] = useState("");
    const [optDHindi, setOptDHindi] = useState("");
    const [correctOpt, setCorrectOpt] = useState("A");

    const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchExistingChapters = async () => {
            try {
                const chaptersRef = collection(db, "subjects", selectedSubjectId, "chapters");
                const snap = await getDocs(chaptersRef);
                const fetched: any[] = [];
                snap.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
                setChapters(fetched);
                setSelectedChapterDocId(null);
            } catch (e) {
                console.error(e);
            }
        };
        fetchExistingChapters();
    }, [selectedSubjectId]);

    if (userData?.role !== "admin") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
                </div>
            </div>
        );
    }

    const handleSave = async () => {
        if (!selectedSubjectId || questionText.trim() === "") {
            alert("Please fill out Question details.");
            return;
        }
        if (isCreatingNew && chapterTitle.trim() === "") {
            alert("Please provide a name for the new chapter.");
            return;
        }
        if (!isCreatingNew && !selectedChapterDocId) {
            alert("Please select a target Chapter or create a new one.");
            return;
        }

        if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim() || !correctOpt) {
            alert("Objective questions require all 4 options and a correct answer selection.");
            return;
        }

        setLoading(true);
        try {
            const chaptersRef = collection(db, "subjects", selectedSubjectId, "chapters");
            let targetChapterDocId = selectedChapterDocId;

            if (isCreatingNew) {
                const chapterQuery = query(chaptersRef, where("title", "==", chapterTitle.trim()));
                const querySnapshot = await getDocs(chapterQuery);

                if (!querySnapshot.empty) {
                    targetChapterDocId = querySnapshot.docs[0].id;
                } else {
                    const newChapterDoc = await addDoc(chaptersRef, {
                        title: chapterTitle.trim(),
                        difficulty: "Medium",
                        isLocked: false,
                        createdAt: new Date().toISOString(),
                    });
                    targetChapterDocId = newChapterDoc.id;
                }
            }

            let uploadedImageUrl = null;
            if (questionImageFile) {
                uploadedImageUrl = await uploadToImageKit(questionImageFile);
            }

            const questionsRef = collection(db, "subjects", selectedSubjectId, "chapters", targetChapterDocId!, "questions");

            const payload = {
                type: "objective",
                question: questionText.trim(),
                questionHindi: questionHindi.trim() || null,
                imageUrl: uploadedImageUrl,
                options: [
                    { id: "A", text: optA.trim(), textHindi: optAHindi.trim() || null },
                    { id: "B", text: optB.trim(), textHindi: optBHindi.trim() || null },
                    { id: "C", text: optC.trim(), textHindi: optCHindi.trim() || null },
                    { id: "D", text: optD.trim(), textHindi: optDHindi.trim() || null },
                ],
                answer: correctOpt,
            };

            await addDoc(questionsRef, payload);
            alert("Success! Question added securely to database.");

            setQuestionText("");
            setQuestionHindi("");
            setOptA(""); setOptB(""); setOptC(""); setOptD("");
            setOptAHindi(""); setOptBHindi(""); setOptCHindi(""); setOptDHindi("");
            setQuestionImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
            alert("Failed to save: " + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto pb-32">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                    <h1 className="text-3xl font-black text-slate-900">Add Objective</h1>
                </div>

                {/* 1. Target Area */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">1. Assignment Target</h2>
                    
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                        {STATIC_SUBJECTS.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => { setSelectedSubjectId(sub.id); setIsCreatingNew(false); }}
                                className={`px-5 py-3 rounded-2xl border-2 font-bold whitespace-nowrap transition-colors ${selectedSubjectId === sub.id ? "border-orange-500 bg-orange-50 text-orange-600" : "border-slate-200 bg-white text-slate-500"}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>

                    <h3 className="text-slate-700 font-medium mb-3">Target Chapter Context</h3>
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
                        <button
                            onClick={() => { setIsCreatingNew(true); setSelectedChapterDocId(null); }}
                            className={`px-5 py-3 rounded-2xl border-2 font-bold whitespace-nowrap flex items-center gap-2 transition-colors ${isCreatingNew ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                        >
                            <Plus className="w-5 h-5" /> New Chapter
                        </button>
                        {chapters.map((chap) => (
                            <button
                                key={chap.id}
                                onClick={() => { setIsCreatingNew(false); setSelectedChapterDocId(chap.id); }}
                                className={`px-5 py-3 rounded-2xl border-2 font-bold whitespace-nowrap transition-colors ${selectedChapterDocId === chap.id ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                            >
                                {chap.title}
                            </button>
                        ))}
                    </div>

                    {isCreatingNew && (
                        <input
                            type="text"
                            className="w-full bg-white border-2 border-teal-200 rounded-2xl px-5 py-4 font-medium text-slate-900 focus:outline-none focus:border-teal-500"
                            placeholder="Type new chapter name..."
                            value={chapterTitle}
                            onChange={(e) => setChapterTitle(e.target.value)}
                        />
                    )}
                </div>

                {/* 2. Multiple Choice Data */}
                <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm mb-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">2. Multiple Choice Data</h2>

                    <h3 className="text-slate-700 font-bold mb-2">The Core Question</h3>
                    <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium text-slate-900 mb-4 min-h-[120px] focus:outline-none focus:border-blue-500 resize-y"
                        placeholder="Enter the English prompt here..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                    />
                    <textarea
                        className="w-full bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 font-medium text-slate-900 mb-6 min-h-[120px] focus:outline-none focus:border-blue-500 resize-y"
                        placeholder="[Optional Hindi] Enter hindi prompt..."
                        value={questionHindi}
                        onChange={(e) => setQuestionHindi(e.target.value)}
                    />

                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => setQuestionImageFile(e.target.files?.[0] || null)} />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-indigo-50 border-2 border-indigo-200 border-dashed rounded-2xl mb-6 hover:bg-indigo-100 transition-colors"
                    >
                        <ImageIcon className="w-5 h-5 text-indigo-600" />
                        <span className="font-bold text-indigo-700">{questionImageFile ? "Change Reference Image" : "Attach Reference Image"}</span>
                    </button>

                    {questionImageFile && (
                        <div className="mb-6 relative rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100 flex justify-center">
                            <img src={URL.createObjectURL(questionImageFile)} className="max-h-[200px] object-contain" />
                            <button onClick={() => setQuestionImageFile(null)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-2 text-white"><X className="w-4 h-4" /></button>
                        </div>
                    )}

                    <h3 className="text-slate-700 font-bold mb-4">Answers Setup</h3>
                    
                    {['A', 'B', 'C', 'D'].map((letter, idx) => {
                        const states = [
                            [optA, setOptA, optAHindi, setOptAHindi],
                            [optB, setOptB, optBHindi, setOptBHindi],
                            [optC, setOptC, optCHindi, setOptCHindi],
                            [optD, setOptD, optDHindi, setOptDHindi]
                        ][idx] as any;

                        return (
                            <div key={letter} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                                <div className="flex gap-4 mb-3">
                                    <div className="w-10 h-10 flex-shrink-0 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                                        <span className="font-black text-slate-500">{letter}</span>
                                    </div>
                                    <input
                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                                        placeholder={`English ${letter}`}
                                        value={states[0]}
                                        onChange={(e) => states[1](e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 flex-shrink-0" />
                                    <input
                                        className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                                        placeholder={`Hindi ${letter} [Optional]`}
                                        value={states[2]}
                                        onChange={(e) => states[3](e.target.value)}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    <h3 className="text-slate-700 font-bold mb-4 mt-6">Identify Correct Option</h3>
                    <div className="flex gap-4">
                        {["A", "B", "C", "D"].map((letter) => (
                            <button
                                key={letter}
                                onClick={() => setCorrectOpt(letter)}
                                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all hover:-translate-y-1 ${correctOpt === letter ? "border-orange-500 bg-orange-500 shadow-lg shadow-orange-500/30" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
                            >
                                <span className={`font-black text-xl ${correctOpt === letter ? "text-white" : "text-slate-400"}`}>{letter}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl shadow-xl transition-all ${loading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700 hover:-translate-y-1 shadow-orange-600/30"}`}
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span className="text-white font-black text-xl tracking-wide uppercase">Deploy Objective</span>
                            <Send className="w-6 h-6 text-white" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
