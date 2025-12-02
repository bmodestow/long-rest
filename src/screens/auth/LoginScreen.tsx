// src/screens/auth/LoginScreen.tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
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
    <KeyboardAvoidingView
      style={styles.avoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // tweak if you have a header
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Long Rest</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
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
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avoidingContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1, // Allows content expand & center nicely
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
