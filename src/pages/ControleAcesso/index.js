import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { supabase } from '../../../services/supabase';
import * as Animatable from 'react-native-animatable';
import { contextDeviceId } from '../../../context/contextGlobal/contex';

export default function ControleAcesso({ route }) {
    const { ambienteId } = route.params;
    const deviceId = useContext(contextDeviceId);
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [nomeAmbiente, setNomeAmbiente] = useState('');
    const [loading, setLoading] = useState(true);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [perfil, setPerfil] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPerfil, setSelectedPerfil] = useState(null);
    const [availablePerfis, setAvailablePerfis] = useState([]);
    const [solicitacaoToEdit, setSolicitacaoToEdit] = useState(null);

    useEffect(() => {
        fetchUsuarioLogado();
    }, [deviceId]);

    useEffect(() => {
        if (usuarioLogado) {
            fetchSolicitacoes();
            fetchNomeAmbiente();
        }
    }, [usuarioLogado, ambienteId]);

    const fetchUsuarioLogado = async () => {
        try {
            const { data: usuarioData, error: usuarioError } = await supabase
                .from('usuarios')
                .select('uuid, superuser')
                .eq('uuid', deviceId)
                .single();

            if (usuarioError) {
                console.error('Erro ao buscar usuário logado:', usuarioError);
                return;
            }

            setUsuarioLogado(usuarioData);
        } catch (error) {
            console.error('Erro ao buscar usuário logado:', error.message);
        }
    };

    const fetchSolicitacoes = async () => {
        try {
            setLoading(true);
            const { data: acessosData, error: acessosError } = await supabase
                .from('acessos')
                .select('id, usuario_id, ambiente_id, tipoUsuario, ativado')
                .eq('ambiente_id', ambienteId);

            if (acessosError) {
                console.error('Erro ao buscar solicitações:', acessosError);
                return;
            }

            const solicitacoesComNomes = await Promise.all(acessosData.map(async (solicitacao) => {
                const { data: usuarioData, error: usuarioError } = await supabase
                    .from('usuarios')
                    .select('nome_completo')
                    .eq('uuid', solicitacao.usuario_id)
                    .single();

                if (usuarioError) {
                    console.error('Erro ao buscar nome do usuário:', usuarioError);
                    return solicitacao;
                }

                return {
                    ...solicitacao,
                    nomeUsuario: usuarioData?.nome_completo || 'Usuário desconhecido'
                };
            }));

            let filteredSolicitacoes = solicitacoesComNomes;

            if (!usuarioLogado.superuser) {
                filteredSolicitacoes = solicitacoesComNomes.filter(solicitacao => solicitacao.tipoUsuario !== 'Coordenador');
            }

            setSolicitacoes(filteredSolicitacoes);
        } catch (error) {
            console.error('Erro ao buscar solicitações:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchNomeAmbiente = async () => {
        try {
            const { data: ambienteData, error: ambienteError } = await supabase
                .from('ambientes')
                .select('nome')
                .eq('id', ambienteId)
                .single();

            if (ambienteError) {
                console.error('Erro ao buscar nome do ambiente:', ambienteError);
                return;
            }

            setNomeAmbiente(ambienteData.nome);
        } catch (error) {
            console.error('Erro ao buscar nome do ambiente:', error.message);
        }
    };

    const fetchPerfis = async () => {
        try {
            const { data: perfisData, error: perfisError } = await supabase
                .from('tipoPerfil')
                .select('id, nome');

            if (perfisError) {
                console.error('Erro ao buscar perfis:', perfisError);
                return;
            }

            const filteredPerfis = perfisData.filter(perfil => perfil.nome !== 'Coordenador');
            setAvailablePerfis(filteredPerfis);
        } catch (error) {
            console.error('Erro ao buscar perfis:', error.message);
        }
    };

    const handleEditPerfil = (solicitacao) => {
        setSolicitacaoToEdit(solicitacao);
        fetchPerfis();
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        Alert.alert(
            "Excluir Solicitação",
            "Tem certeza que deseja excluir esta solicitação?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('acessos')
                                .delete()
                                .eq('id', id);

                            if (error) {
                                console.error('Erro ao deletar acesso do usuário:', error.message);
                                return;
                            }

                            const updatedSolicitacoes = solicitacoes.filter(solicitacao => solicitacao.id !== id);
                            setSolicitacoes(updatedSolicitacoes);
                        } catch (error) {
                            console.error('Erro ao deletar acesso do usuário:', error.message);
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    };

    const handleToggleActivation = async (solicitacaoId, ativado) => {
        try {
            const { error } = await supabase
                .from('acessos')
                .update({ ativado })
                .eq('id', solicitacaoId);

            if (error) {
                console.error('Erro ao atualizar status de ativação:', error);
                return;
            }

            fetchSolicitacoes(); // Atualize a lista de solicitações após a alteração
        } catch (error) {
            console.error('Erro ao atualizar status de ativação:', error.message);
        }
    };

    const handleConfirmEditPerfil = async () => {
        if (selectedPerfil) {
            try {
                const { error } = await supabase
                    .from('acessos')
                    .update({ tipoUsuario: selectedPerfil.nome })
                    .eq('id', solicitacaoToEdit.id);

                if (error) {
                    console.error('Erro ao atualizar perfil:', error);
                    Alert.alert('Erro', 'Erro ao atualizar o perfil.');
                    return;
                }

                fetchSolicitacoes();
                setModalVisible(false);
                setSelectedPerfil(null);
                setSolicitacaoToEdit(null);
            } catch (error) {
                console.error('Erro ao atualizar perfil:', error.message);
            }
        } else {
            Alert.alert('Erro', 'Por favor, selecione um perfil.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.containerHeader}>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <Image style={styles.logo1} source={require('../../../assets/icon.png')} />
                </Animatable.View>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={[styles.divider]} />
                        <Text style={styles.text}>{nomeAmbiente}</Text>
                    </View>
                </Animatable.View>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Animatable.View animation="fadeInUp" style={styles.containerForm}>
                    {loading ? (
                        <Text>Carregando...</Text>
                    ) : (
                        solicitacoes.map(solicitacao => (
                            <View style={styles.solicitacaoContainer} key={solicitacao.id}>
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={styles.solicitacaoText}>
                                        {solicitacao.nomeUsuario}
                                    </Text>
                                    <Text style={styles.solicitacaoText}>
                                        Perfil: {solicitacao.tipoUsuario}
                                    </Text>
                                    <TouchableOpacity onPress={() => handleEditPerfil(solicitacao)}>
                                        <Text style={[styles.solicitacaoText, { color: "#0B3E25" }]}>Editar Perfil!</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(solicitacao.id)}>
                                        <Text style={[styles.solicitacaoText, { color: "#0B3E25" }]}>Excluir solicitação!</Text>
                                    </TouchableOpacity>
                                </View>
                                <Switch
                                    value={solicitacao.ativado}
                                    onValueChange={newValue => handleToggleActivation(solicitacao.id, newValue)}
                                    trackColor={{ false: "#cdcdcd", true: "#0B3E25" }}
                                    thumbColor={solicitacao.ativado ? "#fff" : "#fff"}
                                />
                            </View>
                        ))
                    )}
                </Animatable.View>
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Selecione um perfil:</Text>
                        <FlatList
                            data={availablePerfis}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.perfilItem,
                                        selectedPerfil && selectedPerfil.id === item.id ? styles.selectedPerfil : null
                                    ]}
                                    onPress={() => setSelectedPerfil(item)}
                                >
                                    <Text style={styles.perfilText}>{item.nome}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity style={styles.buttonConfirm} onPress={handleConfirmEditPerfil}>
                                <Text style={styles.buttonText}>Confirmar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonCancel} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
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
    solicitacaoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
        paddingHorizontal: 10,
        width: '104%',
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 5,
    },
    solicitacaoText: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.61)',
        fontFamily: 'AnonymousPro_400Regular',
        marginTop: 3,
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
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
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 16,
    },
    perfilItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        width: 300,
        backgroundColor: '#f9f9f9',
    },
    selectedPerfil: {
        backgroundColor: '#d1e7dd',
    },
    perfilText: {
        fontSize: 16,
    },
    buttonGroup: {
        flexDirection: 'row',
        marginTop: 20,
    },
    buttonConfirm: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    buttonCancel: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
    },
});
