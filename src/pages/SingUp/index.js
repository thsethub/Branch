import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import CustomPicker from './customPicker';
import { contextDeviceId } from '../../../context/contextGlobal/contex';
import { useNavigation } from '@react-navigation/native';

import { supabase } from '../../../services/supabase';
import * as Animatable from 'react-native-animatable'

export default function SingUp() {
    const deviceId = useContext(contextDeviceId);
    const navigation = useNavigation();

    const [nomeCompleto, setNomeCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [selectedAmbiente, setSelectedAmbiente] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [ambientesB, setAmbientes] = useState([]);
    const [perfil, setPerfil] = useState([]);

    const handleAddUser = async (deviceId, nomeCompleto, email, selectedAmbiente, selectedUser) => {
        const ambiente = Array.isArray(selectedAmbiente) ? selectedAmbiente : [selectedAmbiente];

        const { data: ambienteData, error: ambienteError } = await supabase
            .from('ambientes')
            .select('id')
            .eq('nome', ambiente[0]);

        if (ambienteError) {
            // console.error(ambienteError);
            return { data: null, error: ambienteError };
        }

        let ambienteId;
        if (ambienteData && ambienteData.length > 0) {
            ambienteId = ambienteData[0].id;
        }

        if (acessoError) {
            // console.error(acessoError);
            return { data: null, error: acessoError };
        }

        let acessoId;
        if (acessoData && acessoData.length > 0) {
            acessoId = acessoData[0].id;
        }

        const { data, error } = await supabase
            .from('usuarios')
            .insert([
                {
                    uuid: deviceId,
                    nome_completo: nomeCompleto,
                    email: email,
                }
            ]);

        const { data: acessoData, error: acessoError } = await supabase
            .from('acessos')
            .insert([
                {
                    usuario_id: deviceId,
                    ambiente_id: ambienteId,
                    ativado: false,
                    tipoUsuario: selectedUser
                }
            ]);

        return { data, error };
    }
    const fetchAmbientes = async () => {
        const { data: ambientesData, error } = await supabase
            .from('ambientes')
            .select('nome');

        if (error) {
            console.error(error);
            return;
        }

        setAmbientes(ambientesData.map(ambiente => ambiente.nome));
    }
    const fetchPerfil = async () => {
        const { data: perfilData, error } = await supabase
            .from('tipoPerfil')
            .select('nome');

        if (error) {
            console.error(error);
            return;
        }

        setPerfil(perfilData.map( perfil => perfil.nome));
    }

    useEffect(() => {
        fetchAmbientes();
        fetchPerfil();
    }, []);

    // const users = [
    //     'Coordenador',
    //     'Professor',
    //     'Servidor',
    //     'Estudante',
    //     'Terceirizado'
    // ];

    const onPressButton = async () => {
        if (!nomeCompleto || !email || !selectedAmbiente || !selectedUser) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        // if (!email.endsWith('@ufpe.br')) {
        //     Alert.alert('Erro', 'Por favor, utilize um email institucional da UFPE.');
        //     return;
        // }

        const { data, error } = await handleAddUser(deviceId, nomeCompleto, email, selectedAmbiente, selectedUser);
        if (error) {
            Alert.alert('Erro', 'Houve um erro ao solicitar acesso.');
            // console.error(error);
            return;
        }

        Alert.alert(
            'Solicitação',
            'A solicitação foi feita com sucesso!',
            [
                { text: 'OK', onPress: () => navigation.navigate("Welcome", { success: true }) }
            ],
            { cancelable: false }
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.containerHeader}>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <Image style={styles.logo1} source={require('../../../assets/icon.png')}></Image>
                </Animatable.View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Animatable.View animation="fadeInUp" style={styles.containerForm}>
                    <Text style={styles.title}>Nome completo</Text>
                    <TextInput
                        // placeholder="Digite seu nome..."
                        style={styles.input}
                        onChangeText={setNomeCompleto}
                        value={nomeCompleto}
                    />

                    <Text style={styles.title}>Email</Text>
                    <TextInput
                        // placeholder="Digite seu email..."
                        style={styles.input}
                        onChangeText={setEmail}
                        value={email}
                    />

                    <Text style={styles.title}>Selecionar ambiente</Text>
                    <CustomPicker
                        selectedValue={selectedAmbiente}
                        onValueChange={(value) => setSelectedAmbiente(value)}
                        items={ambientesB}
                        style={styles.input}
                    // placeholder={'Selecione um ambiente...'}
                    />
                    <Text style={styles.title}>Selecionar usuário</Text>
                    <CustomPicker
                        selectedValue={selectedUser}
                        onValueChange={(value) => setSelectedUser(value)}
                        items={perfil}
                        style={styles.input}
                    // placeholder={'Selecione um usuário...'}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={onPressButton}
                    >
                        <Text style={styles.buttonText}>Solicitar Acesso</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        style={styles.buttonSing}
                        onPress={() => navigation.navigate("Welcome")}
                    >
                        <Text style={styles.textSing}>Já possui acesso? Acesse</Text>
                    </TouchableOpacity> */}
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
        display: 'flex',
        alignItems: 'center'
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    containerForm: {
        flex: 1,
        paddingTop: 45,
        backgroundColor: '#FFF',
        alignItems: 'center',
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
        width: 200,
        height: 200
    }
});