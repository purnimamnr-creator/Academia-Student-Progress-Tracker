import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBluc7rhBq4LSIQJ-BjOfkV-ooLstLKfxU",
  authDomain: "academiastudentprogresstracker.firebaseapp.com",
  projectId: "academiastudentprogresstracker",
  storageBucket: "academiastudentprogresstracker.firebasestorage.app",
  messagingSenderId: "943658686950",
  appId: "1:943658686950:web:aa6234707d43b9f5575e27"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
