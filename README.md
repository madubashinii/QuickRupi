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
- **App.js** → Mobile app entry point (Expo starter file) 
