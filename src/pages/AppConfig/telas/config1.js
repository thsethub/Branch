import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, Image, Text, TouchableOpacity, TextInput, Alert, FlatList, Modal, Button } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { supabase } from '../../../../services/supabase';
import { Entypo, FontAwesome6 } from '@expo/vector-icons';

const Config1 = () => {
    const [perfil, setPerfil] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentPerfil, setCurrentPerfil] = useState({ nome: '' });

    const fetchPerfil = async () => {
        const { data, error } = await supabase
            .from('tipoPerfil')
            .select('id, nome');
        if (data) {
            setPerfil(data);
        } else if (error) {
            console.error("Erro ao buscar ambientes: ", error);
        }
    };

    useEffect(() => {
        fetchPerfil();
    }, []);

    const handleAddPerfil = async () => {
        if (!currentPerfil.nome) {
            Alert.alert("Erro", "Todos os campos são obrigatórios.");
            return;
        }
        const { id, ...perfilData } = currentPerfil;

        // console.log("Dados enviados: ", perfilData);

        const { data, error } = await supabase
            .from('tipoPerfil')
            .insert([perfilData]);
        if (error) {
            console.error("Erro ao adicionar perfil: ", error.message);
            Alert.alert("Erro", `Não foi possível adicionar o perfil. Detalhes: ${error.message}`);
        } else {
            fetchPerfil();
            setModalVisible(false);
        }
    };

    const handleEditPerfil = async (id) => {
        const { data, error } = await supabase
            .from('tipoPerfil')
            .update(currentPerfil)
            .eq('id', id);
        if (error) {
            Alert.alert("Erro", "Não foi possível atualizar o perfil.");
        } else {
            fetchPerfil();
            setModalVisible(false);
        }
    };

    const handleDeletePerfil = async (id) => {
        Alert.alert(
            "Excluir Perfil",
            "Tem certeza que deseja excluir este Perfil?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: async () => {
                        const { data, error } = await supabase
                            .from('tipoPerfil')
                            .delete()
                            .eq('id', id);
                        if (error) {
                            Alert.alert("Erro", "Não foi possível deletar o Perfil.");
                        } else {
                            fetchPerfil();
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    };

    const openModal = (perfil = { id: '', nome: '' }) => {
        setCurrentPerfil(perfil);
        setModalVisible(true);
    };
    useEffect(() => {
        const subscription = supabase
            .channel('public:tipoPerfil')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'acessos' }, payload => {
                // console.log('Mudança detectada!', payload);
                fetchAccessData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.containerHeader}>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <Image style={styles.logo1} source={require("../../../../assets/icon.png")} />
                </Animatable.View>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={[styles.divider]} />
                        <Text style={styles.text}>Configurações de Perfil</Text>
                    </View>
                </Animatable.View>
            </View>
            <Animatable.View animation="fadeInUp" style={styles.containerForm}>
                <FlatList
                    data={perfil}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.ambienteContainer}>
                            <Text style={styles.ambienteText}>{item.nome}</Text>
                            <View style={styles.buttonGroup}>
                                <TouchableOpacity
                                    style={styles.buttonEdit}
                                    onPress={() => openModal(item)}
                                >
                                    <FontAwesome6 name="edit" size={18} color="#FFF" />
                                    <Text style={styles.buttonText}>Editar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.buttonDelete}
                                    onPress={() => handleDeletePerfil(item.id)}
                                >
                                    <Entypo name="circle-with-minus" size={20} color="#FFF" />
                                    <Text style={styles.buttonText}>Deletar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
                <TouchableOpacity
                    style={styles.buttonAdd}
                    onPress={() => openModal()}
                >
                    <Entypo name="circle-with-plus" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Novo</Text>
                </TouchableOpacity>
            </Animatable.View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <TextInput
                            placeholder="Nome"
                            value={currentPerfil.nome}
                            onChangeText={(text) => setCurrentPerfil({ ...currentPerfil, nome: text })}
                            style={styles.input}
                        />
                        <View style={styles.buttonModal}>
                            <Button
                                title={currentPerfil.id ? "Atualizar" : "Adicionar"}
                                onPress={() => currentPerfil.id ? handleEditPerfil(currentPerfil.id) : handleAddPerfil()}
                                color={currentPerfil.id ? "#26D07C" : "#26D07C"}
                            />
                            <Button
                                title="Cancelar"
                                onPress={() => setModalVisible(false)}
                                color="#dc3545"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B3E25',
    },
    containerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    containerForm: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        borderTopRightRadius: 0,
        padding: 20,
    },
    ambienteContainer: {
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: 350,
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#f1f1f1',
        borderRadius: 5,
    },
    ambienteText: {
        fontSize: 16,
        fontFamily: 'AnonymousPro_400Regular',
        color: '#333',
        flexDirection: 'column',
    },
    buttonGroup: {
        flexDirection: 'row',
    },
    buttonModal: {
        flexDirection: 'row',
    },
    buttonAdd: {
        backgroundColor: '#0B3E25',
        width: 120,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 20,
        flexDirection: 'row',
        borderTopLeftRadius: 100,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 100,
    },
    buttonEdit: {
        backgroundColor: '#26D07C',
        width: 100,
        height: 37,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginRight: 10,
        flexDirection: 'row',
        borderTopLeftRadius: 100,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 100,
    },
    buttonDelete: {
        backgroundColor: '#0B3E25',
        width: 100,
        height: 37,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        flexDirection: 'row',
        borderTopLeftRadius: 100,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 100,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        marginHorizontal: 5,
    },
    logo1: {
        width: 200,
        height: 200,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#FFF',
        width: '300%',
        position: 'absolute',
    },
    text: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'AnonymousPro_700Bold',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderTopLeftRadius: 100,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 100,
        paddingHorizontal: 10,
        marginVertical: 10,
        width: '100%',
    },
});

export default Config1;
