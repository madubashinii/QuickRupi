import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import ConversationCard from './ConversationCard';
import ChatEmptyState from './ChatEmptyState';

const SearchBar = ({ value, onChangeText }) => (
  <View style={styles.searchContainer}>
    <Ionicons name="search" size={20} color={colors.gray} />
    <TextInput
      style={styles.searchInput}
      value={value}
      onChangeText={onChangeText}
      placeholder="Search conversations..."
      placeholderTextColor={colors.gray}
    />
  </View>
);

const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.midnightBlue} />
    <Text style={styles.loadingText}>Loading conversations...</Text>
  </View>
);

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Ionicons name="chatbubbles-outline" size={64} color={colors.gray} />
    <Text style={styles.emptyTitle}>No Conversations</Text>
    <Text style={styles.emptySubtitle}>No conversations found</Text>
  </View>
);

const ConversationsList = ({ conversations, onSelectConversation, selectedId, isLoading, unreadCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.participants?.lenderId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <LoadingState />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Conversations</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.toolbarText}>
          {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
        </Text>
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {filteredConversations.length === 0 ? (
        <EmptyState />
      ) : (
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.midnightBlue,
    paddingTop: 80,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  badge: {
    backgroundColor: colors.red,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  toolbarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.midnightBlue,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
  },
});

export default ConversationsList;

