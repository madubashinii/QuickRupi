import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

// Ongoing Header Bar Component
export const OngoingHeaderBar = ({ onFilterPress, onSortPress }) => (
  <View style={styles.ongoingHeaderBar}>
    <TouchableOpacity style={styles.headerButton} onPress={onFilterPress}>
      <Ionicons name="filter" size={20} color={colors.midnightBlue} />
      <Text style={styles.headerButtonText}>Filter</Text>
    </TouchableOpacity>
    
    <TouchableOpacity style={styles.headerButton} onPress={onSortPress}>
      <Ionicons name="swap-vertical" size={20} color={colors.midnightBlue} />
      <Text style={styles.headerButtonText}>Sort</Text>
    </TouchableOpacity>
  </View>
);

// Reusable Header Bar Component
export const HeaderBar = ({ onActionPress, icon, label, style }) => (
  <View style={[styles.headerBar, style]}>
    <TouchableOpacity style={styles.headerButton} onPress={onActionPress}>
      <Ionicons name={icon} size={20} color={colors.midnightBlue} />
      <Text style={styles.headerButtonText}>{label}</Text>
    </TouchableOpacity>
  </View>
);

// Browse Header Bar Component
export const BrowseHeaderBar = ({ onSortPress }) => (
  <HeaderBar
    onActionPress={onSortPress}
    icon="swap-vertical"
    label="Sort"
    style={styles.browseHeaderBar}
  />
);

// Finished Header Bar Component
export const FinishedHeaderBar = ({ onStatsPress }) => (
  <HeaderBar
    onActionPress={onStatsPress}
    icon="analytics"
    label="Stats"
    style={styles.finishedHeaderBar}
  />
);

const styles = StyleSheet.create({
  ongoingHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.babyBlue,
  },
  headerButtonText: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  browseHeaderBar: {},
  finishedHeaderBar: {},
});
