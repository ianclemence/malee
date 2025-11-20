import React from 'react';
import { Pressable, Modal as RNModal, StyleSheet, Text, View } from 'react-native';

interface ModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

const ACCENT = "#F1FF00";
const TEXT = "#000000";

export function CustomModal({
    visible,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isDestructive = false,
}: ModalProps) {
    return (
        <RNModal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.centeredView}>
                <Pressable style={styles.backdrop} onPress={onCancel} />
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalText}>{message}</Text>
                    <View style={styles.buttonRow}>
                        <Pressable
                            style={[styles.button, styles.buttonCancel]}
                            onPress={onCancel}
                        >
                            <Text style={styles.textCancel}>{cancelText}</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, isDestructive ? styles.buttonDestructive : styles.buttonConfirm]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.textConfirm, isDestructive && styles.textDestructive]}>{confirmText}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
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
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
        color: TEXT,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        color: TEXT,
        opacity: 0.7,
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        borderRadius: 16,
        padding: 14,
        elevation: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonCancel: {
        backgroundColor: '#F5F5F5',
    },
    buttonConfirm: {
        backgroundColor: ACCENT,
    },
    buttonDestructive: {
        backgroundColor: '#FFE5E5',
    },
    textCancel: {
        color: TEXT,
        fontWeight: '700',
        fontSize: 16,
    },
    textConfirm: {
        color: TEXT,
        fontWeight: '700',
        fontSize: 16,
    },
    textDestructive: {
        color: '#D93025',
    },
});
