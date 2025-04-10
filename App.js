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
import {useEffect, useRef} from 'react';

export default function App() {
  const ws = useRef(null);

  useEffect(() => {
    connect();
  }, []);

  const connect = () => {
    ws.current = new WebSocket('ws://10.0.2.2:8080');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting in 2s...');
      setTimeout(connect, 2000);
    };

    ws.current.onerror = e => {
      console.log('WebSocket error', e.message);
    };
  };
  const sendCommand = command => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log(`Sending command: ${command}`);
      ws.current.send(command);
    } else {
      Alert.alert('Error', 'WebSocket not connected.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>VS Code Remote</Text>

      <View style={styles.buttonGroup}>
        <Button
          label="Command Palette"
          onPress={() => sendCommand('openCommandPalette')}
        />
        <Button
          label="Source Control"
          onPress={() => sendCommand('openSourceControl')}
        />
        <Button
          label="Close Terminal"
          onPress={() => sendCommand('closeTerminal')}
        />
        <Button
          label="Insert {"
          onPress={() => sendCommand('insertBracesLeft')}
        />
        <Button
          label="Insert }"
          onPress={() => sendCommand('insertBracesRight')}
        />
        <Button label="Insert ||" onPress={() => sendCommand('insertPipes')} />
        <Button
          label="Reload Window"
          onPress={() => sendCommand('reloadWindow')}
        />
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
    flexDirection: 'row', // This will arrange the buttons in a row
    flexWrap: 'wrap', // Allow wrapping if buttons overflow horizontally
    justifyContent: 'center', // Center buttons horizontally
    alignItems: 'center', // Center buttons vertically
    gap: 10, // Space between buttons
  },
  button: {
    backgroundColor: '#2EA2FA',
    padding: 10,
    borderRadius: 10,
    width: 100, // Set width
    height: 100, // Set height
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5, // Add margin to separate buttons
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
