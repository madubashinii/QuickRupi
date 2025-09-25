import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminDashboardScreen from "../../screens/admin/AdminDashboardScreen";
import UsersManagementScreen from "../../screens/admin/UsersManagementScreen";
import EscrowApprovalScreen from "../../screens/admin/EscrowApprovalScreen";
import AnalyticsScreen from "../../screens/admin/AnalyticsScreen";
import RepaymentMonitorScreen from "../../screens/admin/RepaymentMonitoringScreen";

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DashboardMain" component={AdminDashboardScreen} />
            <Stack.Screen name="UsersManagement" component={UsersManagementScreen} />
            <Stack.Screen name="EscrowApproval" component={EscrowApprovalScreen} />
            <Stack.Screen name="AnalyticsScreen" component={AnalyticsScreen} />
            <Stack.Screen name="Repayments" component={RepaymentMonitorScreen} />
        </Stack.Navigator>
    );
}
