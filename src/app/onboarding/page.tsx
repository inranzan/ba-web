"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { BookOpen, GraduationCap } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const { user, setUserData } = useAuth();
    
    const [name, setName] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(false);

    if (!user) {
        router.push('/login');
        return null;
    }

    const handleSave = async () => {
        if (!name || !selectedClass) return;
        setLoading(true);
        try {
            const newUser = {
                uid: user.uid,
                phoneNumber: user.phoneNumber,
                name: name.trim(),
                class: selectedClass,
                role: 'student',
                xp: 0,
                activeWeek: 1,
                weeklyXP: 0,
                streak: 1,
                lastLoginDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'users', user.uid), newUser);
            setUserData(newUser);
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert("Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 md:p-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">Welcome to BoardAbhyarthi</h1>
                    <p className="text-slate-500">Let's set up your learning profile</p>
                </div>

                <div className="space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">What's your full name?</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-4 outline-none focus:border-blue-600 font-medium transition-colors"
                            placeholder="e.g. Rahul Kumar"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">Which class are you in?</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedClass('11th')}
                                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${selectedClass === '11th' ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100' : 'border-slate-200 hover:border-blue-300'}`}
                            >
                                <BookOpen className={`w-8 h-8 mb-3 ${selectedClass === '11th' ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className={`font-bold ${selectedClass === '11th' ? 'text-blue-700' : 'text-slate-600'}`}>Class 11th</span>
                            </button>
                            <button
                                onClick={() => setSelectedClass('12th')}
                                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${selectedClass === '12th' ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100' : 'border-slate-200 hover:border-blue-300'}`}
                            >
                                <GraduationCap className={`w-8 h-8 mb-3 ${selectedClass === '12th' ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className={`font-bold ${selectedClass === '12th' ? 'text-blue-700' : 'text-slate-600'}`}>Class 12th</span>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!name || !selectedClass || loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/30 mt-8"
                    >
                        {loading ? "Creating Profile..." : "Start Learning"}
                    </button>
                </div>
            </div>
        </main>
    );
}
