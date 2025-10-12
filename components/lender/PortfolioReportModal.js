import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { calculatePortfolioMetrics, exportPortfolioReportPDF } from '../../services/lender/portfolioReportService';

const PortfolioReportModal = ({ visible, onClose, userId }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [error, setError] = useState(null);

  // Calculate portfolio metrics when modal opens
  useEffect(() => {
    if (visible && userId) {
      loadPortfolioMetrics();
    }
  }, [visible, userId]);

  const loadPortfolioMetrics = async () => {
    setIsCalculating(true);
    setError(null);
    try {
      const data = await calculatePortfolioMetrics(userId);
      setPortfolioData(data);
    } catch (err) {
      console.error('Failed to calculate portfolio metrics:', err);
      setError('Failed to load portfolio report. Please try again.');
      setPortfolioData(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportPortfolioReportPDF(userId);
      Alert.alert(
        'Success',
        'Portfolio report has been exported successfully!',
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Failed to export portfolio report:', err);
      Alert.alert(
        'Export Failed',
        'Unable to export portfolio report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setPortfolioData(null);
      setError(null);
      onClose();
    }
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatCompact = (amount) => {
    if (amount >= 1000000) return `LKR ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `LKR ${(amount / 1000).toFixed(1)}K`;
    return `LKR ${amount.toLocaleString()}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Portfolio Report</Text>
              <Text style={styles.subtitle}>Investment Overview</Text>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={isExporting}>
              <Ionicons name="close" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {isCalculating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.blueGreen} />
                <Text style={styles.loadingText}>Calculating portfolio metrics...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.red} />
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorSubtext}>Unable to load portfolio data</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadPortfolioMetrics}>
                  <Ionicons name="refresh-outline" size={16} color={colors.white} />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : portfolioData ? (
              <>
                {/* Main Portfolio Value */}
                <View style={styles.mainValueCard}>
                  <Text style={styles.mainLabel}>Total Portfolio Value</Text>
                  <Text style={styles.mainValue}>{formatCurrency(portfolioData.portfolioValue)}</Text>
                  <View style={styles.mainBreakdown}>
                    <View style={styles.breakdownItem}>
                      <Ionicons name="wallet-outline" size={12} color={colors.blueGreen} />
                      <Text style={styles.breakdownText}>Wallet: {formatCompact(portfolioData.walletBalance)}</Text>
                    </View>
                    <View style={styles.breakdownItem}>
                      <Ionicons name="pulse-outline" size={12} color={colors.midnightBlue} />
                      <Text style={styles.breakdownText}>Invested: {formatCompact(portfolioData.activeLoans.totalInvestment)}</Text>
                    </View>
                  </View>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryCard}>
                    <Ionicons name="pulse-outline" size={20} color={colors.midnightBlue} />
                    <Text style={styles.cardLabel}>Active Loans</Text>
                    <Text style={styles.cardValue}>{portfolioData.activeLoans.count}</Text>
                    <Text style={styles.cardSubtext}>{formatCompact(portfolioData.activeLoans.totalInvestment)}</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.blueGreen} />
                    <Text style={styles.cardLabel}>Completed</Text>
                    <Text style={styles.cardValue}>{portfolioData.completedLoans.count}</Text>
                    <Text style={styles.cardSubtext}>{formatCompact(portfolioData.completedLoans.totalInterest)} earned</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Ionicons name="trending-up-outline" size={20} color={colors.blueGreen} />
                    <Text style={styles.cardLabel}>Overall ROI</Text>
                    <Text style={styles.cardValue}>{portfolioData.overallROI}%</Text>
                    <Text style={styles.cardSubtext}>Avg: {portfolioData.completedLoans.avgROI}%</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Ionicons name="bar-chart-outline" size={20} color={colors.midnightBlue} />
                    <Text style={styles.cardLabel}>Success Rate</Text>
                    <Text style={styles.cardValue}>{portfolioData.successRate}%</Text>
                    <Text style={styles.cardSubtext}>{portfolioData.completedLoans.count} of {portfolioData.activeLoans.count + portfolioData.completedLoans.count}</Text>
                  </View>
                </View>

                {/* Expected Returns Banner */}
                {portfolioData.activeLoans.count > 0 && (
                  <View style={styles.expectedBanner}>
                    <View style={styles.bannerIcon}>
                      <Ionicons name="hourglass-outline" size={16} color={colors.white} />
                    </View>
                    <View style={styles.bannerContent}>
                      <Text style={styles.bannerLabel}>Expected Returns from Active Loans</Text>
                      <Text style={styles.bannerValue}>
                        {formatCurrency(portfolioData.activeLoans.expectedInterest)} interest
                      </Text>
                    </View>
                  </View>
                )}

                {/* Note */}
                <View style={styles.note}>
                  <Ionicons name="document-text-outline" size={14} color={colors.blueGreen} />
                  <Text style={styles.noteText}>
                    PDF report includes detailed breakdowns of all active and completed loans with full transaction history.
                  </Text>
                </View>

                {/* Export Button */}
                <TouchableOpacity
                  style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
                  onPress={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <ActivityIndicator size="small" color={colors.white} />
                      <Text style={styles.exportButtonText}>Generating PDF...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="document-text-outline" size={20} color={colors.white} />
                      <Text style={styles.exportButtonText}>Export Full Report as PDF</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginTop: 2,
  },
  content: {
    maxHeight: 500,
  },
  contentContainer: {
    padding: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.red,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: fontSize.xs,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.blueGreen,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  mainValueCard: {
    backgroundColor: colors.midnightBlue,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  mainLabel: {
    fontSize: fontSize.xs,
    color: colors.white,
    opacity: 0.8,
  },
  mainValue: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.white,
    marginVertical: spacing.xs,
  },
  mainBreakdown: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breakdownText: {
    fontSize: fontSize.xs,
    color: colors.white,
    opacity: 0.9,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.babyBlue,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginTop: 2,
  },
  cardSubtext: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginTop: 2,
  },
  expectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueGreen,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  bannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerLabel: {
    fontSize: fontSize.xs,
    color: colors.white,
    opacity: 0.9,
  },
  bannerValue: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 2,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.babyBlue,
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  noteText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.gray,
    lineHeight: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueGreen,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

export default PortfolioReportModal;

