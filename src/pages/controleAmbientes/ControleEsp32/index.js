import Paho from "paho-mqtt";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import { supabase } from "../../../../services/supabase";
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ControleEsp32() {
    const navigation = useNavigation();
    const [ledStates, setLedStates] = useState({});
    const [connected, setConnected] = useState(false);
    const [broker, setBroker] = useState(null);
    const [client, setClient] = useState(null);

    useEffect(() => {
        const fetchBrokerData = async () => {
            try {
                const { data, error } = await supabase
                    .from('brokerConfig')
                    .select('ip_address, port, username, password')
                    .single();
                if (error) {
                    throw error;
                }
                setBroker(data);
            } catch (error) {
                console.error("Erro ao buscar configuração do broker: ", error);
            }
        };

        fetchBrokerData();
    }, []);

    useEffect(() => {
        if (broker) {
            const mqttClient = new Paho.Client(
                broker.ip_address,
                Number(broker.port),
                `id_ufpe-${parseInt(Math.random() * 100)}`
            );

            mqttClient.connect({
                onSuccess: () => {
                    console.log("Conectado!");
                    setConnected(true);
                    setClient(mqttClient);
                },
                onFailure: (error) => {
                    console.error("Falha ao conectar!", error);
                },
                userName: broker.username,
                password: broker.password
            });

            return () => {
                if (mqttClient.isConnected()) {
                    mqttClient.disconnect();
                }
            };
        }
    }, [broker]);

    useEffect(() => {
        const fetchLedStates = async () => {
            try {
                const { data, error } = await supabase
                    .from('controle')
                    .select('tipoControle, valor');
                if (error) {
                    throw error;
                }
                const initialStates = {};
                data.forEach((led) => {
                    initialStates[led.tipoControle] = led.valor;
                });
                setLedStates(initialStates);
            } catch (error) {
                console.error("Erro ao buscar estados dos LEDs: ", error);
            }
        };

        fetchLedStates();
    }, []);

    const toggleSwitch = async (ledName) => {
        const newState = !ledStates[ledName];
        setLedStates((prevState) => ({ ...prevState, [ledName]: newState }));
        await sendMessage(ledName, newState);
        await updateLedState(ledName, newState);
    };

    const sendMessage = (ledName, isEnabled) => {
        if (connected) {
            const message = new Paho.Message(isEnabled ? "l" : "d");
            message.destinationName = `esp32/${ledName}`;
            client.send(message);
        }
    };

    const updateLedState = async (ledName, newState) => {
        try {
            const { data, error } = await supabase
                .from('controle')
                .update({ valor: newState })
                .eq('tipoControle', ledName);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error("Erro ao atualizar estado no banco de dados: ", error);
        }
    };

    const ledNames = ["LED 1", "LED 2", "LED 3", "LED 4"];

    return (
        <View style={styles.container}>
            <View style={styles.containerHeader}>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <Image style={styles.logo1} source={require("../../../../assets/icon.png")}></Image>
                </Animatable.View>
            </View>
            <Animatable.View animation="fadeInUp" style={styles.containerForm}>
                {ledNames.map((ledName) => (
                    <View key={ledName} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            style={{ ...styles.button, flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => toggleSwitch(ledName)}
                        >
                            <MaterialIcons style={{marginLeft: 25}}name="lightbulb-outline" size={28} color="white" />
                            <Text style={{ ...styles.buttonText, flex: 1, textAlign: 'center' }}>{ledName}</Text>
                            <Switch
                                style={{ marginRight: 10 }}
                                trackColor={{ false: "#fff", true: "#fff" }}
                                thumbColor={ledStates[ledName] ? "#26D07C" : "#fff"}
                                onValueChange={() => toggleSwitch(ledName)}
                                value={ledStates[ledName]}
                            />
                        </TouchableOpacity>
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
    containerForm: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderTopLeftRadius: 100,
        borderTopRightRadius: 0
    },
    button: {
        backgroundColor: '#0B3E25',
        width: 334,
        height: 54,
        marginTop: 15,
        borderRadius: 4,
        alignItems: 'center',
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
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'AnonymousPro_700Bold',
    },
    logo1: {
        width: 200,
        height: 170
    }
});
