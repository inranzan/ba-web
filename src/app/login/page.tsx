"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import baLogo from '../../../public/images/ba_logo.png';

export default function LoginPage() {
    const router = useRouter();
    const { user, userData } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            if (userData) {
                router.push('/dashboard');
            } else if (userData === null) {
                router.push('/onboarding');
            }
        }
    }, [user, userData, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setMessage('');
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const verifiedUser = userCredential.user;

            const docRef = doc(db, 'users', verifiedUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                router.push('/dashboard');
            } else {
                router.push('/onboarding');
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-600/20 overflow-hidden relative">
                        <Image src={baLogo} alt="Logo" className="object-contain p-2" fill sizes="80px" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                    <p className="text-slate-500 mt-2 font-medium">Log in to BoardAbhyarthi</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 font-medium text-lg text-slate-900 transition-all placeholder:text-slate-400"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 font-medium text-lg text-slate-900 transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!email || !password || loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl disabled:opacity-50 disabled:hover:translate-y-0 transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
                        >
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <p className="text-slate-500 font-medium">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-blue-600 font-bold hover:underline">
                            Sign up here
                        </Link>
                    </p>
                </div>

                {message && (
                    <div className={`mt-6 p-4 rounded-xl text-sm font-bold text-center ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        {message}
                    </div>
                )}
            </div>
        </main>
    );
}
