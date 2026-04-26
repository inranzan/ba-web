"use client";
import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { STATIC_SUBJECTS } from '@/constants/data';
import { ChevronRight, RefreshCw, Zap, Calculator, FlaskConical, Microscope, Languages, BookOpen } from 'lucide-react';

const iconMap: any = {
    "zap": Zap,
    "calculator": Calculator,
    "flask-conical": FlaskConical,
    "microscope": Microscope,
    "languages": Languages,
    "book-open": BookOpen
};

export default function SubjectsPage() {
    const { userData } = useAuth();
    const router = useRouter();
    const [selectedClass, setSelectedClass] = useState(userData?.class || "12th");
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    }, []);

    return (
        <div className="min-h-full bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-slate-900">Subjects</h1>
                    <button onClick={onRefresh} disabled={refreshing} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Class Toggler */}
                <div className="flex gap-2 mb-8 bg-white p-2 rounded-3xl shadow-sm w-full md:w-96">
                    <button
                        onClick={() => setSelectedClass("11th")}
                        className={`flex-1 py-3 rounded-2xl font-bold transition-colors ${selectedClass === "11th" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                        Class 11th
                    </button>
                    <button
                        onClick={() => setSelectedClass("12th")}
                        className={`flex-1 py-3 rounded-2xl font-bold transition-colors ${selectedClass === "12th" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                        Class 12th
                    </button>
                </div>

                {/* Subjects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STATIC_SUBJECTS.filter((sub) => sub.classId === selectedClass).map((sub) => {
                        const Icon = iconMap[sub.icon] || BookOpen;
                        return (
                            <button
                                key={sub.id}
                                onClick={() => router.push(`/dashboard/subjects/${sub.id}`)}
                                className="bg-white rounded-3xl border-2 border-slate-200 p-6 flex items-center justify-between text-left hover:border-blue-300 hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
                                        ${sub.color === "blue" ? "bg-blue-50 text-blue-600" : 
                                          sub.color === "green" ? "bg-green-50 text-green-600" : 
                                          sub.color === "red" ? "bg-red-50 text-red-600" : 
                                          "bg-orange-50 text-orange-600"}
                                    `}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <span className="font-bold text-slate-800 text-xl group-hover:text-blue-600 transition-colors">
                                        {sub.name.split(" (")[0]}
                                    </span>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
