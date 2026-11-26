import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { MediaList } from "../../components/MediaList";
import { SearchBar } from '../../components/SearchBar';
import { MOCK_MEDIA } from '../../data/mock';
import { theme } from '../../theme';
import { MediaItem, ViewMode } from '../../types';

// import { fetch } from 'expo/fetch';
import { getLibrary } from '../../api/client';

export default function LibraryScreen() {
  const router = useRouter();
  const { link } = useLocalSearchParams<{ link: string }>();
  const [mode, setMode] = useState<ViewMode>('list');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [year, setYear] = useState<string | undefined>();
  const [language, setLanguage] = useState<string | undefined>();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);


  // const items = useMemo(
  //   () =>
  //     MOCK_MEDIA.filter(
  //       (m) =>
  //         m.title.toLowerCase().includes(query.toLowerCase()) &&
  //         (year === 'All' || String(m.year) === year) &&
  //         (language === 'All' || m.language === language)
  //     ),
  //   [query, year, language]
  // );

  // useEffect(() => {
  //   const t = setTimeout(async () => {
  //     setLoading(true);
  //     try {
  //       setItems(await getLibrary(link, { search, year, language }));
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, 300); // debounce
  //   return () => clearTimeout(t);
  // }, [link, search, year, language]);



  return (
    <SafeAreaView style={styles.container} edges={[]}>

      {/* <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Library Page</Text>
      <Link href="/server">
        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Server</Text>
        </Pressable>
      </Link>
      <StatusBar style="auto" /> 
    </View>*/}
      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <AppButton
            title="Add Server"
            onPress={() => {
              console.log('[Library] Add Server pressed');
              router.push('/server');
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton
            variant="outline"
            title={mode === 'list' ? 'Table View' : 'List View'}
            onPress={() => {
              const next: ViewMode = mode === 'list' ? 'table' : 'list';
              console.log('[Library] view mode ->', next);
              setMode(next);
            }}
          />
        </View>
      </View>
      <SearchBar
        query={query}
        year={year}
        language={language}
        onQueryChange={setQuery}
        onYearChange={setYear}
        onLanguageChange={setLanguage}
      />
      <MediaList items={items} mode={mode} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md },
  actions: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
});