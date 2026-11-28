import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getEpisodes } from '../db';
import type { LibraryItem } from '../db';
import { theme } from '../theme';

const ACCENT = '#2563eb'; // swap for your theme's primary color
const pad = (n: number) => String(n).padStart(2, '0');

function EpisodeRow({ item, onPress }: { item: LibraryItem; onPress: () => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      style={[styles.row, focused && styles.rowFocused]}
    >
      <Text style={styles.rowTitle}>{item.title}</Text>
      {!!item.ext && <Text style={styles.rowExt}>{item.ext.toUpperCase()}</Text>}
    </Pressable>
  );
}

export default function SeriesScreen() {
  const navigation = useNavigation<any>();
  const { title, language } = useRoute<any>().params as { title: string; language?: string };

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  const [episodes, setEpisodes] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getEpisodes(title, language || null)
      .then((rows) => !cancelled && setEpisodes(rows))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [title, language]);

  // Group by season (rows come back already sorted by season, episode)
  const sections = useMemo(() => {
    const bySeason = new Map<number, LibraryItem[]>();
    for (const ep of episodes) {
      const key = ep.season ?? 0;
      bySeason.set(key, [...(bySeason.get(key) ?? []), ep]);
    }
    return [...bySeason.entries()].map(([season, data]) => ({
      title: season ? `Season ${season}` : 'Episodes',
      data,
    }));
  }, [episodes]);

  const play = (ep: LibraryItem) => {
    const code = `${ep.season ? `S${pad(ep.season)}` : ''}${ep.episode ? `E${pad(ep.episode)}` : ''}`;
    navigation.navigate('Player', {
      id: ep.id,
      title: code ? `${title} ${code}` : `${title} ${ep.title}`,
      url: ep.url,
      ext: ep.ext ?? '',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(ep) => ep.id}
          renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
          renderItem={({ item }) => <EpisodeRow item={item} onPress={() => play(item)} />}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={{ paddingTop: 48, alignItems: 'center' }}>
              <Text style={styles.empty}>No episodes found for this series.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md },
  section: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginTop: theme.spacing.md, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomColor: theme.colors.border,
  },
  rowFocused: { borderColor: ACCENT },
  rowTitle: { fontSize: 16, color: theme.colors.text },
  rowExt: { fontSize: 12, color: '#6b7280' },
  error: { color: 'red', marginTop: 16 },
  empty: { fontSize: 14, color: '#6b7280' },
});