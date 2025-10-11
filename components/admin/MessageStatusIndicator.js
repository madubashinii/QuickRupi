import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

const MessageStatusIndicator = ({ status, isOwnMessage }) => {
  if (!isOwnMessage) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <Ionicons name="checkmark" size={12} color={colors.gray} />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={12} color={colors.gray} />;
      case 'read':
        return <Ionicons name="checkmark-done" size={12} color={colors.blueGreen} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {getStatusIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: spacing.xs,
  },
});

export default MessageStatusIndicator;
