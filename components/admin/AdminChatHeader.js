import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize } from '../../theme';

const AdminChatHeader = ({ lenderId, onBack, onInfo }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="arrow-back" size={24} color={colors.midnightBlue} />
    </TouchableOpacity>

    <View style={styles.center}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color={colors.white} />
      </View>
      <View>
        <Text style={styles.lenderName}>{lenderId}</Text>
        <Text style={styles.lenderRole}>Lender</Text>
      </View>
    </View>

    <TouchableOpacity style={styles.infoButton} onPress={onInfo}>
      <Ionicons name="information-circle-outline" size={24} color={colors.midnightBlue} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blueGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lenderName: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  lenderRole: {
    fontSize: fontSize.xs,
    color: colors.gray,
  },
  infoButton: {
    padding: spacing.xs,
  },
});

export default AdminChatHeader;

