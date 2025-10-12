import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BorrowerBottomNav from "./borrowerNav";
import BorrowerDashboard from "../../screens/borrower/BorrowerDashboard";
import BorrowerRepayment from "../../screens/borrower/repayments";
import BorrowerPayment from "../../screens/borrower/Payment";
import BorrowerSchedule from "../../screens/borrower/PaymentSchedule";
import BorrowerProfile from "../../screens/borrower/profile";
import BorrowerKYC from "../../screens/borrower/kyc";
import BorrowerViewKYC from "../../screens/borrower/viewKYC";
import BorrowerLoan from "../../screens/borrower/Loans";
import BorrowerLoanForm from "../../screens/borrower/LoanRequestForm";
import BorrowerNotifications from "../../screens/borrower/Notifications";
import Chatbot from "../../screens/chatbot";

const Stack = createNativeStackNavigator();

export default function BorrowerStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="BorrowerHome" component={BorrowerBottomNav} />
            <Stack.Screen name="BorrowerDashboard" component={BorrowerDashboard} />
            <Stack.Screen name="BorrowerPayment" component={BorrowerPayment} />
            <Stack.Screen name="BorrowerRepayment" component={BorrowerRepayment} />
            <Stack.Screen name="BorrowerSchedule" component={BorrowerSchedule} />
            <Stack.Screen name="BorrowerLoan" component={BorrowerLoan} />
            <Stack.Screen name="BorrowerLoanForm" component={BorrowerLoanForm} />
            <Stack.Screen name="BorrowerViewKYC" component={BorrowerViewKYC} />
            <Stack.Screen name="BorrowerKYC" component={BorrowerKYC} />
            <Stack.Screen name="BorrowerNotifications" component={BorrowerNotifications} />
            <Stack.Screen name="BorrowerProfile" component={BorrowerProfile} />
            <Stack.Screen name="Chatbot" component={Chatbot} />
        </Stack.Navigator>
    );
}
