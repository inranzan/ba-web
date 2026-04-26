"use client";
import React from 'react';
import Link from 'next/link';
import { BookOpen, Trophy, BrainCircuit, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Navigation */}
            <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 overflow-hidden">
                            <img src="/images/ba_logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">BoardAbhyarthi</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-slate-600 font-bold hover:text-blue-600 transition-colors px-4 py-2">
                            Log In
                        </Link>
                        <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5">
                            Sign Up Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm mb-6 border border-blue-100">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Next-Gen Learning Platform
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                        Master Your Boards with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Smart Practice</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
                        BoardAbhyarthi provides rigorous objective tests, AI-graded subjective responses, and live leaderboards to help 11th and 12th graders excel.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1">
                            Start Practicing Now <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold text-lg px-8 py-4 rounded-full border-2 border-slate-200 flex items-center justify-center transition-colors">
                            I already have an account
                        </Link>
                    </div>
                </div>

                {/* Dashboard Preview Graphic */}
                <div className="mt-16 relative mx-auto max-w-5xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent z-10 bottom-0 h-32 top-auto"></div>
                    <div className="bg-slate-900 rounded-[2rem] shadow-2xl p-4 md:p-8 overflow-hidden relative border-8 border-slate-800 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                        <div className="flex gap-2 mb-4">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700">
                                <div className="h-4 w-1/3 bg-slate-700 rounded mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-12 w-full bg-blue-600/20 rounded-xl border border-blue-500/30"></div>
                                    <div className="h-12 w-full bg-slate-700/50 rounded-xl"></div>
                                    <div className="h-12 w-full bg-slate-700/50 rounded-xl"></div>
                                </div>
                            </div>
                            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                                <div className="w-20 h-20 rounded-full bg-blue-500/20 border-4 border-blue-500 mx-auto mb-4"></div>
                                <div className="h-4 w-1/2 bg-slate-700 rounded mx-auto mb-2"></div>
                                <div className="h-3 w-1/3 bg-slate-600 rounded mx-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white border-y border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Everything you need to score 95%+</h2>
                        <p className="text-slate-500 font-medium text-lg">We combine traditional curriculum with modern technology to provide an unparalleled practice experience.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                                <BookOpen className="w-7 h-7 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Structured Test Engines</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Practice objective multiple-choice questions or tackle full-length contests specifically tailored for 11th and 12th grade syllabus.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                                <BrainCircuit className="w-7 h-7 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">AI Subjective Grading</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Write long-form answers and get instant feedback! Our Gemini AI model evaluates your solutions against strict rubrics just like real examiners.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                                <Trophy className="w-7 h-7 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Weekly Leaderboards</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Earn XP for every correct answer and compete with your peers on our dynamic weekly leaderboards to secure a spot on the podium.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works / Stats */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
                
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black mb-6">Built for Serious Students</h2>
                            <p className="text-slate-400 font-medium text-lg mb-8 leading-relaxed">
                                We eliminated the distractions. BoardAbhyarthi is purely focused on test-taking, performance tracking, and continuous improvement. Track your daily activity streaks and visually see your progress.
                            </p>
                            
                            <ul className="space-y-4">
                                {[
                                    "Dual Language Support (English & Hindi)",
                                    "Image Uploads for complex Mathematics solutions",
                                    "Dynamic Class Toggling (11th vs 12th)",
                                    "Activity Heatmaps to track daily consistency"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0" />
                                        <span className="font-medium text-slate-200">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl relative">
                            <div className="absolute -left-6 -top-6 bg-blue-600 p-4 rounded-2xl shadow-lg transform -rotate-6">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-6 text-center text-slate-300 uppercase tracking-widest">Your Growth</h3>
                            
                            <div className="flex gap-2 justify-center flex-wrap mb-8">
                                {/* Dummy Heatmap */}
                                {Array.from({length: 28}).map((_, i) => (
                                    <div key={i} className={`w-8 h-8 rounded-md ${i % 7 === 0 ? 'bg-slate-700' : i % 5 === 0 ? 'bg-blue-400' : i % 3 === 0 ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                                ))}
                            </div>
                            
                            <div className="bg-slate-900 rounded-xl p-6 text-center">
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Current Streak</p>
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">14 Days</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white text-center px-4">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Ready to Boost Your Scores?</h2>
                <p className="text-xl text-slate-500 font-medium mb-10 max-w-2xl mx-auto">Join thousands of students practicing daily. Setup takes less than 30 seconds using your phone number.</p>
                <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-10 py-5 rounded-full transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1">
                    Create Free Account
                </Link>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-white font-black text-xl">BA</span>
                </div>
                <p className="text-slate-500 font-medium">&copy; {new Date().getFullYear()} BoardAbhyarthi. All rights reserved.</p>
            </footer>
        </div>
    );
}
