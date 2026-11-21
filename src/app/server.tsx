import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ServerScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Server Page</Text>
      <StatusBar style="auto" />
    </View>
  );
}
