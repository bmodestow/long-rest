import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CampaignDetailScreen from '../screens/campaigns/CampaignDetailScreen';
import CampaignListScreen from '../screens/campaigns/CampaignListScreen';
import PacketDetailScreen from '../screens/packets/PacketDetailScreen';
import SessionDetailSCreen from '../screens/sessions/SessionDetailScreen';
import { colors } from '../theme';

export type AppStackParamList = {
    Campaigns: undefined;
    CampaignDetail: {
        campaignId: string;
        name: string;
        description: string | null;
        memberRole: 'dm' | 'co_dm' | 'player';
        justJoined?: boolean;
    };
    SessionDetail: {
        sessionId: string;
        campaignId: string;
        title: string;
        scheduledStart: string;
        location: string | null;
        memeberRole: 'dm' | 'co_dm' | 'player';
    };
    PacketDetail: {
        campaignId: string;
        packetId: string;
        title: string;
        body: string;
        type: string;
        createdAt: string;
        senderName?: string | null;
        isRead?: boolean;
    };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.bgElevated },
                headerTintColor: colors.text,
                headerTitleStyle: { color: colors.text },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.bg }, // main background
            }}
        >
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
            <Stack.Screen
                name="PacketDetail"
                component={PacketDetailScreen}
                options={{ title: 'Packet' }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;