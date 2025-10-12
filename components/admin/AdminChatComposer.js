import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const MAX_LENGTH = 500;

const AdminChatComposer = ({ value, onChangeText, onSend, isSending }) => (
  <View style={styles.container}>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Type a message..."
        placeholderTextColor={colors.gray}
        multiline
        maxLength={MAX_LENGTH}
      />
      <TouchableOpacity
        style={[styles.sendButton, (!value.trim() || isSending) && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!value.trim() || isSending}
      >
        {isSending ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Ionicons name="send" size={20} color={colors.white} />
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    maxHeight: 80,
    minHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.deepForestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.5,
  },
});

export default AdminChatComposer;

