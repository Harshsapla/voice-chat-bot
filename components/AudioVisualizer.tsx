import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  withSequence,
} from 'react-native-reanimated';

interface AudioVisualizerProps {
  isActive: boolean;
}

const BAR_COUNT = 20;

export default function AudioVisualizer({ isActive }: AudioVisualizerProps) {
  const animationValues = Array.from({ length: BAR_COUNT }, () => useSharedValue(0));

  useEffect(() => {
    if (isActive) {
      animationValues.forEach((value, index) => {
        const delay = index * 100;
        value.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 300 + Math.random() * 400 }),
            withTiming(0.2, { duration: 300 + Math.random() * 400 })
          ),
          -1,
          true
        );
      });
    } else {
      animationValues.forEach((value) => {
        value.value = withTiming(0, { duration: 300 });
      });
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {animationValues.map((animatedValue, index) => {
        const animatedStyle = useAnimatedStyle(() => {
          const height = interpolate(animatedValue.value, [0, 1], [4, 40]);
          const opacity = interpolate(animatedValue.value, [0, 1], [0.3, 1]);
          return {
            height,
            opacity,
          };
        });

        return (
          <Animated.View
            key={index}
            style={[styles.bar, animatedStyle]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: 20,
  },
  bar: {
    width: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
    marginHorizontal: 1,
  },
});