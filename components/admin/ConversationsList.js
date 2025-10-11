import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import ConversationCard from './ConversationCard';
import ChatEmptyState from './ChatEmptyState';

const BG = '#f5f7fa';
const HEADER_BG = '#ffffff';
const TEXT_PRIMARY = '#1e293b';
const TEXT_SECONDARY = '#64748b';
const ACCENT = '#3b82f6';
const SEARCH_BG = '#ffffff';

const SearchBar = ({ value, onChangeText }) => (
  <View style={styles.searchContainer}>
    <Ionicons name="search" size={20} color={TEXT_SECONDARY} />
    <TextInput
      style={styles.searchInput}
      value={value}
      onChangeText={onChangeText}
      placeholder="Search conversations..."
      placeholderTextColor={TEXT_SECONDARY}
    />
  </View>
);

const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={ACCENT} />
    <Text style={styles.loadingText}>Loading conversations...</Text>
  </View>
);

const ConversationsList = ({ conversations, onSelectConversation, selectedId, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.participants?.lenderId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <LoadingState />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Conversations</Text>
          <Text style={styles.subtitle}>Manage lender messages</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{conversations.length}</Text>
        </View>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationCard
            conversation={item}
            onPress={() => onSelectConversation(item)}
            isActive={item.id === selectedId}
          />
        )}
        ListEmptyComponent={() => <ChatEmptyState type="conversations" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: HEADER_BG,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  badge: {
    backgroundColor: ACCENT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SEARCH_BG,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 12,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
});

export default ConversationsList;

