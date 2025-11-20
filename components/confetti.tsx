import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const COLORS = ['#F1FF00', '#FF4444', '#4444FF', '#00CC00', '#FF00FF'];

interface ParticleProps {
    index: number;
}

const Particle = ({ index }: ParticleProps) => {
    const x = useSharedValue(width / 2);
    const y = useSharedValue(-50);
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        const randomX = Math.random() * width;
        const duration = 2000 + Math.random() * 1000;
        const delay = Math.random() * 500;

        x.value = withDelay(delay, withTiming(randomX, { duration, easing: Easing.out(Easing.quad) }));
        y.value = withDelay(delay, withTiming(height + 50, { duration, easing: Easing.in(Easing.quad) }));
        rotation.value = withDelay(delay, withTiming(Math.random() * 360 * 2, { duration }));
        opacity.value = withDelay(delay + duration - 500, withTiming(0, { duration: 500 }));
    }, []);

    const style = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: x.value },
                { translateY: y.value },
                { rotate: `${rotation.value}deg` },
            ],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                style,
                { backgroundColor: COLORS[index % COLORS.length] },
            ]}
        />
    );
};

export const Confetti = () => {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: 50 }).map((_, i) => (
                <Particle key={i} index={i} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        top: 0,
        left: 0,
    },
});
