// src/screens/auth/LoginScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { signIn } from '../../api/auth'; // whatever you already use
import LongRestLogoSvg from '../../components/LongRestLogoSvg';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import layoutStyles from '../../styles/layout';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError(signInError.message ?? 'Failed to sign in.');
      }
      // On success, your auth listener should navigate to the app stack
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong while signing in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={layoutStyles.screen}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <LongRestLogoSvg size={96}/>
      </View>
      <View style={layoutStyles.card}>
        <Text style={layoutStyles.title}>Long Rest</Text>
        <Text style={layoutStyles.subtitle}>Sign in to your campaign hub.</Text>

        {error && <Text style={layoutStyles.errorText}>{error}</Text>}

        <TextInput
          style={layoutStyles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={layoutStyles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />

        <TouchableOpacity
          style={layoutStyles.primaryButton}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={layoutStyles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={layoutStyles.linkText}>
            New here? Create a Long Rest account.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
