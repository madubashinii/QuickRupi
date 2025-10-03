import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

// Empty State Component (for Ongoing investments)
export const EmptyState = ({ onBrowsePress }) => (
  <View style={styles.emptyState}>
    <Ionicons name="document-text-outline" size={64} color={colors.gray} />
    <Text style={styles.emptyStateTitle}>No Ongoing Investments</Text>
    <Text style={styles.emptyStateSubtitle}>
      You don't have any active investments at the moment
    </Text>
    <TouchableOpacity style={styles.browseButton} onPress={onBrowsePress}>
      <Text style={styles.browseButtonText}>Browse Loan Requests</Text>
    </TouchableOpacity>
  </View>
);

// Browse Empty State Component (for Browse section)
export const BrowseEmptyState = ({ onResetFilters }) => (
  <View style={styles.browseEmptyState}>
    <Ionicons name="search-outline" size={64} color={colors.gray} />
    <Text style={styles.emptyStateTitle}>No Requests Match Filters</Text>
    <Text style={styles.emptyStateSubtitle}>
      Try adjusting your filters or reset to see all available loan requests
    </Text>
    <TouchableOpacity style={styles.resetFiltersButton} onPress={onResetFilters}>
      <Text style={styles.resetFiltersButtonText}>Reset Filters</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  // Base Empty State Styles
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: fontSize.base,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  
  // Browse Button Styles
  browseButton: {
    backgroundColor: colors.midnightBlue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  browseButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: '600',
  },
  
  // Browse Empty State Specific Styles
  browseEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  resetFiltersButton: {
    backgroundColor: colors.midnightBlue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  resetFiltersButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: '600',
  },
});
