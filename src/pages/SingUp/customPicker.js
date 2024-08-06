import React, { useState } from 'react';
import { Modal, Text, FlatList, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CustomPicker = ({ items, selectedValue, onValueChange, style, placeholder }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleSelect = (value) => {
        onValueChange(value);
        setModalVisible(false);
    };

    return (
        <View style={style}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between" }}>
                    <Text style={{
                        fontFamily: 'AnonymousPro_400Regular',
                        color: 'rgba(0, 0, 0, 0.61)'
                    }}>
                        {selectedValue || placeholder}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#0B3E25" style={{ marginRight: 20 }} />
                </View>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.button}
                                    onPress={() => handleSelect(item)}>
                                    <View style={{ borderBottomWidth: 1, borderBottomColor: '#0B3E25' }}>
                                        <Text style={{
                                            fontFamily: 'AnonymousPro_400Regular',
                                        }}>{item}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#FFF',
        width: '100%',
        height: 54,
        marginTop: 15
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        maxHeight: Dimensions.get('window').height / 2
    },
});

export default CustomPicker;