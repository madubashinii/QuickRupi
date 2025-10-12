import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const LinkPreview = ({ url }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple URL preview extraction (for MVP)
    // In production, you'd use a proper link preview service
    extractPreview(url);
  }, [url]);

  const extractPreview = async (url) => {
    try {
      setLoading(true);
      
      // Validate URL format first
      let urlObj;
      try {
        urlObj = new URL(url);
      } catch (urlError) {
        // If URL is invalid, try to fix common issues
        const fixedUrl = url.trim();
        urlObj = new URL(fixedUrl);
      }
      
      // MVP: Simple domain extraction
      const domain = urlObj.hostname;
      const title = domain.replace('www.', '');
      
      setPreview({
        title,
        description: `Visit ${domain}`,
        url: url,
        domain
      });
    } catch (error) {
      console.error('Failed to extract preview:', error);
      // Set a fallback preview for invalid URLs
      setPreview({
        title: 'Invalid Link',
        description: 'This link may be malformed',
        url: url,
        domain: 'Invalid URL'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async () => {
    try {
      // Validate URL format
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="link" size={16} color={colors.gray} />
          <Text style={styles.loadingText}>Loading preview...</Text>
        </View>
      </View>
    );
  }

  if (!preview) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.preview}>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {preview.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {preview.description}
          </Text>
          <View style={styles.urlContainer}>
            <Ionicons name="link" size={12} color={colors.blueGreen} />
            <Text style={styles.url} numberOfLines={1}>
              {preview.domain}
            </Text>
          </View>
        </View>
        <View style={styles.arrow}>
          <Ionicons name="chevron-forward" size={16} color={colors.gray} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  preview: {
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginBottom: spacing.xs / 2,
  },
  description: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginBottom: spacing.xs / 2,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  url: {
    fontSize: fontSize.xs,
    color: colors.blueGreen,
    flex: 1,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    padding: spacing.sm,
  },
  loadingText: {
    fontSize: fontSize.xs,
    color: colors.gray,
  },
});

export default LinkPreview;