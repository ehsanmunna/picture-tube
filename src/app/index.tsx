import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';

export default function HomeScreen() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Welcome to Picture Tube</Text>
            <Link style={styles.buttonLink} href="/library">Library</Link>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
  buttonLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'red'
  }
});