import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import HomeScreen from './src/app/pages/Home';
import LibraryScreen from './src/app/pages/Library';
import ServerScreen from './src/app/pages/Server';

const RootStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Library: LibraryScreen,
    Server: ServerScreen,
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
