import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { Dropdown } from './Dropdown';
import { LANGUAGES, YEARS } from '../data/mock';
import { theme } from '../theme';

interface Props {
  query: string;
  year: string | undefined;
  language: string | undefined;
  onQueryChange: (v: string) => void;
  onYearChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
}

export function SearchBar(p: Props) {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        placeholder="Search media..."
        value={p.query}
        onChangeText={(t) => {
          console.log('[Search] query', t);
          p.onQueryChange(t);
        }}
      />
      <View style={styles.row}>
        <Dropdown label="Year" value={p.year} options={YEARS} onChange={p.onYearChange} />
        <View style={{ width: theme.spacing.sm }} />
        <Dropdown label="Language" value={p.language} options={LANGUAGES} onChange={p.onLanguageChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: { flexDirection: 'row' },
});
