import React from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { MediaItem, ViewMode } from '../types';
import { theme } from '../theme';

interface Props {
  items: MediaItem[];
  mode: ViewMode;
}

export function MediaList({ items, mode }: Props) {
  const onOpen = (item: MediaItem) => console.log('[Media] open', item.id, item.title);

  if (mode === 'table') {
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.cell, { flex: 3 }, styles.headText]}>Title</Text>
          <Text style={[styles.cell, styles.headText]}>Year</Text>
          <Text style={[styles.cell, { flex: 2 }, styles.headText]}>Language</Text>
          <Text style={[styles.cell, styles.headText]}>Size</Text>
        </View>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => onOpen(item)}>
              <Text style={[styles.cell, { flex: 3 }]}>{item.title}</Text>
              <Text style={styles.cell}>{item.year}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{item.language}</Text>
              <Text style={styles.cell}>{item.size}</Text>
            </Pressable>
          )}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => onOpen(item)}>
          <View style={styles.thumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.year} · {item.language} · {item.size}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  thumb: { width: 56, height: 56, borderRadius: theme.radius.sm, backgroundColor: theme.colors.border },
  title: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  meta: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  header: { backgroundColor: theme.colors.surface },
  cell: { flex: 1, paddingHorizontal: 6, fontSize: 14, color: theme.colors.text },
  headText: { fontWeight: '700' },
});
