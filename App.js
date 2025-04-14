import React, {useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  Button,
} from 'react-native';

export default function App() {
  const ws = useRef(null);
  const [ip, setIp] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [currentPage, setCurrentPage] = useState('Settings'); // Track current page

  const connect = () => {
    if (!ip) {
      Alert.alert('Error', 'IP address is not set.');
      return;
    }

    if (ws.current) {
      ws.current.close();
    }

    ws.current = new WebSocket(`ws://${ip}:8080`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('Connected');
      Alert.alert('Success', 'WebSocket connected.');
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected.');
      setConnectionStatus('Disconnected');
    };

    ws.current.onerror = e => {
      console.log('WebSocket error', e.message);
      setConnectionStatus('Error');
      Alert.alert('Error', `WebSocket error: ${e.message}`);
    };
  };

  const disconnect = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setConnectionStatus('Disconnected');
      Alert.alert('Disconnected', 'WebSocket connection closed.');
    } else {
      Alert.alert('Error', 'No active WebSocket connection to disconnect.');
    }
  };

  const saveIp = () => {
    if (!ip) {
      Alert.alert('Error', 'Please enter a valid IP address.');
      return;
    }

    if (ws.current) {
      ws.current.close();
      setConnectionStatus('Disconnected');
    }

    Alert.alert('Success', 'IP address saved. You can now connect manually.');
  };

  const sendCommand = command => {
    if (ws.current && connectionStatus === 'Connected') {
      ws.current.send(command);
    } else {
      Alert.alert('Error', 'Cannot send command. WebSocket is not connected.');
    }
  };

  const renderSettingsPage = () => (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>VS Code Remote - Settings</Text>
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Enter IP Address"
          placeholderTextColor="#aaa"
          value={ip}
          onChangeText={setIp}
        />
        <TouchableOpacity onPress={saveIp} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save IP</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity onPress={connect} style={styles.connectButton}>
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={disconnect} style={styles.disconnectButton}>
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Connection Status: {connectionStatus}
        </Text>
      </View>
    </SafeAreaView>
  );

  const renderCommandPage = () => (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>VS Code Remote</Text>
      {connectionStatus === 'Connected' ? (
        <View style={styles.commandGrid}>
          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => sendCommand('openCommandPalette')}>
            <Text style={styles.commandButtonText}>Command Palette</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => sendCommand('openSourceControl')}>
            <Text style={styles.commandButtonText}>Source Control</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => sendCommand('closeTerminal')}>
            <Text style={styles.commandButtonText}>Close Terminal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => sendCommand('insertBracesLeft')}>
            <Text style={styles.commandButtonText}>Insert {'{'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => sendCommand('insertBracesRight')}>
            <Text style={styles.commandButtonText}>Insert {'}'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => sendCommand('insertPipes')}>
            <Text style={styles.commandButtonText}>Insert ||</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => sendCommand('reloadWindow')}>
            <Text style={styles.commandButtonText}>Reload Window</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.statusText}>
          Please connect to the WebSocket to use commands.
        </Text>
      )}
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {currentPage === 'Settings' ? renderSettingsPage() : renderCommandPage()}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => setCurrentPage('Settings')}
          style={[
            styles.footerButton,
            currentPage === 'Settings' && styles.activeFooterButton,
          ]}>
          <Text style={styles.footerButtonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentPage('Commands')}
          style={[
            styles.footerButton,
            currentPage === 'Commands' && styles.activeFooterButton,
          ]}>
          <Text style={styles.footerButtonText}>Commands</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 20,
    justifyContent: 'center', // Center elements vertically
    alignItems: 'center', // Center elements horizontally
  },
  title: {
    fontSize: 26,
    color: '#fff',
    marginBottom: 20,
    alignSelf: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#fff',
    backgroundColor: '#333',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#2EA2FA',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center', // Center buttons horizontally
    alignItems: 'center',
    marginTop: 20,
    gap: 10, // Add a small gap between buttons
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
  },
  disconnectButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#333',
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  activeFooterButton: {
    backgroundColor: '#555',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  commandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center buttons horizontally
    alignItems: 'center', // Center buttons vertically
    marginTop: 20,
    paddingHorizontal: 10,
  },
  commandButton: {
    width: 80, // Reduce width
    height: 80, // Reduce height to match width
    backgroundColor: '#2EA2FA',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10, // Equal gap for both rows and columns
    borderRadius: 10,
  },
  commandButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
