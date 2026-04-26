"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { uploadToImageKit } from "@/utils/imagekit";
import { ArrowLeft, Sparkles, Upload, X, CheckCircle, Circle, Image as ImageIcon } from "lucide-react";

export default function SubjectiveTest() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const subjectId = searchParams.get('subjectId');
  const isContest = searchParams.get('isContest') === 'true';
  const { user, userData, setUserData } = useAuth();

  const [answer, setAnswer] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [solutionImageUrl, setSolutionImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [aiFeedback, setAiFeedback] = useState<Record<string, any>>({});
  const [isGrading, setIsGrading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!id || (!subjectId && !isContest)) return;
      try {
        let qSnap;
        if (isContest) {
            const qRef = collection(db, "contests", id, "questions");
            qSnap = await getDocs(query(qRef, where("type", "==", "subjective")));
        } else {
            if (!subjectId) return;
            const qRef = collection(db, "subjects", subjectId, "chapters", id, "questions");
            qSnap = await getDocs(query(qRef, where("type", "==", "subjective")));
        }

        const qData: any[] = [];
        qSnap.forEach((doc) => {
          qData.push({ id: doc.id, ...doc.data() });
        });
        setQuestions(qData);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchQuestions();
  }, [id, subjectId, isContest]);

  const handleTestSubmit = async (count: number) => {
      let gainedXP = count * 5;
      if (isContest) gainedXP *= 2;

      if (user && userData && gainedXP > 0) {
          try {
              const userRef = doc(db, 'users', user.uid);
              const today = new Date().toISOString().split('T')[0];
              
              const newDailyActivity = { ...(userData.dailyActivity || {}) };
              newDailyActivity[today] = (newDailyActivity[today] || 0) + gainedXP;
              
              const newDailyMissions = { ...(userData.dailyMissions || {}) };
              const tStats = newDailyMissions[today] || { obs: 0, subs: 0, rnds: 0 };
              tStats.subs += count;
              newDailyMissions[today] = tStats;

              let currentXP = userData.xp || 0;
              currentXP += gainedXP;

              const d = new Date();
              const yearStart = new Date(d.getFullYear(), 0, 1);
              const days = Math.floor((d.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
              const currentWeekKey = `${d.getFullYear()}_W${Math.ceil((days + yearStart.getDay() + 1) / 7)}`;

              let currentWeeklyXP = userData.weeklyXP || 0;
              if (userData.activeWeek !== currentWeekKey) {
                  currentWeeklyXP = gainedXP;
              } else {
                  currentWeeklyXP += gainedXP;
              }

              await updateDoc(userRef, {
                  xp: currentXP,
                  dailyActivity: newDailyActivity,
                  dailyMissions: newDailyMissions,
                  weeklyXP: currentWeeklyXP,
                  activeWeek: currentWeekKey
              });

              setUserData({ ...userData, xp: currentXP, dailyActivity: newDailyActivity, dailyMissions: newDailyMissions, weeklyXP: currentWeeklyXP, activeWeek: currentWeekKey });
          } catch (e) {
              console.error(e);
          }
      }

      router.replace(`/tests/result?score=${count}&total=${questions.length}&xpEarned=${gainedXP}&isContest=${isContest}`);
  };

  const handleUploadWork = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
          const url = await uploadToImageKit(file);
          setSolutionImageUrl(url);
      } catch (err: any) {
          alert(`Upload Failed: ${err.message}`);
      }
      setIsUploading(false);
  };

  const handleReveal = async () => {
      setModalVisible(true);
      const qd = questions[currentQuestionIndex];
      if (aiFeedback[qd.id]) return;

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) return;

      setIsGrading(true);
      try {
          const sysPrompt = `You are a strict but fair expert tutor grading a student's answer.
Question: ${qd.question || qd.prompt}
Student's Answer: ${answer}
Grading Rubric Points (${qd.rubric?.length || 0} total points):
${(qd.rubric || []).map((r: string) => "- " + r).join("\n")}

Respond strictly in raw JSON without any markdown formatting wrappers (like \`\`\`json). Use this EXACT schema:
{
  "score": <number out of ${(qd.rubric?.length || 5)}>,
  "feedback": "<1-2 short sentences of constructive feedback focusing on missing rubric points>"
}`;

          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  contents: [{ parts: [{ text: sysPrompt }] }],
                  generationConfig: { temperature: 0.1 }
              })
          });

          if (!res.ok) throw new Error("Gemini API Error");
          const data = await res.json();
          const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (textResponse) {
              const cleanJSON = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanJSON);
              setAiFeedback(prev => ({
                  ...prev,
                  [qd.id]: { score: parsed.score, feedback: parsed.feedback }
              }));
          }
      } catch (e) {
          console.warn("AI grading failed:", e);
      }
      setIsGrading(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  if (questions.length === 0) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="text-center">
                <p className="text-slate-500 mb-4 font-medium">No subjective questions found for this context.</p>
                <button onClick={() => router.back()} className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">Go Back</button>
            </div>
        </div>
    );
  }

  const questionData = questions[currentQuestionIndex];
  const displayRubric = questionData?.rubric || [];
  const displayRubricHindi = questionData?.rubricHindi || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 bg-white border-b-2 border-slate-100 z-10 sticky top-0">
        <button className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
        <div className="flex-1 flex flex-col items-center pr-12">
          <h2 className="text-xl font-black text-slate-900">Question {currentQuestionIndex + 1} of {questions.length}</h2>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Long Answer Practice</span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col pb-32">
        <div className="w-full pb-8 border-b border-slate-200 mb-8 flex flex-col items-center text-center">
            <span className="inline-block text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                Subjective Prompt
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-snug max-w-2xl">{questionData?.question || questionData?.prompt}</h3>
            {questionData?.questionHindi && <h4 className="text-xl font-bold text-slate-500 leading-snug mt-3">{questionData.questionHindi}</h4>}
            {questionData?.imageUrl && <img src={questionData.imageUrl} alt="Reference" className="w-full max-h-[300px] object-contain mt-6 rounded-2xl border border-slate-200 bg-white" />}
        </div>

        {/* Input Area */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">Your Answer</label>
          <textarea
            className="w-full min-h-[250px] rounded-3xl border-2 border-slate-200 bg-white p-6 text-lg text-slate-900 shadow-sm focus:border-indigo-600 outline-none resize-y transition-colors"
            placeholder="Start typing your explanation here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUploadWork} />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`mt-4 p-5 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-colors ${solutionImageUrl ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100" : "bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100"}`}
          >
             {isUploading ? <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : (solutionImageUrl ? <CheckCircle className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />)}
             <span className="font-bold text-lg">{isUploading ? "Uploading Securely..." : solutionImageUrl ? "Work Attached! (Tap to change)" : "Upload Written Process (Optional)"}</span>
          </button>
          
          <div className="flex justify-end mt-2">
            <span className="text-sm font-bold text-slate-400">AIM FOR 3-4 SENTENCES</span>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t-2 border-slate-100 p-4 z-20">
        <div className="max-w-4xl mx-auto">
            <button 
                onClick={handleReveal}
                disabled={answer.length <= 5}
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all ${answer.length > 5 ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
            >
                <Sparkles className="w-6 h-6" />
                <span className="font-black text-xl tracking-wide uppercase">AI Grade & Reveal</span>
            </button>
        </div>
      </div>

      {/* Self-Grade Modal equivalent */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalVisible(false)} />
            
            <div className="relative bg-white rounded-t-[40px] shadow-2xl h-[85vh] flex flex-col animate-in slide-in-from-bottom-full duration-300">
                <div className="flex justify-center pt-4 pb-2">
                    <div className="w-16 h-2 bg-slate-200 rounded-full" />
                </div>

                <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900">Answer Rubric</h2>
                    <button onClick={() => setModalVisible(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="bg-slate-50 rounded-3xl p-6 md:p-8 border-2 border-slate-200">
                        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Key Points to Include:</h4>
                        
                        {isGrading && (
                            <div className="mb-8 p-6 bg-white border border-indigo-100 rounded-2xl flex items-center gap-4 shadow-sm animate-pulse">
                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-indigo-600 font-bold text-lg">AI is analyzing your response...</span>
                            </div>
                        )}

                        {!isGrading && aiFeedback[questionData?.id] && (
                            <div className="mb-8 p-6 md:p-8 bg-white border-2 border-indigo-200 rounded-3xl shadow-lg shadow-indigo-100/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-black text-indigo-900 text-2xl flex items-center gap-2"><Sparkles className="w-6 h-6 text-indigo-500" /> AI Feedback</h3>
                                    <div className="bg-indigo-100 px-4 py-2 rounded-xl border border-indigo-200">
                                        <span className="font-black text-indigo-700 text-lg">Score: {aiFeedback[questionData.id].score} / {displayRubric.length}</span>
                                    </div>
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium text-lg mb-8 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-50">{aiFeedback[questionData.id].feedback}</p>
                                
                                <h4 className="font-black text-slate-400 text-sm mb-4 uppercase tracking-widest">Required Rubric Check</h4>
                                <div className="space-y-3">
                                    {displayRubric.map((point: string, idx: number) => {
                                        const scoreRatio = aiFeedback[questionData.id].score / displayRubric.length;
                                        const likelyHit = scoreRatio > (idx / displayRubric.length);
                                        return (
                                            <div key={idx} className="flex items-start gap-4">
                                                {likelyHit ? <CheckCircle className="w-6 h-6 text-green-500 shrink-0" /> : <Circle className="w-6 h-6 text-slate-300 shrink-0" />}
                                                <span className={`text-base font-medium ${likelyHit ? "text-slate-800" : "text-slate-500"}`}>{point}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {!aiFeedback[questionData?.id] && (
                            <div className="space-y-6">
                                {displayRubric.map((point: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                                        <div>
                                            <p className="text-lg font-bold text-slate-800 leading-snug">{point}</p>
                                            {displayRubricHindi[idx] && <p className="text-base font-medium text-slate-500 mt-2">{displayRubricHindi[idx]}</p>}
                                        </div>
                                    </div>
                                ))}
                                {displayRubric.length === 0 && <p className="text-slate-500 italic font-medium">No rubric provided.</p>}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-4 pt-4">
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">How did you do?</span>
                        <button 
                            className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-green-600/30 transition-all hover:-translate-y-1"
                            onClick={() => {
                                setModalVisible(false);
                                const nextIdx = currentQuestionIndex + 1;
                                if (nextIdx < questions.length) {
                                    setAnswer("");
                                    setSolutionImageUrl(null);
                                    setCurrentQuestionIndex(nextIdx);
                                } else {
                                    handleTestSubmit(nextIdx);
                                }
                            }}
                        >
                            <CheckCircle className="w-6 h-6" />
                            <span className="font-black text-xl uppercase tracking-widest">{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish & Claim XP'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
