// src/screens/auth/RegisterScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { signUp } from '../../api/auth';
import LongRestLogoSvg from '../../components/LongRestLogoSvg';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { layoutStyles } from '../../styles/layout';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      setError('Please enter an email and password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const { error: signUpError } = await signUp(
        email.trim(),
        password,
        displayName || undefined
      );
      if (signUpError) {
        setError(signUpError.message ?? 'Failed to sign up.');
      } else {
        // let auth listener redirect them, or:
        // navigation.replace('Login');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong while creating your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={layoutStyles.screen}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <LongRestLogoSvg size={88} subtitle='Join the campfire'/>
      </View>

      <View style={layoutStyles.card}>
        <Text style={layoutStyles.title}>Create an account</Text>
        <Text style={layoutStyles.subtitle}>
          Join your parties and track their Long Rests.
        </Text>

        {error && <Text style={layoutStyles.errorText}>{error}</Text>}

        <TextInput
          style={layoutStyles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Display name (optional)"
          placeholderTextColor={colors.textMuted}
        />

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
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={layoutStyles.primaryButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={layoutStyles.linkText}>
            Already have an account? Sign in.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;
