import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getEpisodes } from '../../db';
import type { LibraryItem } from '../../db';
import { theme } from '../../theme';

const ACCENT = theme.colors.primary;
const pad = (n: number) => String(n).padStart(2, '0');
const SEARCH_THRESHOLD = 20; // show the search box above this many episodes

function matches(ep: LibraryItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (/^\d+$/.test(q)) return ep.episode === Number(q);
  const hay = `${ep.title} s${pad(ep.season ?? 0)}e${pad(ep.episode ?? 0)} season ${ep.season ?? ''} ep ${ep.episode ?? ''}`.toLowerCase();
  return q.split(/\s+/).every((word) => hay.includes(word));
}

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
  const [query, setQuery] = useState('');

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

  const showSearch = episodes.length > SEARCH_THRESHOLD;

  // Group by season (rows come back already sorted by season, episode)
  const sections = useMemo(() => {
    const bySeason = new Map<number, LibraryItem[]>();
    for (const ep of episodes) {
      if (showSearch && !matches(ep, query)) continue;
      const key = ep.season ?? 0;
      bySeason.set(key, [...(bySeason.get(key) ?? []), ep]);
    }
    return [...bySeason.entries()].map(([season, data]) => ({
      title: season ? `Season ${season}` : 'Episodes',
      data,
    }));
  }, [episodes, query, showSearch]);

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
        <>
          {showSearch && (
            <TextInput
              style={styles.search}
              placeholder={`Search ${episodes.length} episodes (e.g. 12 or s02e05)`}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          )}
          <SectionList
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          sections={sections}
          keyExtractor={(ep) => ep.id}
          renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
          renderItem={({ item }) => <EpisodeRow item={item} onPress={() => play(item)} />}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={{ paddingTop: 48, alignItems: 'center' }}>
              <Text style={styles.empty}>
                {query ? 'No episodes match your search.' : 'No episodes found for this series.'}
              </Text>
            </View>
          }
        />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md },
  search: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
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