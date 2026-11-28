import { StyleSheet, Text, View } from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { theme } from '../../theme';
import { AppButton } from '../components/AppButton';

export default function PlayerScreen(router: any) {
  
  const { title, url } = router.route.params;
  
  const player = useVideoPlayer(url ?? null, (p) => {
    p.play();
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  return (
    <View style={styles.container}>
      {url ? (
        <VideoView
          style={styles.video}
          player={player}
          nativeControls
          allowsPictureInPicture
        />
      ) : (
        <View style={[styles.video, styles.empty]}>
          <Text style={styles.placeholder}>Select a media from Library</Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={2}>{title ?? 'Nothing playing'}</Text>

      <View style={styles.controls}>
        <AppButton title="⏮" variant="outline" onPress={() => console.log('[Player] previous')} />
        <AppButton
          title={isPlaying ? 'Pause' : 'Play'}
          onPress={() => {
            console.log('[Player] play/pause');
            isPlaying ? player.pause() : player.play();
          }}
        />
        <AppButton title="⏭" variant="outline" onPress={() => console.log('[Player] next')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md, gap: theme.spacing.lg },
  video: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', borderRadius: theme.radius.md },
  empty: { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
  placeholder: { color: theme.colors.textMuted },
  title: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm },
});