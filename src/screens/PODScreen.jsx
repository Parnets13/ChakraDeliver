import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import SignatureScreen from 'react-native-signature-canvas';
import {launchCamera} from 'react-native-image-picker';
import {COLORS} from '../theme/colors';
import {useDeliveryStore} from '../store/deliveryStore';
import AppModal from '../components/AppModal';

export default function PODScreen({route, navigation}) {
  const {deliveryId} = route?.params || {};
  const [signature, setSignature] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [showSignPad, setShowSignPad] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState({visible: false});
  const signRef = useRef(null);

  const uploadPOD = useDeliveryStore(state => state.uploadPOD);

  const handleSignature = sig => {
    setSignature(sig);
    setShowSignPad(false);
  };

  const handleClearSignature = () => {
    setSignature(null);
    if (signRef.current) signRef.current.clearSignature();
  };

  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (result.assets && result.assets[0]) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      setModal({
        visible: true,
        type: 'error',
        title: 'Camera Error',
        message: 'Failed to open camera. Please try again.',
      });
    }
  };

  const handleSubmit = () => {
    if (!signature) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Signature Required',
        message: 'Please capture customer signature before submitting POD.',
      });
      return;
    }
    if (!photo) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Photo Required',
        message: 'Please take a delivery photo before submitting POD.',
      });
      return;
    }

    setModal({
      visible: true,
      type: 'info',
      title: 'Confirm Submit',
      message: 'Submit POD and mark delivery as completed?',
      confirmText: 'Yes, Submit',
      cancelText: 'Cancel',
      onConfirm: doSubmit,
    });
  };

  const doSubmit = async () => {
    setModal({visible: false});
    setSubmitting(true);
    try {
      const success = await uploadPOD(deliveryId, {
        signature,
        photo: photo.uri,
        notes,
        receivedBy,
      });

      if (success) {
        setModal({
          visible: true,
          type: 'success',
          title: 'POD Submitted',
          message: 'Delivery confirmed successfully. Moving back to home.',
          confirmText: 'Done',
          onConfirm: () => {
            setModal({visible: false});
            navigation.navigate('Main');
          },
        });
      } else {
        setModal({
          visible: true,
          type: 'error',
          title: 'Submit Failed',
          message: 'Could not submit POD. Please check your connection and try again.',
        });
      }
    } catch (err) {
      setModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: err.message || 'Something went wrong',
      });
    }
    setSubmitting(false);
  };

  // Signature pad full screen
  if (showSignPad) {
    return (
      <View style={styles.signPadContainer}>
        <View style={styles.signPadHeader}>
          <TouchableOpacity onPress={() => setShowSignPad(false)}>
            <Icon name="x" size={20} color={COLORS.TEXT} />
          </TouchableOpacity>
          <Text style={styles.signPadTitle}>Customer Signature</Text>
          <TouchableOpacity onPress={() => signRef.current?.clearSignature()}>
            <Icon name="refresh-cw" size={18} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
        <SignatureScreen
          ref={signRef}
          onOK={handleSignature}
          onEmpty={() =>
            setModal({
              visible: true,
              type: 'warning',
              title: 'Empty Signature',
              message: 'Please sign before saving.',
            })
          }
          descriptionText=""
          clearText="Clear"
          confirmText="Done"
          webStyle={`
            .m-signature-pad { box-shadow: none; border: none; }
            .m-signature-pad--body { border: 1px solid #E8E8E8; border-radius: 10px; }
            .m-signature-pad--footer { display: none; }
            body, html { height: 100%; }
          `}
          autoClear={false}
          imageType="image/png"
        />
        <TouchableOpacity
          style={styles.signDoneBtn}
          onPress={() => signRef.current?.readSignature()}>
          <Icon name="check" size={16} color={COLORS.WHITE} />
          <Text style={styles.signDoneBtnText}> Save Signature</Text>
        </TouchableOpacity>

        <AppModal
          visible={modal.visible}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          confirmText={modal.confirmText || 'OK'}
          cancelText={modal.cancelText}
          onConfirm={modal.onConfirm || (() => setModal({visible: false}))}
          onCancel={() => setModal({visible: false})}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={16} color={COLORS.WHITE} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Proof of Delivery</Text>
          <Text style={styles.headerSub}>Capture signature & photo</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Signature */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Customer Signature</Text>
              <Text style={styles.cardSub}>Required · Customer must sign</Text>
            </View>
            {signature && (
              <TouchableOpacity onPress={handleClearSignature} style={styles.clearBtnWrap}>
                <Icon name="refresh-cw" size={12} color={COLORS.MUTED} />
                <Text style={styles.clearBtn}> Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.signatureArea}
            onPress={() => setShowSignPad(true)}>
            {signature ? (
              <Image
                source={{uri: signature}}
                style={styles.signatureImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.signPlaceholder}>
                <Icon name="edit-3" size={28} color={COLORS.MUTED} />
                <Text style={styles.placeholderText}>Tap to capture signature</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Photo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Photo</Text>
          <Text style={styles.cardSub}>Required · Photo of delivered package</Text>
          <TouchableOpacity style={styles.photoArea} onPress={handleTakePhoto}>
            {photo ? (
              <Image
                source={{uri: photo.uri}}
                style={styles.photoImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.photoPlaceholderWrap}>
                <Icon name="camera" size={28} color={COLORS.PRIMARY} />
                <Text style={styles.photoPlaceholder}>Tap to capture photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {photo && (
            <View style={styles.photoPreview}>
              <Icon name="check-circle" size={14} color={COLORS.SUCCESS} />
              <Text style={styles.photoName}>
                {' '}{photo.fileName || 'delivery_photo.jpg'}
              </Text>
              <TouchableOpacity onPress={() => setPhoto(null)}>
                <Icon name="x" size={14} color={COLORS.MUTED} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Received By */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Received By</Text>
          <Text style={styles.cardSub}>Optional · Person who received</Text>
          <TextInput
            style={styles.input}
            placeholder="Customer name or designation"
            placeholderTextColor={COLORS.MUTED}
            value={receivedBy}
            onChangeText={setReceivedBy}
          />
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Notes</Text>
          <Text style={styles.cardSub}>Optional · Add any remarks</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="e.g. Left at security desk, gate code 1234..."
            placeholderTextColor={COLORS.MUTED}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!signature || !photo || submitting) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!signature || !photo || submitting}>
          {submitting ? (
            <ActivityIndicator color={COLORS.WHITE} size="small" />
          ) : (
            <View style={styles.btnContent}>
              <Icon name="upload" size={16} color={COLORS.WHITE} />
              <Text style={styles.submitBtnText}> Submit POD & Confirm Delivery</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{height: 30}} />
      </ScrollView>

      <AppModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText || 'OK'}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm || (() => setModal({visible: false}))}
        onCancel={() => setModal({visible: false})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.BG},
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {fontSize: 16, fontWeight: '700', color: COLORS.WHITE},
  headerSub: {fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1},
  content: {flex: 1, padding: 14},
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: {fontSize: 14, fontWeight: '700', color: COLORS.TEXT},
  cardSub: {fontSize: 11, color: COLORS.MUTED, marginTop: 2},
  clearBtnWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  clearBtn: {fontSize: 12, color: COLORS.MUTED, fontWeight: '600'},
  signatureArea: {
    height: 160,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  signatureImage: {width: '100%', height: '100%'},
  signPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {fontSize: 12, color: COLORS.MUTED, marginTop: 8},
  photoArea: {
    height: 140,
    backgroundColor: COLORS.BG,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginTop: 10,
  },
  photoPlaceholderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholder: {fontSize: 12, color: COLORS.MUTED, marginTop: 8},
  photoImage: {width: '100%', height: '100%'},
  photoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  photoName: {fontSize: 12, color: COLORS.TEXT, flex: 1},
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: COLORS.TEXT,
    backgroundColor: COLORS.BG,
    marginTop: 10,
  },
  notesInput: {height: 80},
  submitBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    elevation: 3,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  submitBtnDisabled: {opacity: 0.5, elevation: 0},
  btnContent: {flexDirection: 'row', alignItems: 'center'},
  submitBtnText: {color: COLORS.WHITE, fontSize: 14, fontWeight: '700'},
  // Signature pad
  signPadContainer: {flex: 1, backgroundColor: COLORS.WHITE},
  signPadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  signPadTitle: {fontSize: 16, fontWeight: '700', color: COLORS.TEXT},
  signDoneBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signDoneBtnText: {color: COLORS.WHITE, fontSize: 14, fontWeight: '700'},
});
