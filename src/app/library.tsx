import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function LibraryScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Library Page</Text>
      <StatusBar style="auto" />
    </View>
  );
}
