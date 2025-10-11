import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');

export default function RoleSelectionScreen({ navigation }) {
  const handleAdminPress = () => {
    // Navigate to Admin Stack with Admin ID
    navigation.navigate('Admin', { userId: 'ADMIN001' });
  };

  const handleLenderPress = () => {
    // Navigate to Lender Stack
    navigation.navigate('Lender');
  };

  const handleBorrowerPress = () => {
    // Navigate to Borrower Stack
    navigation.navigate('Borrower');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>QuickRupi</Text>
          <Text style={styles.subtitle}>Choose Your Role</Text>
        </View>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          {/* Admin Card */}
          <TouchableOpacity
            style={[styles.card, styles.adminCard]}
            onPress={handleAdminPress}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="shield-crown"
                size={60}
                color={colors.white}
              />
            </View>
            <Text style={styles.cardTitle}>Admin</Text>
            <Text style={styles.cardDescription}>
              Manage users, loans, escrow, and analytics
            </Text>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>ADMIN001</Text>
              </View>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={24} color={colors.white} />
            </View>
          </TouchableOpacity>

          {/* Lender Card */}
          <TouchableOpacity
            style={[styles.card, styles.lenderCard]}
            onPress={handleLenderPress}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="account-cash"
                size={60}
                color={colors.white}
              />
            </View>
            <Text style={styles.cardTitle}>Lender</Text>
            <Text style={styles.cardDescription}>
              Invest, track returns, and manage your portfolio
            </Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={24} color={colors.white} />
            </View>
          </TouchableOpacity>

          {/* Borrower Card */}
          <TouchableOpacity
            style={[styles.card, styles.borrowerCard]}
            onPress={handleBorrowerPress}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="hand-coin"
                size={60}
                color={colors.white}
              />
            </View>
            <Text style={styles.cardTitle}>Borrower</Text>
            <Text style={styles.cardDescription}>
              Apply for loans, manage repayments, and track payments
            </Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={24} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Development Mode</Text>
          <Text style={styles.footerSubtext}>
            Switch between roles for testing
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBlue,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  card: {
    borderRadius: 20,
    padding: 30,
    minHeight: 220,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  adminCard: {
    backgroundColor: colors.midnightBlue,
  },
  lenderCard: {
    backgroundColor: colors.blueGreen,
  },
  borrowerCard: {
    backgroundColor: colors.forestGreen,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 15,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 16,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.forestGreen,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.gray,
  },
});

