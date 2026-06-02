import React, {useState, useEffect, useRef, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, Linking, ActivityIndicator, Animated, Easing, Dimensions} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';
import {deliveryApi} from '../api/deliveryApi';
import ScanResultModal from '../components/ScanResultModal';
import AppModal from '../components/AppModal';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const FRAME_SIZE = 250;
const FRAME_TOP = 80;
const SIDE_DIM_WIDTH = (SCREEN_WIDTH - FRAME_SIZE) / 2;

let CameraKitCamera = null;
try {
  const CameraKit = require('react-native-camera-kit');
  CameraKitCamera = CameraKit.CameraScreen || CameraKit.Camera;
} catch (e) {
  // Camera kit not available
}

export default function ScanScreen({navigation}) {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [scannedCode, setScannedCode] = useState(null);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [foundDelivery, setFoundDelivery] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [confirmModal, setConfirmModal] = useState({visible: false});
  const [isFocused, setIsFocused] = useState(true);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Remount camera every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      setScanning(true);
      setModalVisible(false);
      setFoundDelivery(null);
      setNotFound(false);
      setScannedCode(null);
      setLoading(false);

      return () => {
        // Cleanup when screen loses focus
        setIsFocused(false);
        setScanning(false);
      };
    }, []),
  );

  useEffect(() => {
    requestPermission();
  }, []);

  // Animate scan line up and down continuously
  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scanLineAnim.stopAnimation();
    }
  }, [scanning]);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasPermission(isGranted);
        setCameraReady(isGranted && CameraKitCamera !== null);
      } catch (err) {
        setHasPermission(false);
      }
    } else {
      setHasPermission(true);
      setCameraReady(CameraKitCamera !== null);
    }
  };

  const onBarcodeScan = event => {
    if (!loading && !modalVisible && scanning) {
      const code = event?.nativeEvent?.codeStringValue || event?.nativeEvent?.codeValue || event?.nativeEvent?.value;
      if (code) {
        lookupDelivery(code.trim());
      }
    }
  };

  const lookupDelivery = async code => {
    setLoading(true);
    setScanning(false);
    setScannedCode(code);

    try {
      const res = await deliveryApi.scanLookup(code);
      if (res.success && res.data) {
        setFoundDelivery(res.data);
        setNotFound(false);
      } else {
        setNotFound(true);
        setFoundDelivery(null);
      }
    } catch (err) {
      setNotFound(true);
      setFoundDelivery(null);
    } finally {
      setLoading(false);
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setFoundDelivery(null);
    setNotFound(false);
    setScannedCode(null);
    setLoading(false);
    // Briefly unmount and remount camera to reset
    setIsFocused(false);
    setTimeout(() => {
      setIsFocused(true);
      setScanning(true);
    }, 200);
  };

  const handleViewDetails = () => {
    setModalVisible(false);
    if (foundDelivery) {
      navigation.navigate('DeliveryDetail', {deliveryId: foundDelivery._id});
    }
  };

  const handleQuickDeliver = () => {
    setModalVisible(false);
    if (foundDelivery) {
      navigation.navigate('POD', {deliveryId: foundDelivery._id});
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Scan Package</Text>
            <Text style={styles.headerSub}>Scan delivery barcode or QR</Text>
          </View>
        </View>
        <View style={styles.permissionView}>
          <Icon name="camera-off" size={48} color={COLORS.MUTED} />
          <Text style={styles.permissionText}>Camera permission required</Text>
          <Text style={styles.permissionSubText}>
            We need camera access to scan delivery barcodes
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsLink} onPress={() => Linking.openSettings()}>
            <Text style={styles.settingsLinkText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Scan Package</Text>
          <Text style={styles.headerSub}>Scan barcode to view delivery</Text>
        </View>
        <TouchableOpacity
          style={styles.flashBtn}
          onPress={() => setFlashOn(!flashOn)}>
          <Icon name={flashOn ? 'zap' : 'zap-off'} size={16} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Camera Area */}
      <View style={styles.cameraArea}>
        {cameraReady && scanning && isFocused && CameraKitCamera && (
          <CameraKitCamera
            style={StyleSheet.absoluteFill}
            scanBarcode={true}
            onReadCode={onBarcodeScan}
            showFrame={false}
            torchMode={flashOn ? 'on' : 'off'}
            codeTypes={['code128', 'code39', 'code93', 'ean13', 'ean8', 'qr', 'upce', 'pdf417', 'datamatrix', 'aztec']}
          />
        )}

        {!cameraReady && (
          <View style={styles.fallbackCamera}>
            <Icon name="camera" size={40} color="rgba(255,255,255,0.3)" />
            <Text style={styles.fallbackText}>Camera initializing...</Text>
          </View>
        )}

        {/* Dim overlay - top */}
        <View style={styles.dimTop} pointerEvents="none" />
        {/* Dim overlay - left */}
        <View style={styles.dimLeft} pointerEvents="none" />
        {/* Dim overlay - right */}
        <View style={styles.dimRight} pointerEvents="none" />
        {/* Dim overlay - bottom */}
        <View style={styles.dimBottom} pointerEvents="none" />

        {/* Scan Frame */}
        <View style={styles.scanFrameWrap} pointerEvents="none">
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            {scanning && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 240],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
          </View>
        </View>

        {/* Hint text below scan frame */}
        <View style={styles.hintWrap} pointerEvents="none">
          {loading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Looking up delivery...</Text>
            </View>
          ) : scanning ? (
            <Text style={styles.scanHint}>
              Align barcode or QR code within the frame
            </Text>
          ) : null}
        </View>
      </View>

      {/* Bottom info */}
      <View style={styles.bottomInfo}>
        <View style={styles.tipsRow}>
          <View style={styles.tip}>
            <Icon name="zap" size={14} color={COLORS.WARNING} />
            <Text style={styles.tipText}> Toggle flash for low light</Text>
          </View>
          <View style={styles.tip}>
            <IconMC name="cube-scan" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.tipText}> Hold steady & focus</Text>
          </View>
        </View>

        <Text style={styles.instruction}>
          Point camera at the DC barcode label on the package
        </Text>
      </View>

      {/* Scan Result Modal */}
      <ScanResultModal
        visible={modalVisible}
        delivery={foundDelivery}
        notFound={notFound}
        scannedCode={scannedCode}
        onClose={handleCloseModal}
        onViewDetails={handleViewDetails}
        onMarkDelivered={handleQuickDeliver}
      />

      {/* Confirm Modal */}
      <AppModal
        visible={confirmModal.visible}
        type={confirmModal.type || 'warning'}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText || 'Yes, Confirm'}
        cancelText={confirmModal.confirmText ? null : 'Cancel'}
        onConfirm={confirmModal.onConfirm || (() => setConfirmModal({visible: false}))}
        onCancel={() => setConfirmModal({visible: false})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0F0F0F'},
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {fontSize: 18, fontWeight: '700', color: COLORS.WHITE},
  headerSub: {fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2},
  flashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraArea: {flex: 1, position: 'relative', backgroundColor: '#000'},
  fallbackCamera: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  fallbackText: {color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10},
  // Dim overlay - top portion (above scan window)
  dimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: FRAME_TOP,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  // Dim overlay - bottom portion (below scan window)
  dimBottom: {
    position: 'absolute',
    top: FRAME_TOP + FRAME_SIZE,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  // Dim overlay - left side of scan window
  dimLeft: {
    position: 'absolute',
    top: FRAME_TOP,
    height: FRAME_SIZE,
    left: 0,
    width: SIDE_DIM_WIDTH,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  // Dim overlay - right side of scan window
  dimRight: {
    position: 'absolute',
    top: FRAME_TOP,
    height: FRAME_SIZE,
    right: 0,
    width: SIDE_DIM_WIDTH,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  // Wrap that positions the scan frame
  scanFrameWrap: {
    position: 'absolute',
    top: FRAME_TOP,
    left: 0,
    right: 0,
    height: FRAME_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: COLORS.PRIMARY,
  },
  topLeft: {top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4},
  topRight: {top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4},
  bottomLeft: {bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4},
  bottomRight: {bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4},
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 2,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 0},
    elevation: 10,
  },
  hintWrap: {
    position: 'absolute',
    top: FRAME_TOP + FRAME_SIZE + 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingOverlay: {
    marginTop: 24,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.WHITE,
    fontSize: 13,
    marginTop: 10,
    fontWeight: '600',
  },
  bottomInfo: {
    backgroundColor: '#0F0F0F',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  tipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  instruction: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  permissionView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  permissionText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.WHITE,
    marginTop: 16,
  },
  permissionSubText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 6,
  },
  permissionBtn: {
    marginTop: 20,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permissionBtnText: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: 13,
  },
  settingsLink: {marginTop: 14},
  settingsLinkText: {
    color: '#2196F3',
    fontSize: 13,
    fontWeight: '600',
  },
});
