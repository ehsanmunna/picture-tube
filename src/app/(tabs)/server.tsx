import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { TreeView } from '../../components/TreeView';
import { useState } from 'react';
import { DirNode } from '../../types';
import { MOCK_TREE, fetchChildren } from '../../data/mock';
import { collectChecked, updateNode, toggleChecked } from '../../utils/tree';

export default function ServerScreen() {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [tree, setTree] = useState<DirNode[]>([]);

  const onAdd = () => {
    console.log('[Server] Add pressed', { name, link });
    // TODO Phase 3: fetch the directory listing from `link`
    setTree(MOCK_TREE);
  };

  const onToggleCheck = (node: DirNode) => {
    const value = !node.checked; // partial -> checked
    console.log('[Server] check', node.path, value);
    setTree((t) => toggleChecked(t, node.id, value));
  };

  const onPressFolder = async (node: DirNode) => {
    if (node.loading) return;
    console.log('[Server] check', node.path);
    // already loaded: just open/close
    if (node.children) {
      setTree((t) => updateNode(t, node.id, (n) => ({ ...n, expanded: !n.expanded })));
      return;
    }

    // not loaded: show spinner, load children, then show them
    console.log('[Server] load children of', node.path);
    setTree((t) => updateNode(t, node.id, (n) => ({ ...n, loading: true, expanded: true })));
    try {
      const kids = await fetchChildren(node.path);
      setTree((t) =>
        updateNode(t, node.id, (n) => ({
          ...n,
          loading: false,
          // children loaded under a checked parent start checked
          children: kids.map((k) => ({ ...k, checked: n.checked })),
        }))
      );
    } catch (e) {
      console.log('[Server] load failed', e);
      setTree((t) => updateNode(t, node.id, (n) => ({ ...n, loading: false, expanded: false })));
    }
  };

  const onToggleExpand = (node: DirNode) => {
    console.log('[Server] expand', node.path);
    setTree((t) => updateNode(t, node.id, (n) => ({ ...n, expanded: !n.expanded })));
  };

  const onScan = () => {
    const paths = collectChecked(tree);
    console.log('[Server] Scan pressed, selected directories:', paths);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Add Server</Text>
        <TextInput style={styles.input} placeholder="Server name" value={name} onChangeText={setName} />
        <TextInput
          style={styles.input}
          placeholder="Server link (http://...)"
          autoCapitalize="none"
          keyboardType="url"
          value={link}
          onChangeText={setLink}
        />
        <AppButton title="Add" onPress={onAdd} />

        {tree.length > 0 && (
          <View style={{ marginTop: theme.spacing.lg }}>
            <Text style={styles.heading}>Directories</Text>
            <TreeView nodes={tree} onToggleCheck={onToggleCheck} onPressFolder={onPressFolder} />
            <View style={{ marginTop: theme.spacing.md }}>
              <AppButton title="Scan" onPress={onScan} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: theme.spacing.sm, color: theme.colors.text },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
});
