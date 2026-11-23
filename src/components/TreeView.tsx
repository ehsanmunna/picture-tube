import React from 'react';
import { ActivityIndicator, Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DirNode } from '../types';
import { getCheckState } from '../utils/tree';
import { theme } from '../theme';

interface Props {
  nodes: DirNode[];
  onToggleCheck: (node: DirNode) => void;
  onPressFolder: (node: DirNode) => void;
  depth?: number;
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

export function TreeView({ nodes, onToggleCheck, onPressFolder, depth = 0 }: Props) {
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

          {node.expanded && node.children && node.children.length > 0 && (
            <TreeView
              nodes={node.children}
              onToggleCheck={onToggleCheck}
              onPressFolder={onPressFolder}
              depth={depth + 1}
            />
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
});