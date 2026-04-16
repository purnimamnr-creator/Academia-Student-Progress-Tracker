import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TestScore, Merit, AcademicGoal, StudySession, UserProfile } from '../types';
import { handleFirestoreError, OperationType } from './errorHandling';

export const addScore = async (uid: string, score: Omit<TestScore, 'id'>) => {
  try {
    return await addDoc(collection(db, 'scores'), { ...score, uid, createdAt: Timestamp.now() });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'scores');
  }
};

export const updateScore = async (id: string, score: Partial<TestScore>) => {
  try {
    return await updateDoc(doc(db, 'scores', id), score);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `scores/${id}`);
  }
};

export const deleteScore = async (id: string) => {
  try {
    return await deleteDoc(doc(db, 'scores', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `scores/${id}`);
  }
};

export const addMerit = async (uid: string, merit: Omit<Merit, 'id'>) => {
  try {
    return await addDoc(collection(db, 'merits'), { ...merit, uid, createdAt: Timestamp.now() });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'merits');
  }
};

export const addGoal = async (uid: string, goal: Omit<AcademicGoal, 'id'>) => {
  try {
    return await addDoc(collection(db, 'goals'), { ...goal, uid, createdAt: Timestamp.now() });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'goals');
  }
};

export const updateGoal = async (id: string, goal: Partial<AcademicGoal>) => {
  try {
    return await updateDoc(doc(db, 'goals', id), goal);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `goals/${id}`);
  }
};

export const addSession = async (uid: string, session: Omit<StudySession, 'id'>) => {
  try {
    return await addDoc(collection(db, 'sessions'), { ...session, uid, createdAt: Timestamp.now() });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'sessions');
  }
};

export const deleteSession = async (id: string) => {
  try {
    return await deleteDoc(doc(db, 'sessions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `sessions/${id}`);
  }
};

export const addStudent = async (teacherUid: string, studentName: string, standard: string) => {
  try {
    const studentUid = `student_${Math.random().toString(36).substr(2, 9)}`;
    const studentProfile: UserProfile = {
      uid: studentUid,
      displayName: studentName,
      email: `${studentUid}@placeholder.com`,
      dailyGoalMinutes: 60,
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      role: 'student',
      studentIds: [],
      standard
    };
    
    await setDoc(doc(db, 'users', studentUid), studentProfile);
    
    const teacherDoc = await getDoc(doc(db, 'users', teacherUid));
    const currentStudentIds = teacherDoc.data()?.studentIds || [];
    
    await updateDoc(doc(db, 'users', teacherUid), {
      studentIds: [...currentStudentIds, studentUid]
    });
    
    return studentUid;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
  }
};
