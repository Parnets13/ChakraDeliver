import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {COLORS} from '../theme/colors';
import {useAuthStore} from '../store/authStore';
import Icon from 'react-native-vector-icons/Feather';

const {width, height} = Dimensions.get('window');

export default function LoginScreen({navigation, route}) {
  const [email,    setEmail]    = useState(route?.params?.prefillEmail || 'chakradelivery@gmail.com');
  const [password, setPassword] = useState('chakradelivery@123');
  const [showPwd,  setShowPwd]  = useState(false);

  const {loginWithEmail, skipOtpVerification, isLoading, error, clearError} = useAuthStore();

  const imageScale   = useRef(new Animated.Value(0.6)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const formSlide    = useRef(new Animated.Value(40)).current;
  const formOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(imageScale,   {toValue: 1, friction: 5, tension: 40, useNativeDriver: true}),
      Animated.timing(imageOpacity, {toValue: 1, duration: 700, useNativeDriver: true}),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(formOpacity, {toValue: 1, duration: 500, useNativeDriver: true}),
        Animated.spring(formSlide,   {toValue: 0, friction: 7, tension: 40, useNativeDriver: true}),
      ]).start();
    }, 400);
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    clearError();
    try {
      const res = await loginWithEmail(email.trim(), password);
      // login succeeded → now send OTP for 2-step verification
      try {
        const otpRes = await sendOtp({
          email: email.trim(),
          phone: res.user?.phone || '',
        });
        // Navigate to OTP screen — pass phone resolved by backend + dev OTP hint
        navigation.replace('OTPVerification', {
          phone:    otpRes.phone || res.user?.phone || '',
          email:    email.trim(),
          devOtp:   otpRes.otp,       // only present in development mode
        });
      } catch (otpErr) {
        // No phone registered for this account → skip OTP, go straight to Main
        console.warn('[OTP] Skipping OTP step:', otpErr.message);
        await skipOtpVerification();
        navigation.replace('Main');
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong. Please try again.';
      if (msg.toLowerCase().includes('no account found') || msg.toLowerCase().includes('please register')) {
        Alert.alert(
          'Account Not Found',
          msg,
          [
            {text: 'Register as Employee',  onPress: () => navigation.navigate('EmployeeRegistration')},
            {text: 'Register as Delivery',  onPress: () => navigation.navigate('DeliveryLogisticsRegistration')},
            {text: 'Cancel', style: 'cancel'},
          ],
        );
      } else {
        Alert.alert('Login Failed', msg);
      }
    }
  };

  const isDisabled = !email.trim() || password.length < 6 || isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Hero image + logo */}
        <View style={styles.imageSection}>
          <Animated.Image
            source={require('../assets/login image.png')}
            style={[styles.heroImage, {opacity: imageOpacity, transform: [{scale: imageScale}]}]}
            resizeMode="cover"
          />
          {/* <View style={styles.logoWrap}>
            <Image source={require('../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
          </View> */}
        </View>

        {/* Form panel */}
        <Animated.View
          style={[styles.formSection, {opacity: formOpacity, transform: [{translateY: formSlide}]}]}>

          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.loginSubtext}>Sign in to manage your deliveries</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={14} color={COLORS.FAILED} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWrap}>
            <Icon name="mail" size={16} color={COLORS.MUTED} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="#AAA"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrap}>
            <Icon name="lock" size={16} color={COLORS.MUTED} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your password"
              placeholderTextColor="#AAA"
              secureTextEntry={!showPwd}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPwd(p => !p)} style={styles.eyeBtn}>
              <Icon name={showPwd ? 'eye-off' : 'eye'} size={18} color={COLORS.MUTED} />
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isDisabled}
            activeOpacity={0.8}>
            {isLoading
              ? <ActivityIndicator color={COLORS.WHITE} size="small" />
              : (
                <>
                  <Text style={styles.buttonText}>Login</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </>
              )
            }
          </TouchableOpacity>

          {/* Register links */}
          <View style={styles.registerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('EmployeeRegistration')}>
              <Text style={styles.registerLink}>
                <Text style={styles.registerGray}>Employee? </Text>
                Register here
              </Text>
            </TouchableOpacity>
            <View style={styles.dot} />
            <TouchableOpacity onPress={() => navigation.navigate('DeliveryLogisticsRegistration')}>
              <Text style={styles.registerLink}>
                <Text style={styles.registerGray}>Delivery? </Text>
                Register here
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms & Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:     {flex: 1, backgroundColor: '#F0F0F0'},
  scrollContent: {flexGrow: 1, backgroundColor: '#F0F0F0'},

  imageSection: {
    height: height * 0.42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  heroImage: {width: width * 1.2, height: '100%'},
  logoWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  logoImg: {width: 42, height: 42},

  formSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  welcomeText:  {fontSize: 24, fontWeight: '800', color: COLORS.TEXT},
  loginSubtext: {fontSize: 13, color: COLORS.MUTED, marginTop: 3, marginBottom: 18},

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.LIGHT_RED,
    padding: 10, borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: COLORS.FAILED,
  },
  errorText: {fontSize: 12, color: COLORS.FAILED, fontWeight: '600', flex: 1},

  inputLabel: {fontSize: 13, fontWeight: '700', color: COLORS.TEXT, marginBottom: 8},

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.BG,
    borderWidth: 1.5, borderColor: COLORS.BORDER,
    borderRadius: 11, marginBottom: 16,
    overflow: 'hidden',
  },
  inputIcon: {paddingHorizontal: 12},
  textInput: {
    flex: 1, paddingVertical: 13, paddingRight: 14,
    fontSize: 15, color: COLORS.TEXT, fontWeight: '500',
  },
  eyeBtn: {paddingHorizontal: 14},

  button: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginBottom: 20,
  },
  buttonDisabled: {opacity: 0.4, elevation: 0},
  buttonText:  {color: COLORS.WHITE, fontSize: 16, fontWeight: '700'},
  buttonArrow: {color: COLORS.WHITE, fontSize: 18, marginLeft: 8},

  registerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, marginBottom: 16,
    flexWrap: 'wrap',
  },
  registerLink: {fontSize: 12, color: COLORS.PRIMARY, fontWeight: '700'},
  registerGray: {color: COLORS.MUTED, fontWeight: '400'},
  dot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: COLORS.BORDER,
  },

  footerText: {fontSize: 11, color: COLORS.MUTED, textAlign: 'center'},
  footerLink: {color: '#2196F3', fontWeight: '700'},
});
