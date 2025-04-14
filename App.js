import React, {useState, useRef, useEffect} from 'react';
import {View, Alert, ScrollView, TouchableOpacity} from 'react-native';
import {
  Provider as PaperProvider,
  DefaultTheme,
  Text,
  Button,
  TextInput,
  Switch,
  Appbar,
  Card,
  IconButton,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2EA2FA',
    background: '#1e1e1e',
    text: '#ffffff',
    surface: '#333',
  },
};

const defaultCommands = [
  {
    id: 'openCommandPalette',
    name: 'Open Command Palette',
    buttonLabel: 'Command Palette',
    isVisible: true,
    type: 'command',
    vscodeCommand: 'workbench.action.showCommands',
  },
  {
    id: 'insertBracesLeft',
    name: 'Insert  {',
    buttonLabel: '{',
    isVisible: true,
    type: 'snippet',
    snippet: '{',
  },
  {
    id: 'insertBracesRight',
    name: 'Insert  }',
    buttonLabel: '}',
    isVisible: true,
    type: 'snippet',
    snippet: '}',
  },
  {
    id: 'insertPipes',
    name: 'Insert ||',
    buttonLabel: '||',
    isVisible: true,
    type: 'snippet',
    snippet: '||',
  },
  {
    id: 'closeTerminal',
    name: 'Close Terminal',
    buttonLabel: 'Close Terminal',
    isVisible: true,
    type: 'terminal',
    vscodeCommand: 'closeTerminal',
  },
  {
    id: 'reloadWindow',
    name: 'Reload Window',
    buttonLabel: 'Reload Window',
    isVisible: true,
    type: 'command',
    vscodeCommand: 'workbench.action.reloadWindow',
  },
  {
    id: 'openSourceControl',
    name: 'Open Source Control',
    buttonLabel: 'Source Control',
    isVisible: true,
    type: 'command',
    vscodeCommand: 'workbench.view.scm',
  },
];

export default function App() {
  const ws = useRef(null);
  const [ip, setIp] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [currentPage, setCurrentPage] = useState('Settings');
  const [commands, setCommands] = useState(defaultCommands);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedIp = await AsyncStorage.getItem('@saved_ip');
        if (savedIp) setIp(savedIp);
      } catch (e) {
        console.log('Failed to load IP from storage', e);
      }
    };
    loadSettings();
  }, []);

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
      sendCommandListToExtension();
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

  const sendCommandListToExtension = (updatedCommands = commands) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'commandList',
        data: updatedCommands,
      };
      ws.current.send(JSON.stringify(message));
    }
  };

  const saveIp = async () => {
    if (!ip) {
      Alert.alert('Error', 'Please enter a valid IP address.');
      return;
    }

    try {
      await AsyncStorage.setItem('@saved_ip', ip);
      Alert.alert('Success', 'IP address saved.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save IP address.');
    }

    if (ws.current) {
      ws.current.close();
      setConnectionStatus('Disconnected');
    }
  };

  const sendCommand = id => {
    if (ws.current && connectionStatus === 'Connected') {
      const message = {
        type: 'executeCommand',
        id,
      };
      ws.current.send(JSON.stringify(message));
    } else {
      Alert.alert('Error', 'WebSocket is not connected.');
    }
  };

  const renderSettings = () => (
    <ScrollView style={{padding: 20}}>
      <Text variant="headlineMedium" style={{color: '#fff', marginBottom: 10}}>
        Settings
      </Text>
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
        <TextInput
          label="IP Address"
          value={ip}
          onChangeText={setIp}
          mode="outlined"
          placeholder="e.g. 192.168.178.34"
          style={{flex: 1, marginRight: 10}}
          textColor="#fff"
        />
        <Button mode="contained" onPress={saveIp}>
          Save IP
        </Button>
      </View>
      <Button mode="contained" onPress={connect} style={{marginBottom: 10}}>
        Connect
      </Button>
      <Button mode="outlined" onPress={disconnect} style={{marginBottom: 20}}>
        Disconnect
      </Button>
      <View style={{padding: 20}}>
        <Text style={{color: '#fff', marginBottom: 20}}>
          Status: {connectionStatus}
        </Text>
      </View>
      <Text style={{color: '#fff', marginBottom: 10}}>Commands:</Text>
      {commands.map(cmd => (
        <Card
          key={cmd.id}
          style={{
            marginBottom: 10,
            backgroundColor: '#333',
            elevation: 4,
            height: 70,
          }}>
          <Card.Title
            title={cmd.name}
            titleStyle={{
              color: '#fff',
              fontSize: 14,
            }}
            right={() => (
              <Switch
                value={cmd.isVisible}
                onValueChange={value => {
                  const updated = commands.map(c =>
                    c.id === cmd.id ? {...c, isVisible: value} : c,
                  );
                  setCommands(updated);
                  sendCommandListToExtension(updated);
                }}
              />
            )}
          />
        </Card>
      ))}
    </ScrollView>
  );

  const renderCommands = () => (
    <ScrollView style={{padding: 20}}>
      <Text variant="headlineMedium" style={{color: '#fff', marginBottom: 20}}>
        Commands
      </Text>
      {connectionStatus !== 'Connected' ? (
        <Text style={{color: '#fff'}}>Please connect first.</Text>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
          {commands
            .filter(c => c.isVisible)
            .map(cmd => (
              <TouchableOpacity
                key={cmd.id}
                onPress={() => sendCommand(cmd.id)}
                style={{
                  width: '31%',
                  height: 112,
                  marginBottom: 8,
                  backgroundColor: '#2EA2FA',
                  borderRadius: 6,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 4,
                }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: '#111',
                    textAlign: 'center',
                  }}
                  numberOfLines={3}>
                  {cmd.buttonLabel}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header
        mode="center-aligned"
        style={{
          height: 100,
          paddingTop: 20,
          paddingBottom: 20,
          justifyContent: 'center',
          elevation: 4,
        }}>
        <Appbar.Content
          title="VS Code Remote"
          titleStyle={{
            fontSize: 29,
            textAlign: 'center',
          }}
        />
        <Appbar.Action
          icon={() => <Icon name="cogs" size={24} color="#111" />}
          onPress={() => setCurrentPage('Settings')}
        />
        <Appbar.Action
          icon={() => <Icon name="code" size={24} color="#111" />}
          onPress={() => setCurrentPage('Commands')}
        />
      </Appbar.Header>
      <View style={{flex: 1, backgroundColor: theme.colors.background}}>
        {currentPage === 'Settings' ? renderSettings() : renderCommands()}
      </View>
    </PaperProvider>
  );
}
