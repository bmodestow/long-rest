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
    TouchableWithoutFeedback
} from 'react-native';
import { signUp } from '../../api/auth';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter an email and password.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, displayName || undefined);
    setLoading(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      Alert.alert('Success', 'Account created! You can log in now.', [{ text: 'OK' }]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.avoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // tweak if you add a header
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create your account</Text>

          <Text style={styles.label}>Display name (optional)</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            returnKeyType="next"
          />

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
            style={[styles.input, styles.lastInput]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
          />

          <Button
            title={loading ? 'Creating account...' : 'Sign up'}
            onPress={handleRegister}
            disabled={loading}
          />
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
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
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
  lastInput: {
    marginBottom: 24,
  },
});

export default RegisterScreen;
