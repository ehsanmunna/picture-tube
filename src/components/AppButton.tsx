import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
}

export function AppButton({ title, onPress, variant = 'primary' }: Props) {
  const outline = variant === 'outline';
  return (
    <Pressable onPress={onPress} style={[styles.btn, outline && styles.outline]}>
      <Text style={[styles.text, outline && { color: theme.colors.primary }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.primary },
  text: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
