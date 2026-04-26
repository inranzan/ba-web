"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, FileText, CheckSquare, Edit3, CalendarCheck, LayoutList } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const { userData } = useAuth();

    if (userData?.role !== "admin") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="text-center">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
                    <p className="text-slate-500 mt-2">You must be an administrator to view this page.</p>
                    <button onClick={() => router.push('/dashboard')} className="mt-6 px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto pb-32">
                <h1 className="text-3xl font-black text-slate-900 mb-8">Admin Portal</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Bulk Upload */}
                    <button 
                        onClick={() => router.push('/admin/bulk')}
                        className="bg-white rounded-3xl p-8 border-2 border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-md transition-all text-left relative overflow-hidden group"
                    >
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 relative z-10 mb-2">Bulk Upload (CSV)</h2>
                        <p className="text-slate-500 font-medium relative z-10 mb-6">Ingest hundreds of questions instantly using a formatted spreadsheet template.</p>
                        <span className="font-bold text-blue-600 relative z-10 flex items-center gap-2">Launch Tool &rarr;</span>
                    </button>

                    {/* Manual Objective */}
                    <button 
                        onClick={() => router.push('/admin/objective')}
                        className="bg-white rounded-3xl p-8 border-2 border-orange-100 hover:border-orange-300 shadow-sm hover:shadow-md transition-all text-left relative overflow-hidden group"
                    >
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                            <CheckSquare className="w-8 h-8 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 relative z-10 mb-2">Add Objective</h2>
                        <p className="text-slate-500 font-medium relative z-10 mb-6">Inject isolated Multiple Choice Questions with 4-option logic.</p>
                        <span className="font-bold text-orange-600 relative z-10 flex items-center gap-2">Launch MC Editor &rarr;</span>
                    </button>

                    {/* Manual Subjective */}
                    <button 
                        onClick={() => router.push('/admin/subjective')}
                        className="bg-white rounded-3xl p-8 border-2 border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-md transition-all text-left relative overflow-hidden group"
                    >
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                            <Edit3 className="w-8 h-8 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 relative z-10 mb-2">Add Subjective</h2>
                        <p className="text-slate-500 font-medium relative z-10 mb-6">Inject isolated Long Answer questions requiring a grading rubric.</p>
                        <span className="font-bold text-amber-600 relative z-10 flex items-center gap-2">Launch Write Editor &rarr;</span>
                    </button>
                </div>

                <hr className="border-slate-200 mb-8" />
                <h2 className="text-2xl font-black text-slate-900 mb-6">Contest Management</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contest Setup */}
                    <button 
                        onClick={() => router.push('/admin/contest-setup')}
                        className="bg-white rounded-3xl p-8 border-2 border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md transition-all text-left relative overflow-hidden group"
                    >
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                            <CalendarCheck className="w-8 h-8 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 relative z-10 mb-2">Create Contest</h2>
                        <p className="text-slate-500 font-medium relative z-10 mb-6">Define a new active contest event with titles, details, and an exact expiration cutoff time.</p>
                        <span className="font-bold text-purple-600 relative z-10 flex items-center gap-2">Setup Event &rarr;</span>
                    </button>

                    {/* Contest Editor */}
                    <button 
                        onClick={() => router.push('/admin/contest-editor')}
                        className="bg-white rounded-3xl p-8 border-2 border-teal-100 hover:border-teal-300 shadow-sm hover:shadow-md transition-all text-left relative overflow-hidden group"
                    >
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                        <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                            <LayoutList className="w-8 h-8 text-teal-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 relative z-10 mb-2">Contest Questions</h2>
                        <p className="text-slate-500 font-medium relative z-10 mb-6">Select an active contest and manually construct multi-subject question entries inside it.</p>
                        <span className="font-bold text-teal-600 relative z-10 flex items-center gap-2">Build Contest &rarr;</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
