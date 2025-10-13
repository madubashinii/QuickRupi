import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize } from '../../theme';
import { getUserDoc } from '../../services/firestoreService';

const AdminChatHeader = ({ lenderId, onBack, onInfo }) => {
  const [lenderName, setLenderName] = useState(lenderId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLenderName = async () => {
      if (!lenderId) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getUserDoc(lenderId);
        if (userData) {
          // Combine firstName and lastName
          const fullName = userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}`.trim()
            : (userData.firstName || userData.lastName || '').trim();
          
          // Use nameWithInitials, fullName, name, email, or fallback to lenderId
          setLenderName(userData.nameWithInitials || fullName || userData.name || userData.email?.split('@')[0] || lenderId);
        } else {
          setLenderName(lenderId);
        }
      } catch (error) {
        console.error(`Error fetching lender ${lenderId}:`, error);
        setLenderName(lenderId);
      } finally {
        setLoading(false);
      }
    };

    fetchLenderName();
  }, [lenderId]);

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.midnightBlue} />
      </TouchableOpacity>

      <View style={styles.center}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color={colors.white} />
        </View>
        <View style={styles.textContainer}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.midnightBlue} />
          ) : (
            <>
              <Text style={styles.lenderName} numberOfLines={1}>{lenderName}</Text>
              <Text style={styles.lenderRole}>Lender</Text>
            </>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.infoButton} onPress={onInfo}>
        <Ionicons name="information-circle-outline" size={24} color={colors.midnightBlue} />
      </TouchableOpacity>
    </View>
  );
};

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
  textContainer: {
    flex: 1,
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

