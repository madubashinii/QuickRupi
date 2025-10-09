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
            <Stack.Screen name="AdminHome" component={AdminBottomNav} />
            <Stack.Screen name="UsersManagement" component={UsersManagementScreen} />
            <Stack.Screen name="EscrowApproval" component={EscrowApprovalScreen} />
            <Stack.Screen name="AnalyticsScreen" component={AnalyticsScreen} />
            <Stack.Screen name="KYCApproval" component={KYCApprovalScreen} />
        </Stack.Navigator>
    );
}