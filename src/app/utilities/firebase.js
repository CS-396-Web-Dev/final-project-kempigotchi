import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update } from "firebase/database";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKrxaVhCatxMNPOx3CzUcHlgYNv0icuYI",
  authDomain: "kempigotchi.firebaseapp.com",
  databaseURL: "https://kempigotchi-default-rtdb.firebaseio.com/",
  projectId: "kempigotchi",
  storageBucket: "kempigotchi.appspot.com",
  messagingSenderId: "27463845588",
  appId: "1:27463845588:web:6b977f69962b89c80b5d41",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// Sign out
export const logout = () => {
  return signOut(auth);
};

// Export auth and database
export { auth, database };

// useDbData hook
export const useDbData = (path) => {
  const [data, setData] = useState();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) {
      setData(undefined);
      return;
    }
    const dbRef = ref(database, path);
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        setData(snapshot.val());
      },
      (error) => {
        setError(error);
      }
    );
    return () => unsubscribe();
  }, [path]);

  return [data, error];
};

// useDbUpdate hook
export const useDbUpdate = (path) => {
  const [result, setResult] = useState();
  const updateData = useCallback(
    (value) => {
      if (!path) return;
      update(ref(database, path), value)
        .then(() => setResult({ status: "success" }))
        .catch((error) => setResult({ status: "error", error }));
    },
    [path]
  );

  return [updateData, result];
};
