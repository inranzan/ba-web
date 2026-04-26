"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import baLogo from '../../../public/images/ba_logo.png';

export default function SignupPage() {
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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setMessage('');
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            const docRef = doc(db, 'users', newUser.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                router.push('/onboarding');
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
            <Link href="/" className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 font-bold flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back to Home
            </Link>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-600/20 overflow-hidden relative">
                        <Image src={baLogo} alt="Logo" className="object-contain p-1.5" fill sizes="64px" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create an Account</h1>
                    <p className="text-slate-500 mt-2 font-medium">Join BoardAbhyarthi and boost your scores.</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
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
                                minLength={6}
                                className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 font-medium text-lg text-slate-900 transition-all placeholder:text-slate-400"
                                placeholder="Create a password (min 6 chars)"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!email || password.length < 6 || loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl disabled:opacity-50 disabled:hover:translate-y-0 transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <p className="text-slate-500 font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 font-bold hover:underline">
                            Log in here
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
