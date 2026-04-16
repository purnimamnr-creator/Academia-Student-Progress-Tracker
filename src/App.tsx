import React from 'react';
import { useAuth } from './lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Trophy, 
  Target, 
  BookOpen, 
  Calendar as CalendarIcon,
  Plus,
  TrendingUp,
  LogOut,
  Sparkles,
  Users,
  Menu,
  Settings,
  User
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dashboard } from './components/Dashboard';
import { ScoresList } from './components/ScoresList';
import { MeritsList } from './components/MeritsList';
import { GoalsList } from './components/GoalsList';
import { StudyPlanner } from './components/StudyPlanner';
import { AIInsights } from './components/AIInsights';
import { TeacherControls } from './components/TeacherControls';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const { user, profile, loading, signIn, logout, isTeacher, managedStudents, selectedStudentId } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const selectedStudent = managedStudents.find(s => s.uid === selectedStudentId);
  const displayName = selectedStudent ? selectedStudent.displayName : profile?.displayName;

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <GraduationCap className="h-12 w-12 text-indigo-600 animate-bounce" />
          <p className="text-slate-600 font-medium animate-pulse">Loading Academia...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Academia</CardTitle>
              <CardDescription className="text-slate-500 text-lg">
                Track your academic journey, set goals, and excel with AI-powered insights.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">
            <Button 
              onClick={signIn} 
              className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Sign in with Google
            </Button>
            <p className="text-center text-xs text-slate-400">
              Securely manage your scores, merits, and goals.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-card border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="text-xl font-extrabold text-primary flex items-center gap-2">
          <GraduationCap className="h-6 w-6" /> ScholarFlow
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
            🔥 {profile?.streak}
          </div>
          
          <Popover>
            <PopoverTrigger render={
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-accent-3 p-0 overflow-hidden">
                <User className="h-4 w-4 text-white" />
              </Button>
            } />
            <PopoverContent className="w-56 p-2 rounded-[24px] mr-4" align="end">
              <div className="p-3 border-b border-slate-100 mb-2">
                <p className="font-extrabold text-text-dark text-sm">{profile?.displayName}</p>
                <p className="text-[10px] text-text-light font-bold uppercase tracking-wider">Teacher</p>
              </div>
              <div className="space-y-1">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <nav className="w-[240px] bg-card border-r-2 border-slate-200 flex flex-col p-8 h-screen sticky top-0 hidden md:flex">
        <div className="text-2xl font-extrabold text-primary mb-12 flex items-center gap-2">
          <GraduationCap className="h-8 w-8" /> ScholarFlow
        </div>
        
        <div className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full nav-item-vibrant ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </button>
          <button onClick={() => setActiveTab('scores')} className={`w-full nav-item-vibrant ${activeTab === 'scores' ? 'active' : ''}`}>
            <TrendingUp className="h-5 w-5" /> Academics
          </button>
          <button onClick={() => setActiveTab('merits')} className={`w-full nav-item-vibrant ${activeTab === 'merits' ? 'active' : ''}`}>
            <Trophy className="h-5 w-5" /> Merits
          </button>
          <button onClick={() => setActiveTab('goals')} className={`w-full nav-item-vibrant ${activeTab === 'goals' ? 'active' : ''}`}>
            <Target className="h-5 w-5" /> Goals
          </button>
          <button onClick={() => setActiveTab('planner')} className={`w-full nav-item-vibrant ${activeTab === 'planner' ? 'active' : ''}`}>
            <CalendarIcon className="h-5 w-5" /> Calendar
          </button>
          <button onClick={() => setActiveTab('insights')} className={`w-full nav-item-vibrant ${activeTab === 'insights' ? 'active' : ''}`}>
            <Sparkles className="h-5 w-5" /> Insights
          </button>
        </div>

        <button onClick={logout} className="nav-item-vibrant mt-auto text-rose-500 hover:bg-rose-50 hover:text-rose-600">
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </nav>

      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto pb-24 md:pb-8">
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-text-dark">Hello, {displayName?.split(' ')[0]}! 👋</h1>
            <p className="text-text-light text-sm font-medium">
              {selectedStudent ? `Viewing records for ${selectedStudent.displayName}` : "Manage your classroom and track student progress."}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-full shadow-sm">
            <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-sm">
              🔥 {profile?.streak} Day Streak
            </div>
            <div className="font-bold text-sm text-text-dark">{profile?.displayName}</div>
            <div className="w-8 h-8 rounded-full bg-accent-3"></div>
          </div>
        </div>

        <div className="md:hidden">
          <h1 className="text-2xl font-extrabold text-text-dark">Hello, {displayName?.split(' ')[0]}! 👋</h1>
          <p className="text-text-light text-xs font-medium">
            {selectedStudent ? `Viewing: ${selectedStudent.displayName}` : "Classroom Management"}
          </p>
        </div>

        <TeacherControls />

        <div className="flex-1">
          {selectedStudentId === null ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white/30 backdrop-blur-sm rounded-[32px] border-2 border-dashed border-slate-200">
              <div className="bg-primary/10 p-6 rounded-full mb-6">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-extrabold text-text-dark mb-2">No Student Selected</h2>
              <p className="text-text-light max-w-md mx-auto">
                Please select a student from the management console above to view their academic records, goals, and progress.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'scores' && <ScoresList />}
              {activeTab === 'merits' && <MeritsList />}
              {activeTab === 'goals' && <GoalsList />}
              {activeTab === 'planner' && <StudyPlanner />}
              {activeTab === 'insights' && <AIInsights />}
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-slate-200 px-2 py-2 flex items-center justify-around z-50">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'text-primary bg-indigo-50' : 'text-text-light'}`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('scores')} 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'scores' ? 'text-primary bg-indigo-50' : 'text-text-light'}`}
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-[10px] font-bold">Scores</span>
        </button>
        <button 
          onClick={() => setActiveTab('merits')} 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'merits' ? 'text-primary bg-indigo-50' : 'text-text-light'}`}
        >
          <Trophy className="h-5 w-5" />
          <span className="text-[10px] font-bold">Merits</span>
        </button>
        <button 
          onClick={() => setActiveTab('goals')} 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'goals' ? 'text-primary bg-indigo-50' : 'text-text-light'}`}
        >
          <Target className="h-5 w-5" />
          <span className="text-[10px] font-bold">Goals</span>
        </button>
        <button 
          onClick={() => setActiveTab('planner')} 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'planner' ? 'text-primary bg-indigo-50' : 'text-text-light'}`}
        >
          <CalendarIcon className="h-5 w-5" />
          <span className="text-[10px] font-bold">Plan</span>
        </button>
        <button 
          onClick={() => setActiveTab('insights')} 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'insights' ? 'text-primary bg-indigo-50' : 'text-text-light'}`}
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-[10px] font-bold">AI</span>
        </button>
      </nav>

      <Toaster position="bottom-right" />
    </div>
  );
}
