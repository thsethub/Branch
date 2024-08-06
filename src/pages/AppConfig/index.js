import React from 'react';
import { SafeAreaView, View, StyleSheet, Image, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

const AppConfig = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.containerHeader}>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <Image style={styles.logo1} source={require('../../../assets/icon.png')} />
                </Animatable.View>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={[styles.divider]} />
                        <Text style={styles.text}>Configurações de Aplicativo</Text>
                    </View>
                </Animatable.View>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Animatable.View animation="fadeInUp" style={styles.containerForm}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Config2')}
                    >
                        <Text style={styles.buttonText}>Configurações de Broker</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Config1')}
                    >
                        <Text style={styles.buttonText}>Configurações de Perfil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Config3')}
                    >
                        <Text style={styles.buttonText}>Configurações de Ambientes</Text>
                    </TouchableOpacity>
                </Animatable.View>
            </ScrollView>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'AnonymousPro_700Bold',
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
});


export default AppConfig;