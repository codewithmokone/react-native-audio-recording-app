import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import HomeScreen from './src/pages/HomeScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <HomeScreen />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#93B1A6',
    alignItems: 'center',
  },
});
