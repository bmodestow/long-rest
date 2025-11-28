import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CampaignDetailScreen from '../screens/campaigns/CampaignDetailScreen';
import CampaignListScreen from '../screens/campaigns/CampaignListScreen';

export type AppStackParamList = {
    Campaigns: undefined;
    CampaignDetail: {
        campaignId: string;
        name: string;
        description: string | null;
        memberRole: 'dm' | 'co_dm' | 'player';
    };
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
            <Stack.Screen
                name="CampaignDetail"
                component={CampaignDetailScreen}
                options={({ route}) => ({
                    title: route.params.name,
                })}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;