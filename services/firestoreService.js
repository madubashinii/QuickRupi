// services/firestoreService.js
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Create a new user doc
export const createUserDoc = async (uid, payload) => {
  const ref = doc(db, "users", uid);
  await setDoc(ref, {
    ...payload,
    kycStatus: "in_progress",
    kycStep: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update existing user doc
export const updateUserDoc = async (uid, payload, step = null) => {
  const ref = doc(db, "users", uid);
  const final = { ...payload, updatedAt: serverTimestamp() };
  if (step !== null) final.kycStep = step;
  await updateDoc(ref, final);
};

// Get user doc
export const getUserDoc = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};