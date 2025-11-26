import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
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
            Alert.alert('Success', 'Account created! You can log in now.', [
                { text: 'OK' },
            ]);
        }
    };

    return (
        <View style={{ flex:1, padding: 24, justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Create your account</Text>

            <Text style={{ marginBottom: 8 }}>Display name (optional)</Text>
            <TextInput 
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginBottom: 16,
                }}
                value={displayName}
                onChangeText={setDisplayName}
            />

            <Text style={{ marginBottom: 8 }}>Email</Text>
            <TextInput 
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginBottom: 16,
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <Text style={{ marginBottom: 8 }}>Password</Text>
            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginBottom: 24,
                }}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button
                title={loading ? 'Creating account...' : 'Sign up'}
                onPress={handleRegister}
                disabled={loading}
            />
        </View>
    );
};

export default RegisterScreen;