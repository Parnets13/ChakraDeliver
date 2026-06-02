import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';
import {useDeliveryStore} from '../store/deliveryStore';
import AppModal from '../components/AppModal';

const REASONS = [
  'Customer Absent',
  'Address Not Found',
  'Damaged Product',
  'Wrong Item',
  'Refused Delivery',
];

export default function ReturnsScreen() {
  const returns = useDeliveryStore(state => state.returns);
  const deliveries = useDeliveryStore(state => state.deliveries);
  const fetchReturns = useDeliveryStore(state => state.fetchReturns);
  const fetchDeliveries = useDeliveryStore(state => state.fetchDeliveries);
  const createReturn = useDeliveryStore(state => state.createReturn);

  const [refreshing, setRefreshing] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    fetchReturns();
    fetchDeliveries();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReturns();
    await fetchDeliveries();
    setRefreshing(false);
  }, []);

  // Get failed deliveries that can be returned (not already returned)
  const failedDeliveries = deliveries.filter(
    d => d.status === 'failed' && !returns.find(r => r._id === d._id),
  );

  const totalReturns = returns.length;
  const pendingReturns = failedDeliveries.length;

  const handleInitiateReturn = delivery => {
    setSelectedDelivery(delivery);
    setSelectedReason('');
    setReturnModal(true);
  };

  const handleSubmitReturn = async () => {
    if (!selectedReason) return;
    setSubmitting(true);
    await createReturn(selectedDelivery._id, selectedReason);
    setSubmitting(false);
    setReturnModal(false);
    setSuccessModal(true);
    fetchReturns();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <MCIcon name="package-variant-closed" size={20} color={COLORS.WHITE} />
          <Text style={styles.headerTitle}>Returns</Text>
        </View>
        <Text style={styles.headerSub}>
          {totalReturns} returned · {pendingReturns} pending
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />
        }>
        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalReturns}</Text>
            <Text style={styles.statLabel}>Returned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: COLORS.WARNING}]}>
              {pendingReturns}
            </Text>
            <Text style={styles.statLabel}>Pending Return</Text>
          </View>
        </View>

        {/* Failed deliveries that can be returned */}
        {failedDeliveries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="alert-circle" size={12} color={COLORS.WARNING} /> Pending Returns
            </Text>
            {failedDeliveries.map(item => (
              <PendingReturnCard
                key={item._id}
                item={item}
                onReturn={() => handleInitiateReturn(item)}
              />
            ))}
          </View>
        )}

        {/* Already returned */}
        {returns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="check-circle" size={12} color={COLORS.SUCCESS} /> Completed Returns
            </Text>
            {returns.map(item => (
              <ReturnedCard key={item._id} item={item} />
            ))}
          </View>
        )}

        {failedDeliveries.length === 0 && returns.length === 0 && (
          <View style={styles.emptyState}>
            <MCIcon name="package-variant" size={40} color={COLORS.BORDER} />
            <Text style={styles.emptyText}>No returns yet</Text>
          </View>
        )}

        <View style={{height: 20}} />
      </ScrollView>

      {/* Return Reason Modal */}
      <AppModal
        visible={returnModal}
        title="Initiate Return"
        message={`Select reason for returning ${selectedDelivery?.customerName || ''}'s delivery`}
        onClose={() => setReturnModal(false)}
        buttons={[
          {text: 'Cancel', style: 'cancel', onPress: () => setReturnModal(false)},
          {
            text: submitting ? 'Submitting...' : 'Submit Return',
            style: 'destructive',
            onPress: handleSubmitReturn,
            disabled: !selectedReason || submitting,
          },
        ]}>
        <View style={styles.reasonList}>
          {REASONS.map(reason => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonOption,
                selectedReason === reason && styles.reasonOptionActive,
              ]}
              onPress={() => setSelectedReason(reason)}>
              <Icon
                name={selectedReason === reason ? 'check-circle' : 'circle'}
                size={16}
                color={selectedReason === reason ? COLORS.PRIMARY : COLORS.MUTED}
              />
              <Text
                style={[
                  styles.reasonOptionText,
                  selectedReason === reason && styles.reasonOptionTextActive,
                ]}>
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </AppModal>

      {/* Success Modal */}
      <AppModal
        visible={successModal}
        title="Return Submitted"
        message="The return has been successfully submitted and dispatch status updated."
        onClose={() => setSuccessModal(false)}
        buttons={[{text: 'OK', onPress: () => setSuccessModal(false)}]}
      />
    </View>
  );
}

function PendingReturnCard({item, onReturn}) {
  return (
    <View style={styles.returnCard}>
      <View style={styles.returnHeader}>
        <View style={styles.returnIdRow}>
          <MCIcon name="barcode" size={14} color={COLORS.MUTED} />
          <Text style={styles.returnId}>{item.dcNumber || item.deliveryId}</Text>
        </View>
        <View style={styles.failBadge}>
          <Text style={styles.failBadgeText}>Failed</Text>
        </View>
      </View>
      <Text style={styles.returnName}>{item.customerName}</Text>
      <Text style={styles.returnInfo}>
        <Icon name="map-pin" size={10} color={COLORS.MUTED} /> {item.area || item.address}
      </Text>
      {item.failReason && (
        <Text style={styles.failReason}>
          <Icon name="info" size={10} color={COLORS.WARNING} /> {item.failReason}
        </Text>
      )}

      <TouchableOpacity style={styles.returnBtn} onPress={onReturn}>
        <Icon name="corner-down-left" size={14} color={COLORS.WHITE} />
        <Text style={styles.returnBtnText}>Initiate Return</Text>
      </TouchableOpacity>
    </View>
  );
}

function ReturnedCard({item}) {
  return (
    <View style={[styles.returnCard, styles.returnedCard]}>
      <View style={styles.returnHeader}>
        <View style={styles.returnIdRow}>
          <MCIcon name="barcode" size={14} color={COLORS.MUTED} />
          <Text style={styles.returnId}>{item.dcNumber || item.deliveryId}</Text>
        </View>
        <View style={styles.returnedBadge}>
          <Icon name="check" size={10} color={COLORS.SUCCESS} />
          <Text style={styles.returnedBadgeText}>Returned</Text>
        </View>
      </View>
      <Text style={styles.returnName}>{item.customerName}</Text>
      <Text style={styles.returnInfo}>
        <Icon name="map-pin" size={10} color={COLORS.MUTED} /> {item.area || item.address}
      </Text>
      <Text style={styles.returnReason}>
        <Icon name="tag" size={10} color={COLORS.PRIMARY} /> {item.failReason || 'Return requested'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  statsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.BORDER,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.MUTED,
    marginTop: 2,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  returnCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  returnedCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.SUCCESS,
  },
  returnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  returnIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  returnId: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  failBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  failBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  returnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  returnedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.SUCCESS,
  },
  returnName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 2,
  },
  returnInfo: {
    fontSize: 11,
    color: COLORS.MUTED,
    marginBottom: 4,
  },
  failReason: {
    fontSize: 11,
    color: COLORS.WARNING,
    marginBottom: 10,
  },
  returnReason: {
    fontSize: 11,
    color: COLORS.PRIMARY,
    marginTop: 4,
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 10,
  },
  returnBtnText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.MUTED,
    marginTop: 10,
  },
  reasonList: {
    marginTop: 10,
    gap: 8,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BG,
  },
  reasonOptionActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#FEF2F2',
  },
  reasonOptionText: {
    fontSize: 13,
    color: COLORS.TEXT,
  },
  reasonOptionTextActive: {
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
});
