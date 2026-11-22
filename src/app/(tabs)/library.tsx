import { View, Text, StyleSheet, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, router, useRouter } from 'expo-router';
import { theme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { useMemo, useState } from 'react';
import { MOCK_MEDIA } from '../../data/mock';
import { ViewMode } from '../../types';
import { SearchBar } from '../../components/SearchBar';
import { MediaList } from "../../components/MediaList";

export default function LibraryScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>('list');
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('All');
  const [language, setLanguage] = useState('All');

  const items = useMemo(
    () =>
      MOCK_MEDIA.filter(
        (m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) &&
          (year === 'All' || String(m.year) === year) &&
          (language === 'All' || m.language === language)
      ),
    [query, year, language]
  );
  return (
    <SafeAreaView style={styles.container} edges={['top']}>

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