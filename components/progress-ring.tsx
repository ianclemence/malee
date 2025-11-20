import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
    radius?: number;
    stroke?: number;
    progress: number;
    color?: string;
    trackColor?: string;
}

export function ProgressRing({
    radius = 16,
    stroke = 3,
    progress,
    color = "#F1FF00",
    trackColor = "transparent"
}: ProgressRingProps) {
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const animatedProgress = useSharedValue(progress);

    useEffect(() => {
        // Clamp progress between 0 and 1
        const clamped = Math.max(0, Math.min(1, progress));
        animatedProgress.value = withTiming(clamped, { duration: 500 });
    }, [progress]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - animatedProgress.value * circumference;
        return {
            strokeDashoffset,
        };
    });

    return (
        <View style={{ width: radius * 2, height: radius * 2, transform: [{ rotate: '-90deg' }] }}>
            <Svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
                <G>
                    <Circle
                        cx={radius}
                        cy={radius}
                        r={normalizedRadius}
                        stroke={trackColor}
                        strokeWidth={stroke}
                        fill="transparent"
                    />
                    <AnimatedCircle
                        cx={radius}
                        cy={radius}
                        r={normalizedRadius}
                        stroke={color}
                        strokeWidth={stroke}
                        strokeDasharray={`${circumference} ${circumference}`}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </G>
            </Svg>
        </View>
    );
}
