import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getFilterOptions, queryLibrary } from '../../db';
import { LibraryCardView } from '../components/LibraryCardView';
import type { LibraryCard, LibraryType } from '../../db';
import { theme } from '../../theme';

const ACCENT = '#2563eb'; // swap for your theme's primary color
const PAGE_SIZE = 60;
const TARGET_CARD_WIDTH = 150;

const TYPES: { label: string; value?: LibraryType }[] = [
  { label: 'All' },
  { label: 'Movies', value: 'Movies' },
  { label: 'TV series', value: 'TV-Series' },
];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected, focused && styles.chipFocused]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function AddFab({ onPress }: { onPress: () => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel="Add server"
      style={[styles.fab, focused && styles.fabFocused]}
    >
      <Text style={styles.fabIcon}>+</Text>
    </Pressable>
  );
}

export default function LibraryScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [type, setType] = useState<LibraryType | undefined>();
  const [language, setLanguage] = useState<string | undefined>();
  const [year, setYear] = useState<number | undefined>();

  const [items, setItems] = useState<LibraryCard[]>([]);
  const [options, setOptions] = useState<{ languages: string[]; years: number[] }>({ languages: [], years: [] });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const requestId = useRef(0); // ignore responses from outdated filters

  // Wait 300 ms after typing stops before querying
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPage = useCallback(
    async (offset: number) => {
      const id = ++requestId.current;
      setLoading(true);
      setError('');
      try {
        const rows = await queryLibrary({ search: debounced, type, language, year, limit: PAGE_SIZE, offset });
        if (id !== requestId.current) return;
        setItems((prev) => (offset === 0 ? rows : [...prev, ...rows]));
        setHasMore(rows.length === PAGE_SIZE);
      } catch (e: any) {
        if (id === requestId.current) setError(e.message);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [debounced, type, language, year],
  );

  // Runs on focus and whenever a filter changes, so new scans show up when you come back
  useFocusEffect(
    useCallback(() => {
      fetchPage(0);
      getFilterOptions().then(setOptions).catch(() => {});
    }, [fetchPage]),
  );

  const onEndReached = () => {
    if (!loading && hasMore) fetchPage(items.length);
  };

  const onPressCard = (card: LibraryCard) => {
    console.log(card);
    
    if (card.kind === 'series') {
      navigation.navigate('Series', { title: card.title, language: card.language ?? '' });
      return;
    }
    navigation.navigate('Player', {
      id: card.id,
      title: card.title,
      url: card.url ?? '',
      ext: card.url?.split('.').pop() ?? '',
    });
  };

  const columns = Math.max(2, Math.floor(width / TARGET_CARD_WIDTH));
  const cardWidth = (width - theme.spacing.md * 2) / columns - 12;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <TextInput
        style={styles.search}
        placeholder="Search titles"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {TYPES.map((t) => (
            <Chip key={t.label} label={t.label} selected={type === t.value} onPress={() => setType(t.value)} />
          ))}
          {options.languages.length > 1 && (
            <>
              <View style={styles.divider} />
              <Chip label="Any language" selected={!language} onPress={() => setLanguage(undefined)} />
              {options.languages.map((l) => (
                <Chip key={l} label={l} selected={language === l} onPress={() => setLanguage(l)} />
              ))}
            </>
          )}
        </ScrollView>

        {options.years.length > 0 && type !== 'TV-Series' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
            <Chip label="Any year" selected={!year} onPress={() => setYear(undefined)} />
            {options.years.map((y) => (
              <Chip key={y} label={String(y)} selected={year === y} onPress={() => setYear(y)} />
            ))}
          </ScrollView>
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        key={columns} // FlatList can't change numColumns on the fly
        data={items}
        numColumns={columns}
        keyExtractor={(c) => `${c.kind}:${c.id}`}
        renderItem={({ item }) => <LibraryCardView card={item} width={cardWidth} onPress={onPressCard} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.6}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 96 }}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{debounced || type || language || year ? 'No matches' : 'Your library is empty'}</Text>
              <Text style={styles.emptyBody}>
                {debounced || type || language || year
                  ? 'Try a different search or clear a filter.'
                  : 'Open a server, check folders, and press Scan to add them.'}
              </Text>
            </View>
          )
        }
      />
      <AddFab onPress={() => navigation.navigate('Server')} />
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
  filters: { marginBottom: theme.spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  chipSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipFocused: { borderColor: ACCENT, borderWidth: 2 },
  chipText: { fontSize: 14, color: theme.colors.text },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  divider: { width: 1, backgroundColor: theme.colors.border, marginRight: 8 },
  error: { color: 'red', marginVertical: 8 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6, // Android shadow
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fabFocused: { borderColor: '#fff', transform: [{ scale: 1.1 }] },
  fabIcon: { color: '#fff', fontSize: 30, lineHeight: 34, fontWeight: '400' },
  empty: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  emptyBody: { marginTop: 6, fontSize: 14, color: '#6b7280', textAlign: 'center' },
});