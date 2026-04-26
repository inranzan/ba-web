"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

interface AuthContextType {
    user: User | null;
    userData: any | null;
    loading: boolean;
    setUserData: React.Dispatch<React.SetStateAction<any | null>>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
            if (authenticatedUser) {
                setUser(authenticatedUser);
                try {
                    const docRef = doc(db, 'users', authenticatedUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        let data = docSnap.data();
                        
                        const today = new Date().toISOString().split('T')[0];
                        const lastLogin = data.lastLoginDate;
                        let currentStreak = data.streak || 0;
                        let needsUpdate = false;

                        if (lastLogin !== today) {
                            if (lastLogin) {
                                const yesterday = new Date();
                                yesterday.setDate(yesterday.getDate() - 1);
                                if (lastLogin === yesterday.toISOString().split('T')[0]) {
                                    currentStreak += 1;
                                } else {
                                    currentStreak = 1;
                                }
                            } else {
                                currentStreak = 1;
                            }
                            needsUpdate = true;
                        }

                        if (needsUpdate) {
                            await updateDoc(docRef, {
                                lastLoginDate: today,
                                streak: currentStreak
                            });
                            data.lastLoginDate = today;
                            data.streak = currentStreak;
                        }
                        
                        setUserData(data);
                    } else {
                        setUserData(null);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};
