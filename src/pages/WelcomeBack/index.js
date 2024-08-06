import { React } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';

import * as Animatable from 'react-native-animatable'
import { useNavigation } from '@react-navigation/native'

export default function WelcomeBack() {
    const navigation = useNavigation();
    

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.containerHeader}>
                <Animatable.View animation="fadeInDown" delay={500}>
                <Image style={styles.logo1} source={require('../../../assets/icon.png')}></Image>
             </Animatable.View>
            </View>

            <Animatable.View animation="fadeInUp" style={styles.containerForm}>
                <Text style={styles.title}>Boas-Vindas!</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate("SingUp")}
                    >
                        <Text style={styles.buttonText}>Solicitar Acesso</Text>
                    </TouchableOpacity>   
                </View>
                <View>
                    <TouchableOpacity
                        style={styles.buttonSing}
                    >
                        <Text style={styles.textSing}>Dúvidas? Ajude-me.</Text>
                    </TouchableOpacity>
                </View>
            </Animatable.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B3E25'
    },
    title: {
        fontSize: 36,
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
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    containerHeader: {
        marginTop: '5%',
        marginBottom: '5%',
        display: 'flex',
        alignItems: 'center',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    containerForm: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#FFF',
        borderTopLeftRadius: 100,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
    },
    button: {
        backgroundColor: '#0B3E25',
        width: 334,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
        borderTopLeftRadius: 100,
        borderTopRightRadius: 0,
        borderBottomLeftRadius:35,
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
    },
    logo1: {
        width: 200,
        height: 200
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