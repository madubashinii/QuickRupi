import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const ErrorMessage = ({ message, onRetry, showRetry = true }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={24} color={colors.red} />
      <Text style={styles.message}>{message}</Text>
      {showRetry && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightRed,
    padding: spacing.md,
    margin: spacing.sm,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  message: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.red,
    fontWeight: '500'
  },
  retryButton: {
    backgroundColor: colors.red,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm
  },
  retryText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '600'
  }
});

export default ErrorMessage;
