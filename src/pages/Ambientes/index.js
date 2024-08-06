import Paho from "paho-mqtt";
import { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { contextDeviceId } from '../../../context/contextGlobal/contex';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../services/supabase';

export default function Ambientes({ route }) {

    const deviceId = useContext(contextDeviceId);
    const navigation = useNavigation();
    const [ambientes, setAmbientes] = useState([]);
    const [isSuperusuario, setIsSuperusuario] = useState(false);
    const { email } = route.params;
    
    useEffect(() => {
        const fetchAccessData = async () => {
            const { data: accessData, error: accessError } = await supabase
                .from('acessos')
                .select('ambiente_id, ativado, tipoUsuario')
                .eq('usuario_id', deviceId);

            if (accessError) {
                console.error("Erro ao buscar acessos: ", accessError);
                return;
            }
            if (accessData.length === 0) {
                return;
            }

            const ambienteIds = accessData.map(access => access.ambiente_id);

            const { data: ambientesData, error: ambientesError } = await supabase
                .from('ambientes')
                .select('id, nome, topic, mensagem')
                .in('id', ambienteIds);

            if (ambientesError) {
                console.error("Erro ao buscar ambientes: ", ambientesError);
                return;
            }

            const combinedData = accessData.map(access => {
                const ambiente = ambientesData.find(amb => amb.id === access.ambiente_id);
                return {
                    ...access,
                    nome: ambiente ? ambiente.nome : 'Desconhecido',
                    topic: ambiente ? ambiente.topic : 'Desconhecido',
                    mensagem: ambiente ? ambiente.mensagem : 'Desconhecido',
                };
            });

            const sortedAmbientes = combinedData.sort((a, b) => {
                if (a.tipoUsuario === 'Coordenador' && b.tipoUsuario !== 'Coordenador') {
                    return -1;
                }
                if (a.tipoUsuario !== 'Coordenador' && b.tipoUsuario === 'Coordenador') {
                    return 1;
                }
                return 0;
            });

            setAmbientes(sortedAmbientes);
        };

        fetchAccessData();

        const fetchUserData = async () => {
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('superuser')
                .eq('uuid', deviceId);

            if (userError) {
                console.error("Erro ao buscar dados do usuário: ", userError);
                return;
            }

            if (userData.length === 0) {
                console.warn("Usuáio não encontrado");
                return;
            }

            setIsSuperusuario(userData[0].superuser);
        };

        fetchUserData();

        const subscription = supabase
            .channel('public:acessos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'acessos' }, payload => {
                // console.log('Mudança detectada!', payload);
                fetchAccessData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [deviceId]);

    const handlePress = async (ambienteId) => {
        const ambiente = ambientes.find(a => a.ambiente_id === ambienteId);
        if (!ambiente) {
            Alert.alert('Erro', 'Ambiente não encontrado.');
            return;
        }
        
        // if (connected && ambiente.ativado) {
        //     Alert.alert(
        //         'Confirmação',
        //         `Tem certeza que deseja abrir o ambiente ${ambiente.nome}?`,
        //         [
        //             {
        //                 text: 'Cancelar',
        //                 // onPress: () => console.log('Ação cancelada'),
        //                 style: 'cancel'
        //             },
        //             {
        //                 text: 'Confirmar',
        //                 onPress: async () => {
        //                     try {
        //                         const mqttMessage = new Paho.Message(ambiente.mensagem);
        //                         mqttMessage.destinationName = ambiente.topic;
        //                         await client.send(mqttMessage);
        //                         // Alert.alert('Sucesso', `Mensagem enviada para o ambiente: ${ambiente.nome}`);
        //                     } catch (error) {
        //                         Alert.alert('Erro', `Falha ao enviar mensagem: ${error.message}`);
        //                     }
        //                 }
        //             }
        //         ],
        //         { cancelable: false }
        //     );
        // } else {
        //     Alert.alert('Acesso negado', 'Você não tem permissão para acessar este ambiente ou não está conectado.');
        // }
    };

    return (
        <View style={styles.container}>
            <View style={styles.containerHeader}>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <Image style={styles.logo1} source={require('../../../assets/icon.png')} />
                </Animatable.View>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, width: '100%' }}>
                        <FontAwesome name="user" size={24} color="white" />
                        <View style={[styles.divider]} />
                        <Text style={styles.text}>{email}</Text>
                        {isSuperusuario && (
                            <TouchableOpacity onPress={() => navigation.navigate("AppConfig")}>
                                <Ionicons name="settings-sharp" size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => {
                            navigation.navigate("Welcome");
                        }}>
                            <Ionicons name="exit-outline" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </Animatable.View>
            </View>

            <Animatable.View animation="fadeInUp" style={styles.containerForm}>
                {ambientes.map(ambiente => (
                    <View style={styles.buttonContainer} key={ambiente.ambiente_id}>
                        <TouchableOpacity
                            style={[styles.button, !ambiente.ativado && styles.buttonDisabled]}
                            onPress={() => navigation.navigate('ControleEsp32')}
                            disabled={!ambiente.ativado}
                        >
                            <Text style={styles.buttonText}>{ambiente.nome}</Text>
                        </TouchableOpacity>
                        {(isSuperusuario || (ambiente.tipoUsuario === 'Coordenador' && ambiente.ativado)) && (
                            <TouchableOpacity
                                style={styles.buttonConfig}
                                onPress={() => navigation.navigate('ControleAcesso', { ambienteId: ambiente.ambiente_id })}
                            >
                                <Ionicons name="settings-sharp" size={30} color="#0B3E25" />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </Animatable.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B3E25',
    },
    containerHeader: {
        display: 'flex',
        alignItems: 'center',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#FFF',
        width: '150%',
        position: 'absolute'
    },
    scrollViewContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerForm: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    button: {
        backgroundColor: '#0B3E25',
        width: 300,
        height: 54,
        marginTop: 15,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
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
    buttonDisabled: {
        backgroundColor: '#cdcdcd',
    },
    buttonContainer: {
        flexDirection: 'row'
    },
    buttonConfig: {
        backgroundColor: '#fff',
        width: 70,
        height: 54,
        marginTop: 15,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        borderTopLeftRadius: 200,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 200,
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
        fontSize: 16,
        fontFamily: 'AnonymousPro_700Bold',
    },
    logo1: {
        width: 200,
        height: 170
    },
    text: {
        fontSize: 16,
        display: 'flex',
        fontFamily: 'AnonymousPro_700Bold',
        color: '#FFF',
        marginTop: 3,
    },
    scrollView: {
        width: '100%',
    },
});