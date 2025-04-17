import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Dataform from '../components/Form';
import { useState } from 'react';

export default function App() {
    const [data, setData] = useState([]);
  return (
    <View style={styles.container}>
      <Dataform data={data} setData={setData} ></Dataform>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
