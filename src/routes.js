import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';
import * as Application from 'expo-application';
import { useState, useEffect } from 'react';
import { contextDeviceId } from '../context/contextGlobal/contex'

import SingUp from './pages/SingUp/index'
import Ambientes from './pages/Ambientes/index'
import NovoAmbiente from './pages/SingUp/novoAmbiente/index'
import Welcome from './pages/Welcome/index';
import WelcomeBack from './pages/WelcomeBack/index';
import ControleAcesso from './pages/ControleAcesso/index';
import AppConfig from './pages/AppConfig/index';
import Config1 from './pages/AppConfig/telas/config1';
import Config2 from './pages/AppConfig/telas/config2';
import Config3 from './pages/AppConfig/telas/config3';
import ControleEsp32 from './pages/controleAmbientes/ControleEsp32';

const Stack = createNativeStackNavigator();

export default function Routes() {

    const [deviceId, setDeviceId] = useState(null);
    const [isDeviceIdExists, setIsDeviceIdExists] = useState(null);
    const [loading, setLoading] = useState(true);
    const [emaill, setEmail] = useState(null);
    const [nome, setNomeCompleto] = useState(null);

    useEffect(() => {
        const getDeviceId = async () => {
            let id;
            if (Platform.OS === 'android') {
                id = await Application.getAndroidId();
            } else if (Platform.OS === 'ios') {
                id = await Application.getIosIdForVendorAsync();
            }
            setDeviceId(id);
        };
        getDeviceId();
    }, []);

    useEffect(() => {
        const checkDeviceIdExists = async () => {
            const { data, error } = await supabase
                .from('usuarios')
                .select('uuid, nome_completo, email')
                .eq('uuid', deviceId);

            if (data && data.length > 0) {
                setIsDeviceIdExists(true);
                setNomeCompleto(data[0].nome_completo);
                setEmail(data[0].email);
                // console.log(data[0].nome_completo);
                // console.log(data[0].email_ufpe);
            } else {
                setIsDeviceIdExists(false);
            }
            setLoading(false);
        };

        if (deviceId) {
            checkDeviceIdExists();
        }
    }, [deviceId]);

    useEffect(() => {
        if (deviceId) {
            const channel = supabase
                .channel('custom-all-channel')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'usuarios' }, payload => {
                    if (payload.new.uuid === deviceId) {
                        setIsDeviceIdExists(true);
                        setNomeCompleto(payload.new.nome_completo);
                        setEmail(payload.new.email);
                        // console.log('Tempo real: Novo usuário detectado', payload.new);
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [deviceId]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0B3E25" />
            </View>
        );
    }

    return (
        <contextDeviceId.Provider value={deviceId}>
            <Stack.Navigator
                screenOptions={{
                    headerTitle: '',
                    headerTransparent: true,
                    headerTintColor: '#FFF',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name={isDeviceIdExists ? 'Welcome' : 'WelcomeBack'}
                    component={isDeviceIdExists ? Welcome : WelcomeBack}
                    options={{ headerShown: false }}
                    initialParams={isDeviceIdExists ? { nome: nome } : {}}
                />
                <Stack.Screen
                    name='SingUp'
                    component={SingUp}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name='NovoAmbiente'
                    component={NovoAmbiente}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name='ControleAcesso'
                    component={ControleAcesso}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name='AppConfig'
                    component={AppConfig}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name='Ambientes'
                    component={Ambientes}
                    options={{ headerShown: false }}
                    initialParams={isDeviceIdExists ? { email: emaill } : {}}
                />
                <Stack.Screen
                    name='Config1'
                    component={Config1}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name='Config2'
                    component={Config2}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name='Config3'
                    component={Config3}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name='ControleEsp32'
                    component={ControleEsp32}
                    options={{ headerShown: true }}
                />
            </Stack.Navigator>
        </contextDeviceId.Provider>
    )
}
