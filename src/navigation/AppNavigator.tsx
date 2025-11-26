import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CampaignListScreen from '../screens/campaigns/CampaignListScreen';

export type AppStackParamList = {
    Campaigns: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Campaigns"
                component={CampaignListScreen}
                options={{title: 'Long Rest'}}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;