import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>PT</Text>
      </View>
      <Text style={styles.appName}>Picture Tube</Text>
      <AppButton
        title="Library"
        onPress={() => {
          console.log('[Home] Library pressed');
          router.push('/library');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 56, fontWeight: '800' },
  appName: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
});