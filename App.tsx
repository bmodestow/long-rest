import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { supabase } from './src/api/supabaseClient';

export default function App() {

    useEffect(() => {
        const testSupabase = async () => {
            const {data, error} = await supabase
                .from('campaigns') // doesn't need to exist yet
                .select('*')
                .limit(1);
            
            console.log("Supabase test:", { data, error });
        };

        testSupabase();
    }, []);

    return (
        <View>
            <Text>Long Rest App Started</Text>
        </View>
    );
}