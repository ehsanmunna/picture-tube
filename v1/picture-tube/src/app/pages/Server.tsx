// import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addServer } from '../../api/client';
// import { addSelectedToLibrary, TreeNode } from '../../db/addToLibrary';
import { theme } from '../../theme';
import { ApiFile, DirNode } from '../../types';
import { toggleChecked, updateNode } from '../../utils/tree';
import { mergeFolders } from '../../utils/tree-update';
import { AppButton } from '../components/AppButton';
import { TreeView } from '../components/TreeView';
import { useNavigation } from '@react-navigation/native';
import { addSelectedToLibrary, TreeNode } from '../../db/addToLibrary';

export default function ServerScreen({ params }: any) {
  const navigation = useNavigation();
  const [name, setName] = useState('Test Server');
  const [tree, setTree] = useState<DirNode[]>([]);

  const [link, setLink] = useState('http://fs.ebox.live');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onAdd = async () => {
    console.log('[Server] Add pressed', { name, link });
    // TODO Phase 3: fetch the directory listing from `link`
    setLoading(true);
    setError('');
    try {
      const server = await addServer(link); // uses the link value

      setTree([{
        id: server.id,
        name: server.name,
        url: server.url,
        folders: server.folders,
        files: server.files,
        checked: false,
        expanded: true
      }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onToggleCheck = (node: DirNode) => {
    const value = !node.checked; // partial -> checked
    console.log('[Server] check', node.url, value);
    setTree((t) => toggleChecked(t, node.id, value));
  };

  const onPressFolder = async (node: DirNode) => {
    // Ignore taps while this folder is already loading
    if (node.loading) return;

    // Already fetched: just expand/collapse
    if (node.loaded) {
      setTree((t) => updateNode(t, node.id, (n) => ({ ...n, expanded: !n.expanded })));
      return;
    }

    // Show the spinner
    setTree((t) => updateNode(t, node.id, (n) => ({ ...n, loading: true })));

    try {
      const listing = await addServer(node.url);

      // Merge children and hide the spinner in the same state update,
      // so the spinner disappears exactly when the children render
      setTree((t) =>
        updateNode(t, node.id, (n) => ({
          ...n,
          parent: listing.parent,
          folders: mergeFolders(n.folders, listing.folders, !!n.checked),
          files: listing.files ?? [],
          expanded: true,
          loaded: true,
          loading: false,
        }))
      );
    } catch (e: any) {
      setError(e.message);
      // Hide the spinner on failure too, otherwise it spins forever
      setTree((t) => updateNode(t, node.id, (n) => ({ ...n, loading: false })));
    }
  };

  const onToggleExpand = (node: DirNode) => {
    setTree((t) => updateNode(t, node.id, (n) => ({ ...n, expanded: !n.expanded })));
  };

  const gatherChecked = async (nodes: DirNode[], out: TreeNode[] = []): Promise<TreeNode[]> => {
    for (const n of nodes) {
      if (n.checked !== true) {
        // an unchecked/partial parent can still have checked children
        if (n.folders?.length) await gatherChecked(n.folders, out);
        continue;
      }

      let files = n.files ?? [];
      let folders = (n.folders ?? []) as DirNode[];

      if (!n.loaded) {
        const listing = await addServer(n.url);
        files = listing.files ?? [];
        // children of a checked folder count as checked
        folders = (listing.folders ?? []).map((f: any) => ({ ...f, checked: true })) as DirNode[];
      }

      if (files.length) out.push({ id: n.id, name: n.name, url: n.url, files });
      if (folders.length) await gatherChecked(folders, out);
    }
    return out;
  };

  const onScan = async () => {
    if (!tree.length || loading) return;
    setLoading(true);
    setError('');
    try {
      const serverId = new URL(tree[0].url).hostname;
      const checkedNodes = await gatherChecked(tree);

      if (!checkedNodes.length) {
        setError('Select at least one folder with files');
        return;
      }

      const stats = await addSelectedToLibrary(checkedNodes, serverId);
      Alert.alert(
        'Library updated',
        `${stats.added} added, ${stats.skippedNotVideo} non-video skipped, ${stats.skippedNoFiles} empty folders skipped`,
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onPressFile = (file: ApiFile) => {
    console.log('[Server] file', file.name, file.url);
    // navigation.navigate('/Player',{ 
    //       id: file.id,
    //       title: file.name,
    //       url: file.url,
    //       ext: file.ext,
    //     });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* <ScrollView keyboardShouldPersistTaps="handled"> */}
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
      {!!error && <Text style={{ color: 'red', marginVertical: 8 }}>{error}</Text>}
      <AppButton title="Add Server" onPress={onAdd} />

      {tree.length > 0 && (

        <View style={{ marginTop: theme.spacing.lg, flex: 1 }}>
          <Text style={styles.heading}>Directories</Text>
          <ScrollView
            nestedScrollEnabled
            contentContainerStyle={styles.treeContent}
            keyboardShouldPersistTaps="handled"
          >
            <TreeView nodes={tree} onToggleCheck={onToggleCheck} onPressFolder={onPressFolder} onPressFile={onPressFile} />
          </ScrollView>

          {/* <View style={{ marginTop: theme.spacing.md }}>
              <AppButton title="Scan" onPress={onScan} />
            </View> */}
        </View>


      )}
      <View style={styles.footer}>
        {/* <AppButton title="Scan" onPress={onScan} loading={loading} disabled={loading} /> */}
        <TouchableOpacity style={styles.scanBtn} onPress={onScan}>
          <Text style={styles.scanText}>Scan</Text>
        </TouchableOpacity>
      </View>
      {/* </ScrollView> */}
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
  treeContent: { paddingBottom: 16 },
  footer: { padding: 12, borderTopWidth: StyleSheet.hairlineWidth },
  scanBtn: { padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#2563eb' },
  scanText: { color: '#fff', fontWeight: '600' },
});
