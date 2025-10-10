// services/firestoreService.js
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Lender Functions
export const createLenderDoc = async (uid, payload) => {
  const ref = doc(db, "lenders", uid);
  await setDoc(ref, {
    ...payload,
    userType: "lender",
    kycStatus: "in_progress",
    kycStep: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateLenderDoc = async (uid, payload, step = null) => {
  const ref = doc(db, "lenders", uid);
  const final = { ...payload, updatedAt: serverTimestamp() };
  if (step !== null) final.kycStep = step;
  await updateDoc(ref, final);
};

export const getLenderDoc = async (uid) => {
  const ref = doc(db, "lenders", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

// Borrower Functions
export const createBorrowerDoc = async (uid, payload) => {
  const ref = doc(db, "borrowers", uid);
  await setDoc(ref, {
    ...payload,
    userType: "borrower",
    kycStatus: "in_progress",
    kycStep: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateBorrowerDoc = async (uid, payload, step = null) => {
  const ref = doc(db, "borrowers", uid);
  const final = { ...payload, updatedAt: serverTimestamp() };
  if (step !== null) final.kycStep = step;
  await updateDoc(ref, final);
};

export const getBorrowerDoc = async (uid) => {
  const ref = doc(db, "borrowers", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

// Generic function to get user doc (checks both collections)
export const getUserDoc = async (uid) => {
  // Try lenders first
  let ref = doc(db, "lenders", uid);
  let snap = await getDoc(ref);
  if (snap.exists()) return { ...snap.data(), userType: "lender" };
  
  // Try borrowers second
  ref = doc(db, "borrowers", uid);
  snap = await getDoc(ref);
  if (snap.exists()) return { ...snap.data(), userType: "borrower" };
  
  return null;
}