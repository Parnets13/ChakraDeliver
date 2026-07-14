import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import {COLORS} from '../theme/colors';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

const {height} = Dimensions.get('window');

export default function SelectUserTypeScreen({navigation}) {
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide   = useRef(new Animated.Value(-20)).current;
  const card1Opacity  = useRef(new Animated.Value(0)).current;
  const card1Slide    = useRef(new Animated.Value(30)).current;
  const card2Opacity  = useRef(new Animated.Value(0)).current;
  const card2Slide    = useRef(new Animated.Value(30)).current;
  const press1        = useRef(new Animated.Value(1)).current;
  const press2        = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {toValue: 1, duration: 500, useNativeDriver: true}),
      Animated.spring(headerSlide,   {toValue: 0, friction: 7, useNativeDriver: true}),
    ]).start();

    setTimeout(() =>
      Animated.parallel([
        Animated.timing(card1Opacity, {toValue: 1, duration: 380, useNativeDriver: true}),
        Animated.spring(card1Slide,   {toValue: 0, friction: 7, tension: 45, useNativeDriver: true}),
      ]).start(), 320);

    setTimeout(() =>
      Animated.parallel([
        Animated.timing(card2Opacity, {toValue: 1, duration: 380, useNativeDriver: true}),
        Animated.spring(card2Slide,   {toValue: 0, friction: 7, tension: 45, useNativeDriver: true}),
      ]).start(), 460);
  }, []);

  const pressIn  = r => Animated.spring(r, {toValue: 0.97, friction: 5, useNativeDriver: true}).start();
  const pressOut = r => Animated.spring(r, {toValue: 1,    friction: 5, useNativeDriver: true}).start();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} translucent />

      {/* Red top half */}
      <View style={styles.topBg}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      {/* ── HEADER: Logo + Brand ──────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.header,
          {opacity: headerOpacity, transform: [{translateY: headerSlide}]},
        ]}>

        {/* Logo — small white box */}
        <View style={styles.logoBox}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.brandName}>ChakraDeliver</Text>
        <Text style={styles.brandSub}>Sri Chakra Industries</Text>
      </Animated.View>

      {/* ── WHITE PANEL ───────────────────────────────────────────────── */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Who are you?</Text>
        <Text style={styles.panelSub}>Select your role to continue</Text>

        {/* ═══ EMPLOYEE CARD — horizontal row ════════════════════════ */}
        <Animated.View
          style={{
            opacity: card1Opacity,
            transform: [{translateY: card1Slide}, {scale: press1}],
            marginBottom: 14,
          }}>
          <TouchableOpacity
            style={[styles.card, {borderColor: COLORS.PRIMARY + '30'}]}
            onPress={() => navigation.navigate('EmployeeRegistration')}
            onPressIn={() => pressIn(press1)}
            onPressOut={() => pressOut(press1)}
            activeOpacity={1}>

            {/* LEFT — icon */}
            <View style={[styles.iconWrap, {backgroundColor: COLORS.LIGHT_RED}]}>
              <Icon name="user" size={24} color={COLORS.PRIMARY} />
            </View>

            {/* CENTER — text */}
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Employee</Text>
              <Text style={styles.cardSub}>Register & Login</Text>
            </View>

            {/* RIGHT — arrow */}
            <View style={[styles.arrowWrap, {borderColor: COLORS.PRIMARY + '40'}]}>
              <Icon name="chevron-right" size={18} color={COLORS.PRIMARY} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ═══ DELIVERY LOGISTICS CARD — horizontal row ══════════════ */}
        <Animated.View
          style={{
            opacity: card2Opacity,
            transform: [{translateY: card2Slide}, {scale: press2}],
            marginBottom: 14,
          }}>
          <TouchableOpacity
            style={[styles.card, {borderColor: COLORS.WARNING + '35'}]}
            onPress={() => navigation.navigate('DeliveryLogisticsRegistration')}
            onPressIn={() => pressIn(press2)}
            onPressOut={() => pressOut(press2)}
            activeOpacity={1}>

            {/* LEFT — icon */}
            <View style={[styles.iconWrap, {backgroundColor: '#FFF3E0'}]}>
              <IconMC name="truck-fast-outline" size={26} color={COLORS.WARNING} />
            </View>

            {/* CENTER — text */}
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Delivery Logistics</Text>
              <Text style={styles.cardSub}>Login with Mobile Number</Text>
            </View>

            {/* RIGHT — arrow */}
            <View style={[styles.arrowWrap, {borderColor: COLORS.WARNING + '45'}]}>
              <Icon name="chevron-right" size={18} color={COLORS.WARNING} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footer}>v1.0.0 · Sri Chakra Industries</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: COLORS.PRIMARY},

  /* Red top */
  topBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.46,
    backgroundColor: COLORS.PRIMARY,
  },
  circle1: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -70, left: -60,
  },
  circle2: {
    position: 'absolute',
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: 20, right: -40,
  },

  /* Header */
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 52 : 66,
    paddingBottom: 28,
  },
  logoBox: {
    width: 130,
    height: 55,
    borderRadius: 18,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  logoImg: {
    width: 100,
    height: 90,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.WHITE,
    letterSpacing: 0.3,
  },
  brandSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 3,
    fontWeight: '500',
  },

  /* White panel */
  panel: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  panelSub: {
    fontSize: 13,
    color: COLORS.MUTED,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },

  /* ── Horizontal card ──────────────────────────────────────────────── */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },

  /* Left icon circle */
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  /* Center text */
  cardText: {flex: 1},
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '500',
  },

  /* Right arrow box */
  arrowWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.MUTED,
    marginTop: 'auto',
    paddingTop: 16,
  },
});
