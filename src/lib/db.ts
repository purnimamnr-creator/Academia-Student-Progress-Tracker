import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './errorHandling';
import { TestScore, Merit, AcademicGoal, StudySession, UserProfile } from '../types';

export const addScore = async (teacherUid: string, studentId: string, score: Omit<TestScore, 'id' | 'uid' | 'studentId'>) => {
  const path = 'scores';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...score,
      uid: teacherUid, // Teacher is the owner
      studentId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
};

export const updateScore = async (id: string, updates: Partial<TestScore>) => {
  const path = `scores/${id}`;
  try {
    await updateDoc(doc(db, 'scores', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteScore = async (id: string) => {
  const path = `scores/${id}`;
  try {
    await deleteDoc(doc(db, 'scores', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const addMerit = async (teacherUid: string, studentId: string, merit: Omit<Merit, 'id' | 'uid' | 'studentId'>) => {
  const path = 'merits';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...merit,
      uid: teacherUid,
      studentId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
};

export const addGoal = async (teacherUid: string, studentId: string, goal: Omit<AcademicGoal, 'id' | 'uid' | 'studentId'>) => {
  const path = 'goals';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...goal,
      uid: teacherUid,
      studentId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
};

export const updateGoal = async (id: string, updates: Partial<AcademicGoal>) => {
  const path = `goals/${id}`;
  try {
    await updateDoc(doc(db, 'goals', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const addSession = async (teacherUid: string, studentId: string, session: Omit<StudySession, 'id' | 'uid' | 'studentId'>) => {
  const path = 'sessions';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...session,
      uid: teacherUid,
      studentId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
};

export const deleteSession = async (id: string) => {
  const path = `sessions/${id}`;
  try {
    await deleteDoc(doc(db, 'sessions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const addStudent = async (teacherUid: string, studentName: string, standard: string) => {
  const path = 'users';
  try {
    const studentUid = `student_${Math.random().toString(36).substr(2, 9)}`;
    const studentProfile = {
      uid: studentUid,
      displayName: studentName,
      email: `${studentUid}@placeholder.com`,
      dailyGoalMinutes: 60,
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      role: 'student',
      teacherUid, // Crucial for filtering students managed by this teacher
      standard
    };

    // Note: The student profile 'uid' is different from the document ID in 'users' collection 
    // if we want the teacher to own it. But wait, in 'users' collection, the doc ID is the UID.
    // If the teacher owns it, the rules 'isUserSelf(userId)' will block the teacher 
    // from writing to 'users/student_123'.
    
    // We need to either:
    // 1. Change user rules to allow teachers to manage their students.
    // 2. Or create students as a sub-collection? No, blueprint.
    
    // Let's modify firestore.rules to allow teachers to read/write students they manage.
    
    await setDoc(doc(db, 'users', studentUid), studentProfile);
    
    return studentUid;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
};

export const deleteStudent = async (studentUid: string) => {
  const path = `users/${studentUid}`;
  try {
    await deleteDoc(doc(db, 'users', studentUid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
