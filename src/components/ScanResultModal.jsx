import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';

export default function ScanResultModal({
  visible,
  delivery,
  notFound,
  scannedCode,
  onClose,
  onViewDetails,
  onMarkDelivered,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {notFound ? (
            <View style={styles.notFoundView}>
              <View style={styles.notFoundIcon}>
                <Icon name="alert-circle" size={32} color={COLORS.FAILED} />
              </View>
              <Text style={styles.notFoundTitle}>Not Your Delivery</Text>
              <Text style={styles.notFoundText}>
                Code "{scannedCode}" is not assigned to you or doesn't exist.
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Scan Again</Text>
              </TouchableOpacity>
            </View>
          ) : delivery ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Success header */}
              <View style={styles.successHeader}>
                <View style={styles.successIcon}>
                  <Icon name="check-circle" size={24} color={COLORS.SUCCESS} />
                </View>
                <View>
                  <Text style={styles.successTitle}>Package Found</Text>
                  <Text style={styles.successSub}>{delivery.dcNumber}</Text>
                </View>
              </View>

              {/* Customer */}
              <View style={styles.detailCard}>
                <View style={styles.customerRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {delivery.customerName?.split(' ').map(n => n[0]).join('') || '?'}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.customerName}>{delivery.customerName}</Text>
                    <Text style={styles.orderId}>{delivery.deliveryId}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {delivery.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Icon name="map-pin" size={14} color={COLORS.PRIMARY} />
                  <Text style={styles.infoText}>{delivery.address}</Text>
                </View>

                {delivery.phone ? (
                  <View style={styles.infoRow}>
                    <Icon name="phone" size={14} color={COLORS.PRIMARY} />
                    <Text style={styles.infoText}>{delivery.phone}</Text>
                  </View>
                ) : null}

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <IconMC name="package-variant-closed" size={14} color={COLORS.MUTED} />
                    <Text style={styles.metaText}> {delivery.boxes} boxes</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <IconMC name="weight" size={14} color={COLORS.MUTED} />
                    <Text style={styles.metaText}> {delivery.weight || 'N/A'}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="tag" size={14} color={COLORS.MUTED} />
                    <Text style={styles.metaText}> {delivery.category}</Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity style={styles.primaryBtn} onPress={onViewDetails}>
                <Icon name="eye" size={16} color={COLORS.WHITE} />
                <Text style={styles.primaryBtnText}> View Full Details</Text>
              </TouchableOpacity>

              {delivery.status === 'pending' && (
                <TouchableOpacity style={styles.secondaryBtn} onPress={onMarkDelivered}>
                  <Icon name="camera" size={16} color={COLORS.PRIMARY} />
                  <Text style={styles.secondaryBtnText}> Capture POD & Deliver</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.textBtn} onPress={onClose}>
                <Text style={styles.textBtnText}>Scan Another</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.BORDER,
    alignSelf: 'center',
    marginBottom: 16,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  successTitle: {fontSize: 17, fontWeight: '800', color: COLORS.TEXT},
  successSub: {fontSize: 12, color: COLORS.MUTED, marginTop: 2},
  detailCard: {
    backgroundColor: COLORS.BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  customerRow: {flexDirection: 'row', alignItems: 'center'},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {fontSize: 14, fontWeight: '800', color: COLORS.WHITE},
  customerName: {fontSize: 15, fontWeight: '700', color: COLORS.TEXT},
  orderId: {fontSize: 11, color: COLORS.MUTED, marginTop: 2},
  statusBadge: {
    backgroundColor: COLORS.LIGHT_ORANGE,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {fontSize: 9, fontWeight: '700', color: COLORS.WARNING},
  divider: {height: 1, backgroundColor: COLORS.BORDER, marginVertical: 12},
  infoRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  infoText: {fontSize: 12, color: COLORS.TEXT, flex: 1, marginLeft: 8, lineHeight: 17},
  metaRow: {flexDirection: 'row', marginTop: 6},
  metaItem: {flexDirection: 'row', alignItems: 'center', marginRight: 16},
  metaText: {fontSize: 11, color: COLORS.MUTED},
  primaryBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {color: COLORS.WHITE, fontSize: 14, fontWeight: '700'},
  secondaryBtn: {
    backgroundColor: COLORS.LIGHT_GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  secondaryBtnText: {color: COLORS.SUCCESS, fontSize: 14, fontWeight: '700'},
  textBtn: {paddingVertical: 10, alignItems: 'center', marginBottom: 8},
  textBtnText: {fontSize: 13, color: COLORS.MUTED, fontWeight: '600'},
  notFoundView: {alignItems: 'center', paddingVertical: 10},
  notFoundIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.LIGHT_RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  notFoundTitle: {fontSize: 18, fontWeight: '800', color: COLORS.TEXT, marginBottom: 6},
  notFoundText: {
    fontSize: 13,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  closeBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  closeBtnText: {color: COLORS.WHITE, fontSize: 14, fontWeight: '700'},
});
