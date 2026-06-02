import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {COLORS} from '../theme/colors';

const typeConfig = {
  success: {icon: 'check-circle', color: COLORS.SUCCESS, bg: COLORS.LIGHT_GREEN},
  error: {icon: 'x-circle', color: COLORS.FAILED, bg: COLORS.LIGHT_RED},
  warning: {icon: 'alert-triangle', color: COLORS.WARNING, bg: COLORS.LIGHT_ORANGE},
  info: {icon: 'info', color: '#1976D2', bg: COLORS.LIGHT_BLUE},
};

export default function AppModal({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  onClose,
  buttons,
  children,
}) {
  const config = typeConfig[type] || typeConfig.info;
  const handleClose = onCancel || onConfirm || onClose;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={[styles.iconCircle, {backgroundColor: config.bg}]}>
            <Icon name={config.icon} size={28} color={config.color} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {/* Render children if provided (e.g. reason picker) */}
          {children}

          {/* If buttons array provided, use that. Otherwise use legacy props */}
          {buttons ? (
            <View style={styles.buttonRow}>
              {buttons.map((btn, idx) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';
                const btnColor = isCancel
                  ? COLORS.BORDER
                  : isDestructive
                    ? COLORS.FAILED
                    : config.color;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      isCancel ? styles.cancelBtn : styles.confirmBtn,
                      !isCancel && {backgroundColor: btnColor},
                      btn.disabled && {opacity: 0.5},
                    ]}
                    onPress={btn.disabled ? undefined : btn.onPress}
                    activeOpacity={0.7}
                    disabled={btn.disabled}>
                    <Text style={isCancel ? styles.cancelText : styles.confirmText}>
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.buttonRow}>
              {cancelText && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onCancel}
                  activeOpacity={0.7}>
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  {backgroundColor: config.color},
                  !cancelText && {flex: 1},
                ]}
                onPress={onConfirm}
                activeOpacity={0.7}>
                <Text style={styles.confirmText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          )}
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
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 14,
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
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
});
