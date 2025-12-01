import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CampaignDetailScreen from '../screens/campaigns/CampaignDetailScreen';
import CampaignListScreen from '../screens/campaigns/CampaignListScreen';
import SessionDetailSCreen from '../screens/sessions/SessionDetailScreen';

export type AppStackParamList = {
    Campaigns: undefined;
    CampaignDetail: {
        campaignId: string;
        name: string;
        description: string | null;
        memberRole: 'dm' | 'co_dm' | 'player';
    };
    SessionDetail: {
        sessionId: string;
        campaignId: string;
        title: string;
        scheduledStart: string;
        location: string | null;
        memeberRole: 'dm' | 'co_dm' | 'player';
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
            <Stack.Screen 
                name="SessionDetail"
                component={SessionDetailSCreen}
                options={({ route }) => ({
                    title: route.params.title,
                })}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;