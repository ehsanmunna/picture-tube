import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface Props {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode; // optional action on the right side
}

export function AppHeader({ title, showBack = true, right }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    console.log('[Header] back pressed');
    if (router.canGoBack()) router.back();
    else router.replace('/'); // fall back to Home
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.side}>
        {showBack && (
          <Pressable onPress={goBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
          </Pressable>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    minHeight: 56,
  },
  side: { width: 40, justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: theme.colors.text },
});