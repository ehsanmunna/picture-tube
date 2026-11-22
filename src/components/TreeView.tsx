import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { DirNode } from '../types';
import { theme } from '../theme';

interface Props {
  nodes: DirNode[];
  onToggleCheck: (node: DirNode) => void;
  onToggleExpand: (node: DirNode) => void;
  depth?: number;
}

export function TreeView({ nodes, onToggleCheck, onToggleExpand, depth = 0 }: Props) {
  return (
    <View>
      {nodes.map((node) => (
        <View key={node.id}>
          <View style={[styles.row, { paddingLeft: depth * 20 }]}>
            <Pressable onPress={() => onToggleExpand(node)} style={styles.arrow}>
              <Text>{node.expanded ? '▼' : '▶'}</Text>
            </Pressable>
            <Pressable onPress={() => onToggleCheck(node)} style={styles.check}>
              <Text style={styles.checkText}>{node.checked ? '☑' : '☐'}</Text>
            </Pressable>
            <Text style={styles.name}>📁 {node.name}</Text>
          </View>
          {node.expanded && node.children && node.children.length > 0 && (
            <TreeView
              nodes={node.children}
              onToggleCheck={onToggleCheck}
              onToggleExpand={onToggleExpand}
              depth={depth + 1}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  arrow: { width: 28, alignItems: 'center' },
  check: { paddingHorizontal: 6 },
  checkText: { fontSize: 20, color: theme.colors.primary },
  name: { fontSize: 15, color: theme.colors.text },
});
