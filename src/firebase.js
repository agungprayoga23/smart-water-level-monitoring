import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD1fbHY5wNBwL2ATDbN-hI6hnNkVkAVdVw",
  authDomain: "project-monitoring-pompa.firebaseapp.com",
  databaseURL: "https://project-monitoring-pompa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "project-monitoring-pompa",
  storageBucket: "project-monitoring-pompa.firebasestorage.app",
  messagingSenderId: "362022908243",
  appId: "1:362022908243:web:bae420a82bc4a8054eb1a6"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export { app, db };
