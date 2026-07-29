import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onHide: () => void;
}

export function Toast({ message, type = 'success', onHide }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onHide();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onHide]);

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'error';
            case 'info': return 'info';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return '#E6F4EA';
            case 'error': return '#FCE8E6';
            case 'info': return '#E8F0FE';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success': return '#1E8E3E';
            case 'error': return '#D93025';
            case 'info': return '#1967D2';
        }
    };

    return (
        <Animated.View
            entering={FadeInUp.springify()}
            exiting={FadeOutUp}
            style={[styles.container, { backgroundColor: getColor() }]}
        >
            <MaterialIcons name={getIcon()} size={24} color={getIconColor()} />
            <Text style={[styles.text, { color: getIconColor() }]}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Below status bar
        left: 16,
        right: 16,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        zIndex: 1000,
        elevation: 1000,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
});
