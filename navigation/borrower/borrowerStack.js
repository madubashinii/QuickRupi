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


const Stack = createNativeStackNavigator();

export default function borrowerStack() {
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
            <Stack.Screen name="BorrowerProfile" component={BorrowerProfile} />
        </Stack.Navigator>
    );
}
