import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './errorHandling';
import { toast } from 'sonner';
import { UserProfile, TestScore, Merit, AcademicGoal, StudySession } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  scores: TestScore[];
  merits: Merit[];
  goals: AcademicGoal[];
  sessions: StudySession[];
  managedStudents: UserProfile[];
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  isTeacher: boolean;
  // Local storage refresh helpers
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<TestScore[]>([]);
  const [merits, setMerits] = useState<Merit[]>([]);
  const [goals, setGoals] = useState<AcademicGoal[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [managedStudents, setManagedStudents] = useState<UserProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const isTeacher = profile?.role === 'teacher';
  const activeUid = selectedStudentId;

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setManagedStudents([]);
      setScores([]);
      setMerits([]);
      setGoals([]);
      setSessions([]);
      setLoading(false);
      return;
    }

    // 1. Listen for User Profile
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const profileData = snapshot.data() as UserProfile;
        setProfile(profileData);
      } else {
        // Create initial profile if missing
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Teacher',
          email: user.email || '',
          dailyGoalMinutes: 60,
          streak: 0,
          lastActiveDate: new Date().toISOString().split('T')[0],
          role: 'teacher',
          studentIds: []
        };
        setDoc(doc(db, 'users', user.uid), newProfile).catch(e => {
          console.error("Failed to create profile:", e);
          toast.error("Account logged in, but failed to create profile record in database. Please check your Firestore rules.");
        });
        setProfile(newProfile);
      }
      setLoading(false);
    }, (error) => {
      setLoading(false);
      try {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } catch (err) {
        console.error("Auth Diagnostic:", err);
      }
    });

    // 2. Listen for Managed Students (if teacher)
    const qStudents = query(collection(db, 'users'), where('teacherUid', '==', user.uid));
    const unsubStudents = onSnapshot(qStudents, (snapshot) => {
      setManagedStudents(snapshot.docs.map(doc => ({ ...doc.data() as UserProfile, uid: doc.id })));
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } catch (err) {
        console.error("Managed Students Diagnostic:", err);
      }
    });

    return () => {
      unsubProfile();
      unsubStudents();
    };
  }, [user]);

  // 3. Listen for Student Data
  useEffect(() => {
    if (!user || !activeUid) {
      setScores([]);
      setMerits([]);
      setGoals([]);
      setSessions([]);
      return;
    }

    const qScores = query(collection(db, 'scores'), where('studentId', '==', activeUid), where('uid', '==', user.uid));
    const unsubScores = onSnapshot(qScores, (snapshot) => {
      setScores(snapshot.docs.map(doc => ({ ...doc.data() as TestScore, id: doc.id })));
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, 'scores');
      } catch (err) {
        console.error("Scores Diagnostic:", err);
      }
    });

    const qMerits = query(collection(db, 'merits'), where('studentId', '==', activeUid), where('uid', '==', user.uid));
    const unsubMerits = onSnapshot(qMerits, (snapshot) => {
      setMerits(snapshot.docs.map(doc => ({ ...doc.data() as Merit, id: doc.id })));
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, 'merits');
      } catch (err) {
        console.error("Merits Diagnostic:", err);
      }
    });

    const qGoals = query(collection(db, 'goals'), where('studentId', '==', activeUid), where('uid', '==', user.uid));
    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ ...doc.data() as AcademicGoal, id: doc.id })));
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, 'goals');
      } catch (err) {
        console.error("Goals Diagnostic:", err);
      }
    });

    const qSessions = query(collection(db, 'sessions'), where('studentId', '==', activeUid), where('uid', '==', user.uid));
    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ ...doc.data() as StudySession, id: doc.id })));
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, 'sessions');
      } catch (err) {
        console.error("Sessions Diagnostic:", err);
      }
    });

    return () => {
      unsubScores();
      unsubMerits();
      unsubGoals();
      unsubSessions();
    };
  }, [user, activeUid]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshData = () => {
    // Real-time listeners handle this now
  };

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signUp = async (email: string, pass: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
      const newProfile: UserProfile = {
        uid: res.user.uid,
        displayName: name,
        email: email,
        dailyGoalMinutes: 60,
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        role: 'teacher',
        studentIds: []
      };
      // We set doc first, then the snapshot listener will pick it up
      try {
        await setDoc(doc(db, 'users', res.user.uid), newProfile);
        setProfile(newProfile);
      } catch (e: any) {
        console.error("Failed to create profile during signup:", e);
        toast.error("Account created, but database profile setup failed: " + e.message);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, signIn, signInWithGoogle, signUp, logout, scores, merits, goals, sessions,
      managedStudents, selectedStudentId, setSelectedStudentId, isTeacher,
      refreshData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
