import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const { width: screenWidth } = Dimensions.get('window');

// Constants
const ANIMATION_CONFIG = {
  duration: 600,
  springConfig: { tension: 100, friction: 8 },
  delays: [100, 200, 300],
};

const STATS_CONFIG = [
  { icon: 'wallet-outline', color: colors.midnightBlue, key: 'totalPrincipal', label: 'Total Principal', isCurrency: true },
  { icon: 'trending-up-outline', color: colors.blueGreen, key: 'totalInterest', label: 'Total Interest', isCurrency: true },
  { icon: 'analytics-outline', color: colors.forestGreen, key: 'avgAPR', label: 'Average APR', isCurrency: false },
];

// Utility functions
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'LKR 0';
  }
  return `LKR ${Number(amount).toLocaleString()}`;
};
const formatValue = (value, isCurrency) => isCurrency ? formatCurrency(value) : `${value}%`;
const calculateROI = (interest, principal) => ((interest / principal) * 100).toFixed(1);

// Animated Summary Card Component
const SummaryCard = ({ icon, iconColor, label, value, isCurrency = false, delay = 0 }) => {
  const [animatedValue] = useState(new Animated.Value(0));
  const [scaleValue] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: ANIMATION_CONFIG.duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        ...ANIMATION_CONFIG.springConfig,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animatedValue, scaleValue, delay]);

  return (
    <Animated.View 
      style={[
        styles.summaryCard,
        {
          opacity: animatedValue,
          transform: [{ scale: scaleValue }]
        }
      ]}
    >
      <View style={[styles.summaryIconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <View style={styles.summaryContent}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={[styles.summaryValue, { color: iconColor }]}>
          {formatValue(value, isCurrency)}
        </Text>
      </View>
    </Animated.View>
  );
};

// Summary Cards Component
const SummaryCards = ({ summary }) => {
  const firstRowStats = STATS_CONFIG.slice(0, 2);
  const secondRowStats = STATS_CONFIG.slice(2);

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        {firstRowStats.map((config, index) => (
          <SummaryCard
            key={config.key}
            icon={config.icon}
            iconColor={config.color}
            label={config.label}
            value={summary[config.key]}
            isCurrency={config.isCurrency}
            delay={ANIMATION_CONFIG.delays[index]}
          />
        ))}
      </View>
      
      <View style={styles.summaryRow}>
        {secondRowStats.map((config, index) => (
          <SummaryCard
            key={config.key}
            icon={config.icon}
            iconColor={config.color}
            label={config.label}
            value={summary[config.key]}
            isCurrency={config.isCurrency}
            delay={ANIMATION_CONFIG.delays[2]}
          />
        ))}
      </View>
    </View>
  );
};

// Performance Insight Component
const PerformanceInsight = ({ summary }) => {
  const roi = calculateROI(summary.totalInterest, summary.totalPrincipal);
  
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Ionicons name="bulb-outline" size={20} color={colors.forestGreen} />
        <Text style={styles.insightTitle}>Performance Insight</Text>
      </View>
      <Text style={styles.insightText}>
        Your investments achieved a {roi}% return on principal, generating{' '}
        <Text style={styles.insightHighlight}>{roi}%</Text>{' '}
        in returns over the investment period.
      </Text>
    </View>
  );
};

// Stats Modal Component
const StatsModal = ({ visible, onClose, summary }) => {
  const [modalAnimation] = useState(new Animated.Value(0));
  const [overlayAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalAnimation, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, modalAnimation, overlayAnimation]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.menuOverlay,
          {
            opacity: overlayAnimation,
          }
        ]}
      >
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} activeOpacity={1}>
          <Animated.View 
            style={[
              styles.statsModal,
              {
                opacity: modalAnimation,
                transform: [
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                  {
                    translateY: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.menuHeader}>
              <View style={styles.titleContainer}>
                <Ionicons name="analytics" size={24} color={colors.midnightBlue} style={styles.titleIcon} />
                <Text style={styles.menuTitle}>Investment Statistics</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={colors.gray} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.statsContent}>
              <SummaryCards summary={summary} />
              <PerformanceInsight summary={summary} />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsModal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    margin: spacing.lg,
    width: screenWidth - spacing.xl * 2,
    maxWidth: 400,
    elevation: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: colors.babyBlue,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.babyBlue,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: spacing.sm,
  },
  menuTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  closeButton: {
    padding: spacing.xs,
  },
  statsContent: {
    gap: spacing.lg,
  },
  summaryContainer: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.babyBlue,
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.forestGreen,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insightTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginLeft: spacing.xs,
  },
  insightText: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    lineHeight: 20,
  },
  insightHighlight: {
    fontWeight: 'bold',
    color: colors.forestGreen,
  },
});

export default StatsModal;
