import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
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
            // AuthContext will pick up the change, RootNavigator will switch to AppNavigator
        }
    };

    return (
        <View style={{ flex: 1, padding: 24, justifyContent: 'center '}}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24 }}>Long Rest</Text>

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
                autoCapitalize='none'
                keyboardType='email-address'
                value={email}
                onChangeText={setEmail}
            />
        </View>
    )
}