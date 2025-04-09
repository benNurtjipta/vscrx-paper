import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {io} from 'socket.io-client';

const ws = new WebSocket('ws://10.0.2.2:8080');

export default function App() {
  const sendCommand = command => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(command);
    } else {
      Alert.alert('Error', 'WebSocket not connected.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>VS Code Remote</Text>

      <View style={styles.buttonGroup}>
        <Button
          label="Source Control"
          onPress={() => sendCommand('openSourceControl')}
        />
        <Button
          label="Close Terminal"
          onPress={() => sendCommand('closeTerminal')}
        />
        <Button label="Insert {}" onPress={() => sendCommand('insertBraces')} />
        <Button label="Insert ||" onPress={() => sendCommand('insertPipes')} />
      </View>
    </SafeAreaView>
  );
}

const Button = ({label, onPress}) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    marginBottom: 20,
    alignSelf: 'center',
  },
  buttonGroup: {
    gap: 15,
  },
  button: {
    backgroundColor: '#0a84ff',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
