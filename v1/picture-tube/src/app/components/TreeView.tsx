import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { ApiFile, DirNode } from '../../types';
import { getCheckState } from '../../utils/tree';

interface Props {
  nodes: DirNode[];
  onToggleCheck: (node: DirNode) => void;
  onPressFolder: (node: DirNode) => void;
  onPressFile?: (file: ApiFile) => void;
  depth?: number;
}

const VIDEO_EXT = ['mp4', 'mkv', 'avi', 'mov', 'webm', 'ts', 'm4v'];

function FileRow({
  file,
  depth,
  onPress,
}: {
  file: ApiFile;
  depth: number;
  onPress?: (file: ApiFile) => void;
}) {
  const isVideo = VIDEO_EXT.includes(file.ext?.toLowerCase());
  return (
    <Pressable
      onPress={() => onPress?.(file)}
      style={({ pressed }) => [
        styles.fileRow,
        // line up with the folder icons at this level (checkbox column is 44 wide)
        { paddingLeft: depth * 24 + 44 },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={isVideo ? 'videocam' : 'document-outline'}
        size={20}
        color={theme.colors.textMuted}
      />
      <Text style={styles.name} numberOfLines={1}>{file.name}</Text>
    </Pressable>
  );
}

function Checkbox({ state, onPress }: { state: ReturnType<typeof getCheckState>; onPress: () => void }) {
  const on = state !== 'unchecked';
  return (
    <Pressable onPress={onPress} style={styles.checkArea} hitSlop={4}>
      <View style={[styles.box, on && styles.boxOn]}>
        {state === 'checked' && <Ionicons name="checkmark" size={18} color="#fff" />}
        {state === 'partial' && <Ionicons name="remove" size={18} color="#fff" />}
      </View>
    </Pressable>
  );
}



export function TreeView({ nodes, onToggleCheck, onPressFolder, onPressFile, depth = 0 }: Props) {
  return (
    <View>
      {nodes.map((node) => (
        <View key={node.id}>
          <View style={[styles.row, { paddingLeft: depth * 24 }]}>
            <Checkbox state={getCheckState(node)} onPress={() => onToggleCheck(node)} />

            <Pressable
              style={({ pressed }) => [styles.folder, pressed && styles.pressed]}
              onPress={() => onPressFolder(node)}
            >
              <Ionicons
                name={node.expanded ? 'folder-open' : 'folder'}
                size={22}
                color={theme.colors.primary}
              />
              <Text style={styles.name} numberOfLines={1}>{node.name}</Text>
              {node.loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Ionicons
                  name={node.expanded ? 'chevron-down' : 'chevron-forward'}
                  size={18}
                  color={theme.colors.textMuted}
                />
              )}
            </Pressable>
          </View>

          {node.expanded && (
            <>
              {node.folders && node.folders.length > 0 && (
                <TreeView
                  nodes={node.folders}
                  onToggleCheck={onToggleCheck}
                  onPressFolder={onPressFolder}
                  onPressFile={onPressFile}
                  depth={depth + 1}
                />
              )}

              {node.files?.map((file) => (
                <FileRow key={file.id} file={file} depth={depth + 1} onPress={onPressFile} />
              ))}

              {node.loaded &&
                !node.folders?.length &&
                !node.files?.length && (
                  <Text style={[styles.empty, { paddingLeft: (depth + 1) * 24 + 44 }]}>Empty</Text>
                )}
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  checkArea: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  folder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minHeight: 48,
    paddingRight: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  pressed: { backgroundColor: theme.colors.surface },
  name: { flex: 1, fontSize: 16, color: theme.colors.text },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minHeight: 44,
    paddingRight: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  empty: { color: theme.colors.textMuted, fontSize: 14, paddingVertical: 8 },
});