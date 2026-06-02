import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {COLORS} from '../theme/colors';

export default function LogoutModal({visible, onCancel, onConfirm}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconCircle}>
            <Icon name="log-out" size={24} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.title}>Logout</Text>
          <Text style={styles.message}>
            Are you sure you want to logout? You'll need to login again with OTP.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={onConfirm}
              activeOpacity={0.7}>
              <Text style={styles.confirmText}>Yes, Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modal: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.LIGHT_RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
});
