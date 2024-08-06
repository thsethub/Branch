import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';


export default function Welcome({route}) {
    const navigation = useNavigation();
    const {nome} = route.params;

    const nomeArray = nome.split(' ');
    const primeiroNome = nomeArray[0];


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.containerHeader}>
                <Animatable.View animation="fadeInDown" delay={500}>
                    <Image style={styles.logo1} source={require('../../../assets/icon.png')} />
                </Animatable.View>
            </View>

            <Animatable.View animation="fadeInUp" style={styles.containerForm}>
                <Text style={styles.title}>Bem-Vindo, {primeiroNome}!</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate("Ambientes")}
                    >
                        <Text style={styles.buttonText}>Acessar</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity
                        style={styles.buttonSing}
                        onPress={() => navigation.navigate("NovoAmbiente")}
                    >
                        <Text style={styles.textSing}>Solicitar acesso!</Text>
                    </TouchableOpacity>
                </View>
            </Animatable.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B3E25',
    },
    title: {
        fontSize: 24,
        color: '#0B3E25',
        fontFamily: 'AnonymousPro_700Bold',
    },
    welcome: {
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'AnonymousPro_400Regular',
        color: 'rgba(0, 0, 0, 0.30)',
        marginBottom: 5,
    },
    containerHeader: {
        marginTop: '5%',
        marginBottom: '5%',
        display: 'flex',
        alignItems: 'center',
    },
    containerForm: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderTopLeftRadius: 100,
    },
    button: {
        backgroundColor: '#0B3E25',
        width: 334,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
        borderTopLeftRadius: 100,
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
        fontSize: 24,
        fontFamily: 'AnonymousPro_700Bold',
    },
    logo1: {
        width: 200,
        height: 200,
    },
    buttonSing: {
        alignItems: 'center',
    },
    textSing: {
        fontSize: 16,
        color: '#0B3E25',
        fontFamily: 'AnonymousPro_700Bold',
    }
});