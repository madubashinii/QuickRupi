import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function RepaymentMonitorScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('overdue');

    // Dummy data for transactions
    const overduePayments = [
        { id: 'LN005', name: 'Mark Johnson', due: 'Dec 15, 2024', daysLate: 7, amount: 225000 },
        { id: 'LN007', name: 'David Wilson', due: 'Dec 18, 2024', daysLate: 4, amount: 127500 },
        { id: 'LN009', name: 'Alice Brown', due: 'Dec 19, 2024', daysLate: 3, amount: 180000 },
    ];

    const dueSoonPayments = [
        { id: 'LN001', name: 'Sarah Johnson', due: 'Dec 25, 2024', daysLeft: 3, amount: 105000 },
        { id: 'LN008', name: 'Emma Davis', due: 'Dec 26, 2024', daysLeft: 4, amount: 84000 },
    ];

    const handleContact = (loanId) => {
        Alert.alert('Contact Borrower', `Contacting borrower for loan ${loanId}...`);
    };

    const handleReminder = (loanId) => {
        Alert.alert('Send Reminder', `Reminder sent for loan ${loanId}`);
    };

    const sendBulkReminders = () => {
        Alert.alert('Bulk Reminder', 'Bulk reminders sent successfully!');
    };

    const exportReport = () => {
        Alert.alert('Export Report', 'Repayment report exported successfully!');
    };

    const renderTransaction = (item, type) => {
        return (
            <View
                key={item.id}
                style={[
                    styles.transactionItem,
                    type === 'overdue' ? styles.overdue : styles.dueSoon,
                ]}
            >
                <View style={styles.transactionInfoContainer}>
                    <View
                        style={[
                            styles.transactionIcon,
                            type === 'overdue'
                                ? { backgroundColor: '#fee2e2', color: '#dc2626' }
                                : { backgroundColor: '#fef3c7', color: '#f59e0b' },
                        ]}
                    >
                        <FontAwesome5
                            name={type === 'overdue' ? 'exclamation-triangle' : 'clock'}
                            size={16}
                            color={type === 'overdue' ? '#dc2626' : '#f59e0b'}
                        />
                    </View>
                    <View style={styles.transactionInfo}>
                        <Text style={styles.transactionTitle}>
                            Loan #{item.id} - {item.name}
                        </Text>
                        <Text style={styles.transactionDate}>
                            Due: {item.due}{' '}
                            {type === 'overdue'
                                ? `• ${item.daysLate} days late`
                                : `• ${item.daysLeft} days remaining`}
                        </Text>
                    </View>
                </View>
                <View style={styles.transactionRight}>
                    <Text
                        style={[
                            styles.transactionAmount,
                            type === 'overdue' ? styles.amountNegative : null,
                        ]}
                    >
                        LKR {item.amount.toLocaleString()}
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.actionBtnSmall,
                            type === 'overdue' ? styles.btnContact : styles.btnRemind,
                        ]}
                        onPress={() =>
                            type === 'overdue' ? handleContact(item.id) : handleReminder(item.id)
                        }
                    >
                        <Text style={styles.btnText}>
                            {type === 'overdue' ? 'Contact' : 'Remind'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <FontAwesome5 name="arrow-left" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Repayment Monitor</Text>
                <Text style={styles.headerSubtitle}>Track payment performance</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>92%</Text>
                        <Text style={styles.statLabel}>On-Time Rate</Text>
                    </View>
                    <View style={[styles.statCard, styles.statOverdue]}>
                        <Text style={[styles.statNumber, styles.numberOverdue]}>5</Text>
                        <Text style={styles.statLabel}>Overdue</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>LKR 1.04M</Text>
                        <Text style={styles.statLabel}>Late Payments</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>18</Text>
                        <Text style={styles.statLabel}>Due This Week</Text>
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterTabs}>
                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            activeTab === 'overdue' ? styles.tabActive : null,
                        ]}
                        onPress={() => setActiveTab('overdue')}
                    >
                        <Text style={activeTab === 'overdue' ? styles.tabTextActive : null}>
                            Overdue
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            activeTab === 'dueSoon' ? styles.tabActive : null,
                        ]}
                        onPress={() => setActiveTab('dueSoon')}
                    >
                        <Text style={activeTab === 'dueSoon' ? styles.tabTextActive : null}>
                            Due Soon
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            activeTab === 'all' ? styles.tabActive : null,
                        ]}
                        onPress={() => setActiveTab('all')}
                    >
                        <Text style={activeTab === 'all' ? styles.tabTextActive : null}>
                            All Loans
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Transactions */}
                {activeTab === 'overdue' &&
                    overduePayments.map((item) => renderTransaction(item, 'overdue'))}
                {activeTab === 'dueSoon' &&
                    dueSoonPayments.map((item) => renderTransaction(item, 'dueSoon'))}
                {activeTab === 'all' && (
                    <>
                        {overduePayments.map((item) => renderTransaction(item, 'overdue'))}
                        {dueSoonPayments.map((item) => renderTransaction(item, 'dueSoon'))}
                    </>
                )}

                {/* Action Buttons */}
                <TouchableOpacity style={styles.primaryBtn} onPress={sendBulkReminders}>
                    <FontAwesome5 name="envelope" size={16} color="#fff" />
                    <Text style={styles.primaryBtnText}> Send Reminders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={exportReport}>
                    <FontAwesome5 name="download" size={16} color="#667eea" />
                    <Text style={styles.secondaryBtnText}> Export Report</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1eeeeff' },
    header: { paddingTop: 40, paddingBottom: 20, backgroundColor: '#667eea', alignItems: 'center', position: 'relative' },
    backBtn: { position: 'absolute', left: 20, top: 45, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, color: '#fff', fontWeight: '700' },
    headerSubtitle: { fontSize: 14, color: '#fff', marginTop: 4 },
    content: { padding: 20 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    statCard: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statNumber: { fontSize: 20, fontWeight: '700', color: '#667eea' },
    statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
    statOverdue: { borderWidth: 2, borderColor: '#dc2626' },
    numberOverdue: { color: '#dc2626' },
    filterTabs: { flexDirection: 'row', marginBottom: 16 },
    filterTab: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        marginRight: 10,
    },
    tabActive: { backgroundColor: '#667eea' },
    tabTextActive: { color: '#fff', fontWeight: '700' },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f9fafb',
    },
    transactionInfoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    transactionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionInfo: { flex: 1 },
    transactionTitle: { fontWeight: '600', fontSize: 14 },
    transactionDate: { fontSize: 12, color: '#6b7280' },
    transactionRight: { alignItems: 'flex-end', justifyContent: 'center' },
    transactionAmount: { fontWeight: '700', marginBottom: 6 },
    amountNegative: { color: '#dc2626' },
    actionBtnSmall: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
    btnContact: { backgroundColor: '#dc2626' },
    btnRemind: { backgroundColor: '#f59e0b' },
    btnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#667eea',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
    },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#667eea',
        padding: 16,
        marginTop: 10,
    },
    secondaryBtnText: { color: '#667eea', fontWeight: '700', fontSize: 16, marginLeft: 8 },
    overdue: { borderLeftWidth: 4, borderLeftColor: '#dc2626' },
    dueSoon: { borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
});
