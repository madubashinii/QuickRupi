import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
    EXPO_PUBLIC_API_KEY,
    EXPO_PUBLIC_AUTH_DOMAIN,
    EXPO_PUBLIC_PROJECT_ID,
    EXPO_PUBLIC_STORAGE_BUCKET,
    EXPO_PUBLIC_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_APP_ID
} from "@env";

const firebaseConfig = {
    apiKey: EXPO_PUBLIC_API_KEY,
    authDomain: EXPO_PUBLIC_AUTH_DOMAIN,
    projectId: EXPO_PUBLIC_PROJECT_ID,
    storageBucket: EXPO_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: EXPO_PUBLIC_MESSAGING_SENDER_ID,
    appId: EXPO_PUBLIC_APP_ID,
};

if (firebaseConfig){
    console.log("🔥 Firebase Config:", firebaseConfig);
}
else{
    console.log("🔥 nothing");
}


const app = initializeApp(firebaseConfig);

// Export Firebase services for use throughout the application
export const auth = getAuth(app);  // Authentication service
export const db = getFirestore(app);  // Firestore database service