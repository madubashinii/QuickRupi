import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, Alert } from "react-native";
import { signOut } from "firebase/auth";

import SplashScreen from "../screens/SplashScreen";
import Onboarding1 from "../screens/onboarding/Onboarding1";
import Onboarding2 from "../screens/onboarding/Onboarding2";
import Onboarding3 from "../screens/onboarding/Onboarding3";

import AuthStack from "./AuthStack";
import KycBorrowerStack from "./KycBorrowerStack";
import KycLenderStack from "./KycLenderStack";

import { auth, db } from "../services/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import AdminStack from "../navigation/admin/AdminStack";
import LenderStack from "../navigation/LenderStack";
import BorrowerStack from "../navigation/borrower/borrowerStack";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [kycCompleted, setKycCompleted] = useState(false);
    const [kycStatus, setKycStatus] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const userRole = userData.role || "borrower";
                        const userKycStatus = userData.kycStatus || null;
                        
                        // Check if account is pending or rejected BEFORE setting states
                        if ((userRole === "lender" || userRole === "borrower") && 
                            (userKycStatus === "pending" || userKycStatus === "rejected")) {
                            await signOut(auth);
                            setUser(null);
                            setRole(null);
                            setKycCompleted(false);
                            setKycStatus(null);
                            setLoading(false);
                            
                            const title = userKycStatus === "rejected" ? "Account Rejected" : "Account Pending Approval";
                            const message = userKycStatus === "rejected" 
                                ? "Your account application has been rejected. Please contact support for more information."
                                : "Your account is awaiting admin approval. Please try again later.";
                            
                            Alert.alert(title, message, [{ text: "OK" }]);
                            return;
                        }
                        
                        // If approved or different role, set states normally
                        setUser(currentUser);
                        setRole(userRole);
                        setKycCompleted(userData.kycCompleted || false);
                        setKycStatus(userKycStatus);
                    } else {
                        setUser(currentUser);
                        setRole("borrower");
                    }
                } catch (err) {
                    console.error("Error fetching user role:", err);
                    setUser(currentUser);
                    setRole("borrower");
                }
            } else {
                setUser(null);
                setRole(null);
                setKycCompleted(false);
                setKycStatus(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#004B46" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <>
                        <Stack.Screen name="SplashScreen" component={SplashScreen} />
                        <Stack.Screen name="Onboarding1" component={Onboarding1} />
                        <Stack.Screen name="Onboarding2" component={Onboarding2} />
                        <Stack.Screen name="Onboarding3" component={Onboarding3} />
                        <Stack.Screen name="AuthStack" component={AuthStack} />
                    </>
                ) : role === "admin" ? (
                    <Stack.Screen name="AdminStack" component={AdminStack} />
                ) : role === "lender" ? (
                    kycCompleted ? (
                        <Stack.Screen name="LenderStack" component={LenderStack} />
                    ) : (
                        <Stack.Screen name="KycLenderStack" component={KycLenderStack} />
                    )
                ) : (
                    // borrower
                    kycCompleted ? (
                        <Stack.Screen name="BorrowerStack" component={BorrowerStack} />
                    ) : (
                        <Stack.Screen name="KycBorrowerStack" component={KycBorrowerStack} />
                    )
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
