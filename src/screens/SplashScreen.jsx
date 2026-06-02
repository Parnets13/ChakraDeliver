import React, {useEffect, useRef} from 'react';
import {View, Image, StyleSheet, Text, Animated, Dimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS} from '../theme/colors';
import {useAuthStore} from '../store/authStore';

const {width, height} = Dimensions.get('window');

export default function SplashScreen({navigation}) {
  const loadProfile = useAuthStore(state => state.loadProfile);

  const bgOpacity = useRef(new Animated.Value(0)).current;
  const bgScale = useRef(new Animated.Value(1.1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;
  const dotScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animations
    Animated.parallel([
      Animated.timing(bgOpacity, {toValue: 1, duration: 1000, useNativeDriver: true}),
      Animated.timing(bgScale, {toValue: 1, duration: 2000, useNativeDriver: true}),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {toValue: 1, duration: 600, useNativeDriver: true}),
        Animated.spring(contentSlide, {toValue: 0, friction: 6, useNativeDriver: true}),
      ]).start();
    }, 500);

    setTimeout(() => {
      Animated.spring(dotScale, {toValue: 1, friction: 5, useNativeDriver: true}).start();
    }, 1000);

    // Check auth after animations
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const success = await loadProfile();
        if (success) {
          navigation.replace('Main');
          return;
        }
      }
      navigation.replace('Login');
    };

    checkAuth();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/splashbackground.png')}
        style={[styles.fullBg, {opacity: bgOpacity, transform: [{scale: bgScale}]}]}
        resizeMode="cover"
      />

      <Animated.View
        style={[styles.content, {opacity: contentOpacity, transform: [{translateY: contentSlide}]}]}>
        <Text style={styles.appName}>ChakraDeliver</Text>
        <Text style={styles.companyName}>Sri Chakra Industries</Text>
        <View style={styles.divider} />
        <Text style={styles.estd}>Established 2010</Text>
        <Text style={styles.description}>
          Leading manufacturer & supplier of pressure cookers and solar cookers.
          Delivering quality products across India with trust and excellence.
        </Text>

        <Animated.View style={[styles.dotsWrap, {transform: [{scale: dotScale}]}]}>
          <LoadingDots />
        </Animated.View>
      </Animated.View>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {toValue: 1, duration: 350, delay, useNativeDriver: true}),
          Animated.timing(dot, {toValue: 0.3, duration: 350, useNativeDriver: true}),
        ]),
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 120);
    animate(dot3, 240);
  }, []);

  return (
    <View style={styles.dots}>
      <Animated.View style={[styles.dot, {opacity: dot1}]} />
      <Animated.View style={[styles.dot, {opacity: dot2}]} />
      <Animated.View style={[styles.dot, {opacity: dot3}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.WHITE},
  fullBg: {position: 'absolute', top: 0, left: 0, width, height},
  content: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  appName: {fontSize: 32, fontWeight: '800', color: COLORS.PRIMARY},
  companyName: {fontSize: 16, fontWeight: '700', color: COLORS.TEXT, marginTop: 8},
  divider: {width: 45, height: 3, backgroundColor: COLORS.PRIMARY, borderRadius: 2, marginVertical: 10},
  estd: {fontSize: 12, color: COLORS.MUTED, fontWeight: '500'},
  description: {fontSize: 13, color: '#555', textAlign: 'center', marginTop: 12, lineHeight: 20},
  dotsWrap: {marginTop: 22},
  dots: {flexDirection: 'row'},
  dot: {width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.PRIMARY, marginHorizontal: 5},
  version: {position: 'absolute', bottom: 20, alignSelf: 'center', fontSize: 11, color: COLORS.MUTED},
});
