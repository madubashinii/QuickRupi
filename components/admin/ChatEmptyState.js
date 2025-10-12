import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const ChatEmptyState = ({ type = 'conversations' }) => {
  const getContent = () => {
    switch (type) {
      case 'conversations':
        return {
          emoji: '💬',
          title: 'No conversations yet',
          subtitle: 'Start chatting with lenders to see conversations here',
          image: require('../../assets/lender/Ok-pana.png')
        };
      case 'messages':
        return {
          emoji: '👋',
          title: 'Start the conversation',
          subtitle: 'Send your first message to begin chatting',
          image: require('../../assets/lender/Ok-pana.png')
        };
      default:
        return {
          emoji: '📭',
          title: 'Nothing here',
          subtitle: 'No items to display',
          image: require('../../assets/lender/Ok-pana.png')
        };
    }
  };

  const content = getContent();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={content.image} style={styles.image} resizeMode="contain" />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.emoji}>{content.emoji}</Text>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: spacing.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 280,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ChatEmptyState;
