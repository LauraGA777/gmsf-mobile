import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../constants/layout';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: {
    icon: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
  };
  style?: object;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {(title || subtitle || action) && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {action && (
            <Pressable
              style={styles.actionButton}
              onPress={action.onPress}
              android_ripple={{ color: Colors.divider }}
            >
              <MaterialIcons name={action.icon} size={20} color={Colors.textSecondary} />
            </Pressable>
          )}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
    marginVertical: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  actionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  content: {
    padding: Spacing.md,
    paddingTop: 0,
  },
});
