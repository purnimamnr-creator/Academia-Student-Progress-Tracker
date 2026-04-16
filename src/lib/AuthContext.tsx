import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocFromServer, updateDoc } from 'firebase/firestore';
import { UserProfile, TestScore, Merit, AcademicGoal, StudySession } from '../types';
import { handleFirestoreError, OperationType } from './errorHandling';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  scores: TestScore[];
  merits: Merit[];
  goals: AcademicGoal[];
  sessions: StudySession[];
  managedStudents: UserProfile[];
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  isTeacher: boolean;
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

  const isTeacher = true; // App is now teacher-centric
  const activeUid = selectedStudentId;

  // Test connection on boot
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        // Silent fail for connection test
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          let currentProfile: UserProfile;
          
          if (!userDoc.exists()) {
            currentProfile = {
              uid: user.uid,
              displayName: user.displayName || 'Student',
              email: user.email || '',
              dailyGoalMinutes: 60,
              streak: 0,
              lastActiveDate: new Date().toISOString().split('T')[0],
              role: 'teacher', 
              studentIds: []
            };
            await setDoc(doc(db, 'users', user.uid), currentProfile);
            setProfile(currentProfile);
          } else {
            currentProfile = userDoc.data() as UserProfile;
            if (currentProfile.role !== 'teacher') {
              currentProfile.role = 'teacher';
              await updateDoc(doc(db, 'users', user.uid), { role: 'teacher' });
            }
            setProfile(currentProfile);
          }
        } else {
          setProfile(null);
          setManagedStudents([]);
          setSelectedStudentId(null);
        }
      } catch (error) {
        // Silent fail for auth init
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Real-time profile listener
  useEffect(() => {
    if (!user) return;
    
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return unsub;
  }, [user]);

  useEffect(() => {
    if (!profile?.studentIds) {
      setManagedStudents([]);
      return;
    }

    const studentsUnsub = onSnapshot(
      query(collection(db, 'users'), where('uid', 'in', profile.studentIds.length ? profile.studentIds : ['dummy'])), 
      (snap) => {
        setManagedStudents(snap.docs.map(d => d.data() as UserProfile));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );

    return () => studentsUnsub();
  }, [profile?.studentIds]);

  useEffect(() => {
    if (!activeUid) {
      setScores([]);
      setMerits([]);
      setGoals([]);
      setSessions([]);
      return;
    }

    const scoresUnsub = onSnapshot(query(collection(db, 'scores'), where('uid', '==', activeUid)), (snap) => {
      setScores(snap.docs.map(d => ({ id: d.id, ...d.data() } as TestScore)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'scores'));

    const meritsUnsub = onSnapshot(query(collection(db, 'merits'), where('uid', '==', activeUid)), (snap) => {
      setMerits(snap.docs.map(d => ({ id: d.id, ...d.data() } as Merit)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'merits'));

    const goalsUnsub = onSnapshot(query(collection(db, 'goals'), where('uid', '==', activeUid)), (snap) => {
      setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() } as AcademicGoal)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'goals'));

    const sessionsUnsub = onSnapshot(query(collection(db, 'sessions'), where('uid', '==', activeUid)), (snap) => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudySession)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'sessions'));

    return () => {
      scoresUnsub();
      meritsUnsub();
      goalsUnsub();
      sessionsUnsub();
    };
  }, [activeUid]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, signIn, logout, scores, merits, goals, sessions,
      managedStudents, selectedStudentId, setSelectedStudentId, isTeacher
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
