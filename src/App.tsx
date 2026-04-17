import React, { useState } from 'react';
import { useAuth } from './lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  User,
  Mail,
  Lock,
  UserPlus,
  Trash2
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
import { toast } from 'sonner';

export default function App() {
  const { user, profile, loading, signIn, signInWithGoogle, signUp, logout, isTeacher, managedStudents, selectedStudentId } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const selectedStudent = managedStudents.find(s => s.uid === selectedStudentId);
  const displayName = selectedStudent ? selectedStudent.displayName : profile?.displayName;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    console.log("Starting authentication session...");
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      setAuthLoading(false);
      return;
    }

    try {
      if (isSigningUp) {
        if (!name) throw new Error('Name is required');
        console.log("Attempting sign up for:", email);
        await signUp(email, password, name);
        toast.success('Account created successfully!');
      } else {
        console.log("Attempting sign in for:", email);
        await signIn(email, password);
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const projectId = "gen-lang-client-0471121664";
      const consoleUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;
      
      if (error.code === 'auth/unauthorized-domain') {
        toast.error(
          <div className="flex flex-col gap-2">
            <p className="font-bold">Domain not authorized!</p>
            <p className="text-xs">Your Netlify URL must be added to the Authorized Domains list in your Firebase project: <strong>{projectId}</strong></p>
            <a href={consoleUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-bold text-xs mt-1">Open Firebase Settings</a>
          </div>,
          { duration: 10000 }
        );
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error(
          <div className="flex flex-col gap-2">
            <p className="font-bold">Email/Password Disabled!</p>
            <p className="text-xs">Go to Firebase Console &gt; Authentication &gt; Sign-in method and enable **Email/Password**. Project: <strong>{projectId}</strong></p>
            <a href={`https://console.firebase.google.com/project/${projectId}/authentication/providers`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-bold text-xs mt-1">Enable Email/Password</a>
          </div>,
          { duration: 10000 }
        );
      } else if (error.code === 'auth/invalid-email') {
        toast.error('The email address is badly formatted. Please check for typos.');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password. If you haven\'t created an account yet, please use the Sign Up tab.');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please login instead of signing up.');
      } else {
        toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    console.log("Attempting Google Sign-In...");
    try {
      await signInWithGoogle();
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error("Google Auth error:", error);
      const projectId = "gen-lang-client-0471121664";
      const consoleUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

      if (error.code === 'auth/unauthorized-domain') {
          toast.error(
            <div className="flex flex-col gap-2">
              <p className="font-bold">Domain not authorized!</p>
              <p className="text-xs">Your Netlify URL must be added to the Authorized Domains list in your Firebase project: <strong>{projectId}</strong></p>
              <a href={consoleUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-bold text-xs mt-1">Open Firebase Settings</a>
            </div>,
            { duration: 10000 }
          );
      } else {
        toast.error(error.message || 'Google Sign-In failed');
      }
    } finally {
      setAuthLoading(false);
    }
  };

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
        <Toaster position="bottom-right" />
        <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-sm p-2">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Academia</CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Teacher Management Console
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-4 mb-4">
                {isSigningUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="name" 
                        placeholder="Dr. Smith" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11 rounded-xl"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="teacher@school.edu" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={authLoading}
                className="w-full h-12 text-md bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg rounded-xl flex items-center gap-2"
              >
                {authLoading ? 'Please wait...' : (isSigningUp ? 'Create Teacher Account' : 'Sign In')}
              </Button>

              <div className="pt-4 text-center">
                <button 
                  type="button" 
                  onClick={() => setIsSigningUp(!isSigningUp)}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {isSigningUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline"
              disabled={authLoading}
              onClick={handleGoogleSignIn}
              className="w-full h-11 text-sm bg-white hover:bg-slate-50 border-slate-200 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" />
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
            <PopoverContent className="w-64 p-2 rounded-[24px] mr-4" align="end">
              <div className="p-3 border-b border-slate-100 mb-2">
                <p className="font-extrabold text-text-dark text-sm">{profile?.displayName}</p>
                <p className="text-[10px] text-text-light font-bold uppercase tracking-wider">Account Role: <span className="text-primary">{profile?.role}</span></p>
                <div className="mt-2 pt-2 border-t border-slate-50">
                  <p className="text-[10px] text-text-light font-bold">USER ID (for manual database sync):</p>
                  <code className="text-[9px] bg-slate-100 p-1 block rounded mt-1 break-all cursor-help" title="Copy this ID to the 'teacherUid' field in Firestore Console to link manual data.">
                    {user?.uid}
                  </code>
                </div>
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
            <div className="flex flex-col items-end">
              <div className="font-bold text-sm text-text-dark">{profile?.displayName}</div>
              <div className="text-[9px] text-text-light font-mono truncate max-w-[120px]" title={`User ID: ${user?.uid}`}>
                ID: {user?.uid}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent-3"></div>
          </div>
        </div>

        {selectedStudent && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-3xl flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-rose-500 text-white p-2 rounded-xl">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-700">Student Account Management</p>
                <p className="text-xs text-rose-600 font-medium whitespace-nowrap">Perform administrative actions for {selectedStudent.displayName}</p>
              </div>
            </div>
            <TeacherControls isDeleteMode={true} />
          </div>
        )}

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
    </div>
    </>
  );
}
