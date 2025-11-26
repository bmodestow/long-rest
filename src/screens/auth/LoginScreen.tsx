// src/screens/auth/LoginScreen.tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { signIn } from '../../api/auth';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Login failed', error.message);
    } else {
      // Auth state listener in AuthContext will pick this up
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Long Rest</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={[styles.input, styles.passwordInput]}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={loading ? 'Logging in...' : 'Log in'}
        onPress={handleLogin}
        disabled={loading}
      />

      <View style={styles.footer}>
        <Text>
          New here?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Register')}
          >
            Create an account
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  passwordInput: {
    marginBottom: 24,
  },
  footer: {
    marginTop: 16,
  },
  link: {
    color: 'blue',
  },
});

export default LoginScreen;
