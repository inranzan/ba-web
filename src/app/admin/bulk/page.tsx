"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { FileText, ArrowLeft, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const STATIC_SUBJECTS = [
    { id: "mathematics", name: "Mathematics" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "biology", name: "Biology" },
    { id: "english", name: "English" },
    { id: "social_science", name: "Social Science" },
];

export default function AdminBulkUpload() {
    const router = useRouter();
    const { userData } = useAuth();

    const [selectedSubjectId, setSelectedSubjectId] = useState(STATIC_SUBJECTS[0].id);
    const [chapterTitle, setChapterTitle] = useState("");
    const [chapterDifficulty, setChapterDifficulty] = useState("Medium");

    const [fileObj, setFileObj] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    if (userData?.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="text-xl font-bold text-slate-900">Access Denied</div>
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFileObj(file);
            import('papaparse').then((Papa) => {
                Papa.default.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function (results) {
                        setCsvData(results.data);
                    },
                    error: function (error) {
                        alert("Error parsing CSV: " + error.message);
                    }
                });
            });
        }
    };

    const handleUploadData = async () => {
        if (!selectedSubjectId || !chapterTitle || csvData.length === 0) {
            alert("Error: Please provide chapter title, and parse a valid CSV.");
            return;
        }

        setLoading(true);
        try {
            const chaptersRef = collection(db, "subjects", selectedSubjectId, "chapters");
            const chapterQuery = query(chaptersRef, where("title", "==", chapterTitle));
            const querySnapshot = await getDocs(chapterQuery);

            let chapterDocId = null;

            if (!querySnapshot.empty) {
                chapterDocId = querySnapshot.docs[0].id;
            } else {
                const newChapterDoc = await addDoc(chaptersRef, {
                    title: chapterTitle,
                    difficulty: chapterDifficulty,
                    isLocked: false,
                    createdAt: new Date().toISOString(),
                });
                chapterDocId = newChapterDoc.id;
            }

            const questionsRef = collection(db, "subjects", selectedSubjectId, "chapters", chapterDocId, "questions");

            for (const row of csvData) {
                if (!row.Type || !row.Question) continue;

                const questionData: any = {
                    type: row.Type.toLowerCase().trim(),
                    question: row.Question.trim(),
                    questionHindi: row.QuestionHindi ? row.QuestionHindi.trim() : null,
                };

                if (questionData.type === "objective") {
                    questionData.options = [
                        {
                            id: "A",
                            text: row.OptionA || "",
                            textHindi: row.OptionAHindi ? row.OptionAHindi.trim() : null,
                        },
                        {
                            id: "B",
                            text: row.OptionB || "",
                            textHindi: row.OptionBHindi ? row.OptionBHindi.trim() : null,
                        },
                        {
                            id: "C",
                            text: row.OptionC || "",
                            textHindi: row.OptionCHindi ? row.OptionCHindi.trim() : null,
                        },
                        {
                            id: "D",
                            text: row.OptionD || "",
                            textHindi: row.OptionDHindi ? row.OptionDHindi.trim() : null,
                        },
                    ];
                    questionData.answer = row.CorrectAnswer ? row.CorrectAnswer.trim().toUpperCase() : "";
                } else {
                    questionData.rubric = row.Rubric ? row.Rubric.split("|").map((item: string) => item.trim()) : [];
                    questionData.rubricHindi = row.RubricHindi ? row.RubricHindi.split("|").map((item: string) => item.trim()) : [];
                }

                await addDoc(questionsRef, questionData);
            }

            alert(`Success! Uploaded ${csvData.length} questions to ${chapterTitle} successfully!`);
            setChapterTitle("");
            setFileObj(null);
            setCsvData([]);
        } catch (err: any) {
            alert("Error: Upload failed: " + err.message);
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
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <FileText className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Bulk CSV Upload</h1>
                        <p className="text-slate-500 font-medium mt-1">Ingest multiple questions simultaneously into a target subject node.</p>
                    </div>
                </div>

                {/* 1. Target Subject */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">1. Target Subject</h2>
                    <p className="text-sm font-medium text-slate-500 mb-4">Select the core subject to attach this content to.</p>
                    
                    <div className="flex flex-wrap gap-2">
                        {STATIC_SUBJECTS.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => setSelectedSubjectId(sub.id)}
                                className={`px-4 py-3 rounded-xl border-2 font-bold transition-all ${
                                    selectedSubjectId === sub.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                }`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Chapter Info */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">2. Chapter Information</h2>
                    
                    <label className="block text-sm font-bold text-slate-700 mb-2">Chapter Title</label>
                    <input
                        type="text"
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 outline-none focus:border-blue-500 transition-all mb-2"
                        placeholder="e.g., Matrices & Determinants"
                    />
                    <p className="text-xs font-medium text-slate-500">If a chapter with this precise title exists, questions will be merged. Otherwise, a new chapter will be created.</p>
                </div>

                {/* 3. CSV Import */}
                <div className="bg-blue-50 rounded-3xl p-6 md:p-8 border-2 border-blue-100 mb-8 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 opacity-10">
                        <FileText className="w-48 h-48 text-blue-600" />
                    </div>

                    <h2 className="text-lg font-black text-blue-900 mb-2">3. Import CSV Data</h2>
                    <p className="text-sm font-medium text-blue-800/70 mb-6 leading-relaxed relative z-10">
                        Data must adhere strictly to these column headers (Hindi variations are optional):<br/><br/>
                        <code className="bg-white px-3 py-1.5 rounded-lg text-slate-800 font-bold block overflow-x-auto shadow-sm">
                            Type, Question, QuestionHindi, OptionA, OptionAHindi, OptionB, OptionBHindi, OptionC, OptionCHindi, OptionD, OptionDHindi, CorrectAnswer, Rubric, RubricHindi
                        </code>
                    </p>

                    <div className="relative z-10">
                        <label className="flex items-center justify-center gap-3 bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-600 font-bold py-5 rounded-2xl cursor-pointer transition-all shadow-sm">
                            <Upload className="w-6 h-6" />
                            Browse CSV File
                            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                        </label>

                        {fileObj && (
                            <div className="mt-4 bg-green-100 border border-green-200 p-4 rounded-xl flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                <div className="flex-1">
                                    <p className="text-green-800 font-bold">{fileObj.name}</p>
                                    <p className="text-green-600 text-sm font-medium">Parsed {csvData.length} valid entries</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={handleUploadData}
                    disabled={loading || csvData.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:translate-y-0"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Push to Database'}
                </button>
            </div>
        </div>
    );
}
