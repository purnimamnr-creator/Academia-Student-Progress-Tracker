import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getAcademicInsights, generateStudyResources } from '../lib/gemini';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BrainCircuit, Lightbulb, Target, BookOpen, Loader2, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export function AIInsights() {
  const { scores, goals, selectedStudentId } = useAuth();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Reset insights when student changes
  useEffect(() => {
    setInsights(null);
  }, [selectedStudentId]);

  const handleGenerate = async () => {
    if (scores.length === 0) {
      toast.error('Add some scores first to get personalized insights!');
      return;
    }
    setLoading(true);
    try {
      const data = await getAcademicInsights(scores, goals);
      setInsights(data);
      toast.success('Insights generated!');
    } catch (error) {
      toast.error('Failed to generate insights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-text-dark">AI Academic Advisor</h2>
          <p className="text-text-light font-medium">Get personalized insights and study tips based on your performance.</p>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={loading}
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-indigo-100 rounded-xl font-bold"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Generate Insights
        </Button>
      </div>

      {!insights && !loading && (
        <div className="vibrant-card flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100">
          <div className="bg-indigo-50 p-6 rounded-[24px] shadow-sm mb-6">
            <BrainCircuit className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-extrabold text-text-dark mb-2">Ready to analyze your progress?</h3>
          <p className="text-text-light max-w-md mx-auto font-medium">
            Our AI will look at your scores and goals to identify patterns, strengths, and areas where you can improve.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 animate-pulse">
          <Sparkles className="h-16 w-16 text-primary/40 mb-4" />
          <p className="text-text-light font-extrabold text-lg">Gemini is analyzing your academic data...</p>
        </div>
      )}

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="vibrant-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-rose-100 p-3 rounded-2xl text-rose-500">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-text-dark">Areas to Improve</h3>
            </div>
            <ul className="space-y-4">
              {insights.improvements.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-text-dark font-medium text-sm leading-relaxed">
                  <div className="h-2 w-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="vibrant-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-500">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-text-dark">Your Strengths</h3>
            </div>
            <ul className="space-y-4">
              {insights.strengths.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-text-dark font-medium text-sm leading-relaxed">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 vibrant-card bg-gradient-to-br from-primary to-accent-1 text-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-extrabold">Actionable Study Tips</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.tips.map((item: string, i: number) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm p-5 rounded-[20px] border border-white/10">
                  <p className="text-sm leading-relaxed font-medium opacity-95">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-white/10 text-center">
              <p className="italic text-lg font-bold">"{insights.motivation}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
