import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

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
import LenderTabs from "../navigation/LenderTabs";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [kycCompleted, setKycCompleted] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setRole(userData.role || "borrower");
                        setKycCompleted(userData.kycCompleted || false);
                    } else {
                        setRole("borrower");
                    }
                } catch (err) {
                    console.error("Error fetching user role:", err);
                    setRole("borrower");
                }
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
                        <Stack.Screen name="LenderTabs" component={LenderTabs} />
                    ) : (
                        <Stack.Screen name="KycLenderStack" component={KycLenderStack} />
                    )
                ) : (
                    // borrower
                    kycCompleted ? (
                        <Stack.Screen name="BorrowerDashboard" component={LenderTabs} />
                    ) : (
                        <Stack.Screen name="KycBorrowerStack" component={KycBorrowerStack} />
                    )
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
