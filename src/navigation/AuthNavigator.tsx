import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: 'Long Rest - Login' }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options = {{ title: 'Create Account' }}
            />
        </Stack.Navigator>
    );
};

export default AuthNavigator;