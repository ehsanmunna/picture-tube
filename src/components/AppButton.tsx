import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function AppButton({ title, onPress, loading = false, disabled = false }: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={[styles.btn, inactive && styles.inactive]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
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
    justifyContent: 'center',
    minHeight: 44,
  },
  inactive: { opacity: 0.6 },
  text: { color: '#fff', fontWeight: '600', fontSize: 16 },
});