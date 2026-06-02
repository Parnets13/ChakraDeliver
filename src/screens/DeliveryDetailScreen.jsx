import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';
import {useDeliveryStore} from '../store/deliveryStore';
import {deliveryApi} from '../api/deliveryApi';
import AppModal from '../components/AppModal';

export default function DeliveryDetailScreen({route, navigation}) {
  const {deliveryId} = route.params;
  const deliveries = useDeliveryStore(state => state.deliveries);
  const startDelivery = useDeliveryStore(state => state.startDelivery);
  const [delivery, setDelivery] = useState(
    deliveries.find(d => (d._id || d.id) === deliveryId) || null
  );
  const [loading, setLoading] = useState(!delivery);
  const [modal, setModal] = useState({visible: false});

  useEffect(() => {
    // If not in local store, fetch from API
    if (!delivery && deliveryId) {
      setLoading(true);
      deliveryApi.getById(deliveryId)
        .then(res => {
          if (res.success && res.data) {
            setDelivery(res.data);
          }
        })
        .catch(err => console.log('Fetch delivery error:', err.message))
        .finally(() => setLoading(false));
    }
  }, [deliveryId]);

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color={COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Detail</Text>
        </View>
        <View style={styles.emptyView}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.emptyText}>Loading delivery...</Text>
        </View>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color={COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Detail</Text>
        </View>
        <View style={styles.emptyView}>
          <Icon name="alert-circle" size={40} color={COLORS.MUTED} />
          <Text style={styles.emptyText}>Delivery not found</Text>
        </View>
      </View>
    );
  }

  const statusColor =
    delivery.status === 'delivered' ? COLORS.SUCCESS
    : delivery.status === 'failed' ? COLORS.FAILED
    : COLORS.WARNING;

  const statusBg =
    delivery.status === 'delivered' ? COLORS.LIGHT_GREEN
    : delivery.status === 'failed' ? COLORS.LIGHT_RED
    : COLORS.LIGHT_ORANGE;

  const handleCall = () => {
    if (delivery.phone) {
      Linking.openURL(`tel:${delivery.phone.replace(/\s/g, '')}`);
    }
  };

  const handleOpenMaps = () => {
    const address = encodeURIComponent(delivery.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={16} color={COLORS.WHITE} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Delivery Detail</Text>
          <Text style={styles.headerSub}>{delivery.deliveryId || delivery.id}</Text>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: statusBg}]}>
          <Text style={[styles.statusText, {color: statusColor}]}>
            {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="user" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.sectionTitle}> CUSTOMER INFORMATION</Text>
          </View>

          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerAvatarText}>
                {delivery.customerName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.customerName}>{delivery.customerName}</Text>
              <Text style={styles.customerId}>ID: {delivery.customerId}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Icon name="map-pin" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.infoText}>{delivery.address}</Text>
          </View>

          <View style={styles.infoItem}>
            <Icon name="phone" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.infoText}>{delivery.phone}</Text>
            <TouchableOpacity style={styles.callChip} onPress={handleCall}>
              <Icon name="phone-call" size={12} color={COLORS.SUCCESS} />
              <Text style={styles.callText}> Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <Icon name="clock" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.infoText}>Scheduled: {delivery.scheduledTime}</Text>
          </View>
        </View>

        {/* Package Info */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <IconMC name="package-variant" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.sectionTitle}> PACKAGE INFORMATION</Text>
          </View>

          <View style={styles.packageGrid}>
            <View style={styles.packageItem}>
              <View style={styles.packageIconWrap}>
                <IconMC name="barcode" size={16} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.packageLabel}>DC Number</Text>
              <Text style={styles.packageValue}>{delivery.dcNumber}</Text>
            </View>
            <View style={styles.packageItem}>
              <View style={styles.packageIconWrap}>
                <IconMC name="package-variant-closed" size={16} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.packageLabel}>Boxes</Text>
              <Text style={styles.packageValue}>{delivery.boxes} Boxes</Text>
            </View>
          </View>
          <View style={styles.packageGrid}>
            <View style={styles.packageItem}>
              <View style={styles.packageIconWrap}>
                <IconMC name="weight" size={16} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.packageLabel}>Weight</Text>
              <Text style={styles.packageValue}>{delivery.weight}</Text>
            </View>
            <View style={styles.packageItem}>
              <View style={styles.packageIconWrap}>
                <Icon name="tag" size={16} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.packageLabel}>Category</Text>
              <Text style={styles.packageValue}>{delivery.category}</Text>
            </View>
          </View>
        </View>

        {/* Map */}
        <TouchableOpacity style={styles.mapCard} onPress={handleOpenMaps} activeOpacity={0.8}>
          <View style={styles.mapPlaceholder}>
            <Icon name="map" size={28} color={COLORS.PRIMARY} />
            <Text style={styles.mapMainText}>{delivery.area}</Text>
            <Text style={styles.mapSubText}>Tap to open in Google Maps</Text>
          </View>
          <View style={styles.openMapsBtn}>
            <IconMC name="google-maps" size={14} color={COLORS.WHITE} />
            <Text style={styles.openMapsText}> Open Maps</Text>
          </View>
        </TouchableOpacity>

        {/* Actions */}
        {delivery.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.podBtn}
              onPress={() => {
                setModal({
                  visible: true,
                  type: 'info',
                  title: 'Start Delivery',
                  message: `Start delivery to ${delivery.customerName}? Status will change to "In Transit".`,
                  confirmText: 'Start',
                  cancelText: 'Cancel',
                  onConfirm: async () => {
                    setModal({visible: false});
                    const success = await startDelivery(delivery._id || delivery.id);
                    if (success) {
                      setDelivery({...delivery, status: 'in_transit'});
                    }
                  },
                });
              }}>
              <View style={styles.btnContent}>
                <IconMC name="truck-fast-outline" size={18} color={COLORS.WHITE} />
                <Text style={styles.podBtnText}> Start Delivery</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.issueBtn}
              onPress={() => navigation.navigate('Main', {screen: 'Returns'})}>
              <View style={styles.btnContent}>
                <Icon name="alert-triangle" size={16} color={COLORS.PRIMARY} />
                <Text style={styles.issueBtnText}> Report Issue</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {delivery.status === 'in_transit' && (
          <View style={styles.actions}>
            {/* In Transit badge */}
            <View style={styles.inTransitBadge}>
              <IconMC name="truck-fast-outline" size={16} color="#3B82F6" />
              <Text style={styles.inTransitText}> In Transit — Out for delivery</Text>
            </View>

            <TouchableOpacity
              style={styles.podBtn}
              onPress={() => navigation.navigate('POD', {deliveryId: delivery._id || delivery.id})}>
              <View style={styles.btnContent}>
                <Icon name="camera" size={16} color={COLORS.WHITE} />
                <Text style={styles.podBtnText}> Capture POD & Deliver</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.issueBtn}
              onPress={() => navigation.navigate('Main', {screen: 'Returns'})}>
              <View style={styles.btnContent}>
                <Icon name="alert-triangle" size={16} color={COLORS.PRIMARY} />
                <Text style={styles.issueBtnText}> Report Issue</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Delivered info */}
        {delivery.status === 'delivered' && (
          <View style={styles.deliveredInfo}>
            <Icon name="check-circle" size={18} color={COLORS.SUCCESS} />
            <Text style={styles.deliveredInfoText}>
              Delivered successfully
              {delivery.deliveredAt && ` at ${new Date(delivery.deliveredAt).toLocaleTimeString()}`}
            </Text>
          </View>
        )}

        {/* Failed info */}
        {delivery.status === 'failed' && (
          <View style={styles.failedInfo}>
            <Icon name="x-circle" size={18} color={COLORS.FAILED} />
            <Text style={styles.failedInfoText}>
              Failed: {delivery.failReason || 'Unknown reason'}
            </Text>
          </View>
        )}

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
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerCenter: {flex: 1},
  headerTitle: {fontSize: 16, fontWeight: '700', color: COLORS.WHITE},
  headerSub: {fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1},
  statusBadge: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12},
  statusText: {fontSize: 11, fontWeight: '700'},
  content: {flex: 1, padding: 14},
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customerAvatarText: {fontSize: 15, fontWeight: '800', color: COLORS.WHITE},
  customerName: {fontSize: 15, fontWeight: '700', color: COLORS.TEXT},
  customerId: {fontSize: 11, color: COLORS.MUTED, marginTop: 2},
  divider: {height: 1, backgroundColor: COLORS.BORDER, marginBottom: 12},
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {fontSize: 13, color: COLORS.TEXT, flex: 1, marginLeft: 10, lineHeight: 18},
  callChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GREEN,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  callText: {fontSize: 11, color: COLORS.SUCCESS, fontWeight: '700'},
  packageGrid: {flexDirection: 'row', marginBottom: 12},
  packageItem: {flex: 1, marginRight: 8},
  packageIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.LIGHT_RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  packageLabel: {fontSize: 10, color: COLORS.MUTED},
  packageValue: {fontSize: 14, fontWeight: '700', color: COLORS.TEXT, marginTop: 2},
  mapCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  mapPlaceholder: {
    height: 110,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMainText: {fontSize: 14, fontWeight: '600', color: COLORS.TEXT, marginTop: 6},
  mapSubText: {fontSize: 11, color: COLORS.MUTED, marginTop: 2},
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 10,
  },
  openMapsText: {fontSize: 12, color: COLORS.WHITE, fontWeight: '700'},
  actions: {gap: 10},
  btnContent: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  inTransitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 12,
  },
  inTransitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
  podBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  podBtnText: {color: COLORS.WHITE, fontSize: 14, fontWeight: '700'},
  deliveredBtn: {
    backgroundColor: COLORS.LIGHT_GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deliveredBtnText: {color: COLORS.SUCCESS, fontSize: 14, fontWeight: '700'},
  issueBtn: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
  },
  issueBtnText: {color: COLORS.PRIMARY, fontSize: 14, fontWeight: '700'},
  deliveredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GREEN,
    padding: 14,
    borderRadius: 10,
  },
  deliveredInfoText: {fontSize: 13, color: COLORS.SUCCESS, fontWeight: '600', marginLeft: 8},
  failedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_RED,
    padding: 14,
    borderRadius: 10,
  },
  failedInfoText: {fontSize: 13, color: COLORS.FAILED, fontWeight: '600', marginLeft: 8},
  emptyView: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  emptyText: {fontSize: 14, color: COLORS.MUTED, marginTop: 10},
});
