import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import CustomPicker from '../customPicker';
import { contextDeviceId } from '../../../../context/contextGlobal/contex';
import { supabase } from '../../../../services/supabase';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

export default function NovoAmbiente() {
    const navigation = useNavigation();
    const deviceId = useContext(contextDeviceId);

    const [selectedAmbiente, setSelectedAmbiente] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [ambientesB, setAmbientes] = useState([]);
    const [perfil, setPerfil] = useState([]);

    const handleAddUser = async (deviceId, selectedAmbiente, selectedUser) => {
        try {
            const { data: ambienteData, error: ambienteError } = await supabase
                .from('ambientes')
                .select('id')
                .eq('nome', selectedAmbiente);

            if (ambienteError) {
                // console.error(ambienteError);
                return { data: null, error: ambienteError };
            }

            if (ambienteData.length === 0) {
                return { data: null, error: 'Ambiente não encontrado' };
            }

            const ambienteId = ambienteData[0].id;

            const { data: acessoData, error: acessoError } = await supabase
                .from('acessos')
                .select('*')
                .eq('usuario_id', deviceId)
                .eq('ambiente_id', ambienteId);

            if (acessoError) {
                // console.error(acessoError);
                return { data: null, error: acessoError };
            }

            if (acessoData.length > 0) {
                return { data: null, error: 'Você já solicitou este ambiente.' };
            }

            const { data, error } = await supabase
                .from('acessos')
                .insert([
                    {
                        usuario_id: deviceId,
                        ambiente_id: ambienteId,
                        ativado: false,
                        tipoUsuario: selectedUser
                    }
                ]);

            if (error) {
                // console.error(error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            // console.error(error);
            return { data: null, error };
        }
    };

    const fetchAmbientes = async () => {
        const { data: ambientesData, error } = await supabase
            .from('ambientes')
            .select('nome');

        if (error) {
            console.error(error);
            return;
        }

        setAmbientes(ambientesData.map(ambiente => ambiente.nome));
        // console.log(ambientesData);
    }
    const fetchPerfil = async () => {
        const { data: tipoPerfilData, error } = await supabase
            .from('tipoPerfil')
            .select('nome');

        if (error) {
            console.error(error);
            return;
        }

        setPerfil(tipoPerfilData.map( perfil => perfil.nome));
        // console.log(tipoPerfilData);
    }

    useEffect(() => {
        fetchAmbientes();
        fetchPerfil();
    }, []);

    const onPressButton = async () => {
        if (!selectedAmbiente || !selectedUser) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        const { data, error } = await handleAddUser(deviceId, selectedAmbiente, selectedUser);
        if (error) {
            Alert.alert('Erro', error === 'Você já solicitou este ambiente.' ? error : 'Houve um erro ao solicitar acesso.');
            // console.error(error);
            return;
        }

        Alert.alert(
            'Solicitação',
            'A solicitação foi feita com sucesso!',
            [
                { text: 'OK', onPress: () => navigation.navigate("Welcome") }
            ],
            { cancelable: false }
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.containerHeader}>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <Image style={styles.logo1} source={require('../../../../assets/icon.png')} />
                </Animatable.View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Animatable.View animation="fadeInUp" style={styles.containerForm}>

                    <Text style={styles.title}>Selecionar ambiente</Text>
                    <CustomPicker
                        selectedValue={selectedAmbiente}
                        onValueChange={(value) => setSelectedAmbiente(value)}
                        items={ambientesB}
                        style={styles.input}
                    />
                    <Text style={styles.title}>Selecionar usuário</Text>
                    <CustomPicker
                        selectedValue={selectedUser}
                        onValueChange={(value) => setSelectedUser(value)}
                        items={perfil}
                        style={styles.input}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={onPressButton}
                    >
                        <Text style={styles.buttonText}>Solicitar Acesso</Text>
                    </TouchableOpacity>
                </Animatable.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B3E25'
    },
    containerHeader: {
        marginTop: '10%',
        marginBottom: '10%',
        display: 'flex',
        alignItems: 'center'
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    containerForm: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 100,
        borderTopRightRadius: 0,
    },
    title: {
        fontSize: 18,
        fontFamily: 'AnonymousPro_700Bold',
        display: 'flex',
        alignItems: 'center',
        color: 'rgba(0, 0, 0, 0.61)',
        alignSelf: 'flex-start',
        paddingLeft: '15%',
        marginTop: 15,
    },
    input: {
        width: 334,
        height: 54,
        fontFamily: 'AnonymousPro_400Regular',
        backgroundColor: '#FFF',
        color: 'rgba(0, 0, 0, 0.61)',
        justifyContent: 'center',
        paddingLeft: 28,
        borderTopLeftRadius: 100,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 100,
        shadowColor: '#000',
        shadowOpacity: 0.50,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 4,
    },
    button: {
        backgroundColor: '#0B3E25',
        width: 334,
        height: 54,
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        marginBottom: 5,
        borderTopLeftRadius: 100,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 100,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 20,
        fontFamily: 'AnonymousPro_700Bold',
        paddingVertical: 3
    },
    buttonRegister: {
        marginTop: 14,
        alignSelf: 'center'
    },
    registerText: {
        color: '#a1a1a1'
    },
    buttonSing: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    textSing: {
        color: '#a31821',
        fontFamily: 'AnonymousPro_700Bold',
    },
    logo1: {
        height: 200,
        width: 200
    }
});
