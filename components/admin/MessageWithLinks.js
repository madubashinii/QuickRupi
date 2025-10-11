import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../../theme';
import LinkPreview from './LinkPreview';

const MessageWithLinks = ({ text, style }) => {
  // Simple URL detection regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <React.Fragment key={index}>
              <Text style={styles.linkText}>{part}</Text>
              <LinkPreview url={part} />
            </React.Fragment>
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
