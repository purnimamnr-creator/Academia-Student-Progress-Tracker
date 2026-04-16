import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, Trophy, Target, Clock, Star, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const { scores, merits, goals, profile } = useAuth();

  const recentScores = [...scores].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  
  const chartData = [...scores]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(s => ({
      date: format(new Date(s.date), 'MMM dd'),
      score: (s.score / s.maxScore) * 100,
      subject: s.subject
    }));

  const averageScore = scores.length > 0 
    ? (scores.reduce((acc, s) => acc + (s.score / s.maxScore), 0) / scores.length * 100).toFixed(1)
    : 0;

  const completedGoals = goals.filter(g => g.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-box-vibrant bg-primary">
          <span className="stat-label">Overall GPA</span>
          <span className="stat-value">{(Number(averageScore) / 25).toFixed(2)}</span>
        </div>

        <div className="stat-box-vibrant bg-accent-1">
          <span className="stat-label">Total Merits</span>
          <span className="stat-value">{merits.length.toLocaleString()}</span>
        </div>

        <div className="stat-box-vibrant bg-accent-2">
          <span className="stat-label">Completed Goals</span>
          <span className="stat-value">{completedGoals} / {goals.length}</span>
        </div>

        <div className="stat-box-vibrant bg-accent-3">
          <span className="stat-label">Current Streak</span>
          <span className="stat-value">{profile?.streak || 0} Days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 vibrant-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-text-dark flex items-center gap-2">
              Academic Growth
            </h3>
            <span className="text-xs text-success font-bold">+12% from last month</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4361EE" 
                  strokeWidth={4} 
                  dot={{ fill: '#4361EE', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="vibrant-card">
          <h3 className="text-lg font-extrabold text-text-dark mb-6 flex items-center gap-2">
            Recent Scores
          </h3>
          <div className="space-y-4">
            {recentScores.length > 0 ? (
              recentScores.map((score) => {
                const percentage = (score.score / score.maxScore) * 100;
                const scoreClass = percentage >= 90 ? 'bg-green-100 text-green-800' : percentage >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800';
                return (
                  <div key={score.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-text-dark">{score.subject}</p>
                      <p className="text-xs text-text-light">{format(new Date(score.date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg font-bold text-xs ${scoreClass}`}>
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-text-light">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Study Tip Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="vibrant-card lg:col-span-2">
          <h3 className="text-lg font-extrabold text-text-dark mb-6">Active Goals</h3>
          <div className="space-y-6">
            {goals.filter(g => g.status === 'in-progress').slice(0, 3).map(goal => {
              const progress = (goal.currentValue / goal.targetValue) * 100;
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-text-dark">
                    <span>{goal.title}</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-1 rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {goals.filter(g => g.status === 'in-progress').length === 0 && (
              <p className="text-sm text-text-light text-center py-4">No active goals. Set one today!</p>
            )}
          </div>
        </div>

        <div className="p-6 rounded-[24px] bg-gradient-to-br from-accent-2 to-[#9D174D] text-white flex flex-col gap-4 shadow-lg">
          <h3 className="text-lg font-extrabold flex items-center gap-2">
            <Lightbulb className="h-5 w-5" /> Daily Study Tip
          </h3>
          <p className="text-sm leading-relaxed opacity-95">
            Try the <strong>Pomodoro Technique</strong> today: Study for 25 minutes, then take a 5-minute break. It helps keep your brain fresh for complex subjects!
          </p>
        </div>
      </div>
    </div>
  );
}
