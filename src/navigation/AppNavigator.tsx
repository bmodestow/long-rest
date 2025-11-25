import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Button, Text, View } from 'react-native';
import { supabase } from '../api/supabaseClient';

export type AppStackParamList = {
    Home: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const HomeScreen = () => {
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 16 }}>Welcome to Long Rest 🛏️</Text>
            <Text style={{ marginBottom: 24, textAlign: 'center' }}>
                You are logging in. This will later become your Campaigns screen.
            </Text>
            <Button title="Log out" onPress={handleLogout} />
        </View>
    );
};

const AppNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Long Rest' }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;