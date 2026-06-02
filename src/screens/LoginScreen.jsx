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
  Easing,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {COLORS} from '../theme/colors';
import {useAuthStore} from '../store/authStore';

const {width, height} = Dimensions.get('window');

export default function LoginScreen({navigation}) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const otpRef = useRef(null);
  const scrollRef = useRef(null);

  const {sendOtp, verifyOtp, isLoading, error, clearError} = useAuthStore();

  const imageScale = useRef(new Animated.Value(0.6)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(40)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(imageScale, {
        toValue: 1, friction: 5, tension: 40, useNativeDriver: true,
      }),
      Animated.timing(imageOpacity, {
        toValue: 1, duration: 700, useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1, duration: 500, useNativeDriver: true,
        }),
        Animated.spring(formSlide, {
          toValue: 0, friction: 7, tension: 40, useNativeDriver: true,
        }),
      ]).start();
    }, 400);
  }, []);

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    clearError();
    try {
      const res = await sendOtp(phone);
      setOtpSent(true);
      // In dev mode, auto-fill OTP if returned
      if (res.otp) setOtp(res.otp);
      setTimeout(() => {
        otpRef.current?.focus();
        scrollRef.current?.scrollToEnd({animated: true});
      }, 300);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 4) return;
    clearError();
    try {
      await verifyOtp(phone, otp);
      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Image */}
        <View style={styles.imageSection}>
          <Animated.Image
            source={require('../assets/login image.png')}
            style={[
              styles.heroImage,
              {opacity: imageOpacity, transform: [{scale: imageScale}]},
            ]}
            resizeMode="cover"
          />
        </View>

        {/* Form */}
        <Animated.View
          style={[
            styles.formSection,
            {opacity: formOpacity, transform: [{translateY: formSlide}]},
          ]}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.loginSubtext}>
            Sign in to manage your deliveries
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Phone */}
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={styles.inputRow}>
            <View style={styles.countryCode}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryText}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number"
              placeholderTextColor="#AAA"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              editable={!otpSent}
            />
          </View>

          {/* OTP */}
          {otpSent && (
            <View style={styles.otpSection}>
              <Text style={styles.inputLabel}>Enter OTP</Text>
              <TextInput
                ref={otpRef}
                style={styles.otpInput}
                placeholder="Enter 4-digit OTP"
                placeholderTextColor="#AAA"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                maxLength={4}
              />
              <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }}>
                <Text style={styles.resendText}>
                  Didn't receive?{' '}
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Button */}
          <TouchableOpacity
            style={[
              styles.button,
              ((!otpSent && phone.length < 10) || (otpSent && otp.length < 4) || isLoading)
                ? styles.buttonDisabled
                : null,
            ]}
            onPress={otpSent ? handleVerify : handleSendOtp}
            disabled={(!otpSent && phone.length < 10) || (otpSent && otp.length < 4) || isLoading}
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.WHITE} size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {otpSent ? 'Verify & Login' : 'Send OTP'}
                </Text>
                <Text style={styles.buttonArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Footer */}
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
  container: {flex: 1, backgroundColor: '#F0F0F0'},
  scrollContent: {flexGrow: 1, backgroundColor: '#F0F0F0'},
  imageSection: {
    height: height * 0.44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  heroImage: {width: width * 1.2, height: '100%'},
  formSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
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
  welcomeText: {fontSize: 24, fontWeight: '800', color: COLORS.TEXT},
  loginSubtext: {fontSize: 13, color: COLORS.MUTED, marginTop: 3, marginBottom: 16},
  errorBox: {
    backgroundColor: COLORS.LIGHT_RED,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {fontSize: 12, color: COLORS.FAILED, fontWeight: '600'},
  inputLabel: {fontSize: 13, fontWeight: '700', color: COLORS.TEXT, marginBottom: 8},
  inputRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 13,
    marginRight: 8,
  },
  flag: {fontSize: 16, marginRight: 4},
  countryText: {fontSize: 14, fontWeight: '700', color: COLORS.TEXT},
  phoneInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.TEXT,
    backgroundColor: COLORS.BG,
    letterSpacing: 1,
    fontWeight: '500',
  },
  otpSection: {marginBottom: 16},
  otpInput: {
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 18,
    color: COLORS.TEXT,
    backgroundColor: COLORS.BG,
    letterSpacing: 8,
    fontWeight: '700',
    textAlign: 'center',
  },
  resendText: {fontSize: 12, color: COLORS.MUTED, textAlign: 'center', marginTop: 10},
  resendLink: {color: COLORS.PRIMARY, fontWeight: '700'},
  button: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  buttonDisabled: {opacity: 0.4, elevation: 0},
  buttonText: {color: COLORS.WHITE, fontSize: 16, fontWeight: '700'},
  buttonArrow: {color: COLORS.WHITE, fontSize: 18, marginLeft: 8},
  footerText: {fontSize: 11, color: COLORS.MUTED, textAlign: 'center', marginTop: 16},
  footerLink: {color: '#2196F3', fontWeight: '700'},
});
