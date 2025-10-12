import React from 'react';
import { Text, StyleSheet, Linking, Alert } from 'react-native';
import { colors, fontSize } from '../../theme';

const MessageWithLinks = ({ text, style, linkColor = colors.blueGreen }) => {
  // Simple URL detection regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  const handleLinkPress = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Invalid Link',
          'This link cannot be opened. The URL may be malformed or unsupported.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
      Alert.alert(
        'Error Opening Link',
        'Unable to open this link. Please check if the URL is correct.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <Text 
              key={index} 
              style={[styles.linkText, { color: linkColor }]}
              onPress={() => handleLinkPress(part)}
            >
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  linkText: {
    color: colors.blueGreen,
    textDecorationLine: 'underline',
  },
});

export default MessageWithLinks;
