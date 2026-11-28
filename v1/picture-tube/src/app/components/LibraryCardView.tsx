import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LibraryCard } from '../../db';
import { theme } from '../../theme';

const ACCENT = '#2563eb'; // swap for your theme's primary color

// No poster art yet, so give each title a stable colour from its text.
function tileColor(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 360;
  return `hsl(${h}, 32%, 28%)`;
}

const cleanTitle = (t: string) => t.replace(/\s*\[\d{4}\]\s*$/, '');

interface Props {
  card: LibraryCard;
  width: number;
  onPress: (card: LibraryCard) => void;
}

function LibraryCardViewBase({ card, width, onPress }: Props) {
  const [focused, setFocused] = useState(false); // D-pad focus on Android TV
  const title = cleanTitle(card.title);
  const detail =
    card.kind === 'series'
      ? `${card.episode_count} ${card.episode_count === 1 ? 'episode' : 'episodes'}`
      : card.year
        ? String(card.year)
        : '';
  const meta = [card.language, detail].filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={() => onPress(card)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${card.kind === 'series' ? 'series' : 'movie'}. ${meta}`}
      style={[styles.card, { width }, focused && styles.focused]}
    >
      <View style={[styles.poster, { backgroundColor: tileColor(title) }]}>
        <Text style={styles.initial}>{title.trim().charAt(0).toUpperCase()}</Text>
        <Text style={styles.kind}>{card.kind === 'series' ? 'Series' : 'Movie'}</Text>
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>
      {!!meta && (
        <Text numberOfLines={1} style={styles.meta}>
          {meta}
        </Text>
      )}
    </Pressable>
  );
}

export const LibraryCardView = memo(LibraryCardViewBase);

const styles = StyleSheet.create({
  card: {
    margin: 6,
    padding: 4,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focused: { borderColor: ACCENT, transform: [{ scale: 1.04 }] },
  poster: {
    aspectRatio: 2 / 3,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: 44, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  kind: { position: 'absolute', left: 8, bottom: 8, fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  title: { marginTop: 6, fontSize: 14, fontWeight: '600', color: theme.colors.text },
  meta: { marginTop: 2, fontSize: 12, color: '#6b7280' },
});
