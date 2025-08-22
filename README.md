# MicroLoan Platform

**Tech Stack:** React Native + Expo (JavaScript) + Firebase


---

# Team Instructions

## 1. Clone the Repository
```bash
git clone <repo-url>
cd MICROLOAN_PLATFORM
```

# Frontend Setup (React Native + Expo)

## 2. Install Dependencies
```bash
cd frontend
npm install
```
This will install all required packages locally.

## 3. Run the App
```bash
npx expo start -c
```
- Scan the QR code with **Expo Go** on your mobile device.  
- The default Expo template screen will appear.  


## 4. Folder Overview

- **assets/images/** → Add app icons, logos, images  
- **components/** → Reusable UI components (buttons, inputs, cards)  
- **navigation/** → Navigation setup (stack/tab navigator)  
- **screens/** → Add your Main app screens here (Welcome, Login, Dashboard, etc.)
- **context/** → Authentication state (JWT, user role , wallet)
- **services/firebase.js** → Firebase configuration and functions (Auth, Firestore, Storage, Cloud Functions)
- **utils/** → Helper functions (validation, formatting, etc.)   
- **package.json / package-lock.json** → Dependencies  



# Firebase Setup

## 1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)  
2. Click **Add Project** → follow the steps → skip Google Analytics if not needed.  

---

## 2 Enable Authentication
1. Go to **Authentication → Get Started**  
2. Enable **Email/Password** sign-in method.  

---

## 3 Enable Firestore Database
1. Go to **Build → Firestore Database**  
2. Click **Create Database** → Start in **Test Mode** → choose your region (e.g., `asia-south1`)  
3. Your Firestore database is ready.  

---

## 4 Install Firebase and Dotenv
```bash
npm install firebase
npm install react-native-dotenv

```
---

## 5 Add `.env` file (Project Root)
```env
EXPO_PUBLIC_API_KEY=your_api_key
EXPO_PUBLIC_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_PROJECT_ID=your_project_id
EXPO_PUBLIC_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_APP_ID=your_app_id

```

## 6 Firebase Config (`services/firebaseConfig.js`)
```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

```


