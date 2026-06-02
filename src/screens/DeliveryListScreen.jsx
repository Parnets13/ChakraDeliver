import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';
import {useDeliveryStore} from '../store/deliveryStore';

const FILTERS = ['All', 'Pending', 'In_transit', 'Delivered', 'Failed'];
const FILTER_LABELS = { All: 'All', Pending: 'Pending', In_transit: 'In Transit', Delivered: 'Delivered', Failed: 'Failed' };

const statusConfig = {
  pending: {color: COLORS.WARNING, bg: COLORS.LIGHT_ORANGE, icon: 'clock'},
  delivered: {color: COLORS.SUCCESS, bg: COLORS.LIGHT_GREEN, icon: 'check-circle'},
  failed: {color: COLORS.FAILED, bg: COLORS.LIGHT_RED, icon: 'x-circle'},
  in_transit: {color: '#1976D2', bg: COLORS.LIGHT_BLUE, icon: 'truck'},
  returned: {color: COLORS.MUTED, bg: '#F0F0F0', icon: 'rotate-ccw'},
};

export default function DeliveryListScreen({navigation}) {
  const [activeFilter, setActiveFilter] = useState('All');
  const {deliveries, getFilteredDeliveries, fetchDeliveries, isLoading} = useDeliveryStore();
  const filteredDeliveries = getFilteredDeliveries(activeFilter);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const getFilterCount = filter => {
    if (filter === 'All') return deliveries.length;
    return deliveries.filter(d => d.status === filter.toLowerCase()).length;
  };

  const renderDeliveryCard = ({item, index}) => {
    const config = statusConfig[item.status] || statusConfig.pending;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('DeliveryDetail', {deliveryId: item._id || item.id})
        }
        activeOpacity={0.7}>
        {/* Left indicator */}
        <View style={[styles.cardIndicator, {backgroundColor: config.color}]} />

        <View style={styles.cardContent}>
          {/* Top row */}
          <View style={styles.cardHeader}>
            <View style={styles.orderIdRow}>
              <IconMC name="package-variant" size={12} color={COLORS.MUTED} />
              <Text style={styles.orderId}> {item.deliveryId || item.id}</Text>
            </View>
            <View style={[styles.statusBadge, {backgroundColor: config.bg}]}>
              <Icon name={config.icon} size={10} color={config.color} />
              <Text style={[styles.statusText, {color: config.color}]}>
                {' '}{item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>

          {/* Customer name */}
          <Text style={styles.customerName}>{item.customerName}</Text>

          {/* DC Number */}
          <Text style={styles.dcNumber}>{item.dcNumber}</Text>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Icon name="map-pin" size={11} color={COLORS.MUTED} />
              <Text style={styles.footerText}> {item.area}</Text>
            </View>
            <View style={styles.footerItem}>
              <Icon name="clock" size={11} color={COLORS.MUTED} />
              <Text style={styles.footerText}> {item.scheduledTime}</Text>
            </View>
            <View style={styles.footerItem}>
              <IconMC name="package-variant-closed" size={11} color={COLORS.MUTED} />
              <Text style={styles.footerText}> {item.boxes} box</Text>
            </View>
          </View>
        </View>

        <Icon name="chevron-right" size={16} color={COLORS.MUTED} style={styles.arrow} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Deliveries</Text>
          <Text style={styles.headerSub}>
            Today · {deliveries.length} total
          </Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{getFilterCount('Pending')}</Text>
            <Text style={styles.headerStatLabel}>Pending</Text>
          </View>
          <View style={styles.headerStatItem}>
            <Text style={[styles.headerStatValue, {color: '#4CAF50'}]}>{getFilterCount('Delivered')}</Text>
            <Text style={styles.headerStatLabel}>Done</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(filter)}>
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}>
              {FILTER_LABELS[filter] || filter}
            </Text>
            <View style={[
              styles.filterCount,
              activeFilter === filter && styles.filterCountActive,
            ]}>
              <Text style={[
                styles.filterCountText,
                activeFilter === filter && styles.filterCountTextActive,
              ]}>
                {getFilterCount(filter)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredDeliveries}
        keyExtractor={item => item._id || item.id || item.deliveryId}
        renderItem={renderDeliveryCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchDeliveries}
            colors={[COLORS.PRIMARY]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="inbox" size={40} color={COLORS.MUTED} />
            <Text style={styles.emptyText}>No deliveries found</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        }
      />
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
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.WHITE,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  headerStats: {
    flexDirection: 'row',
  },
  headerStatItem: {
    alignItems: 'center',
    marginLeft: 16,
  },
  headerStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.WHITE,
  },
  headerStatLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.WHITE,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: COLORS.BG,
  },
  filterTabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  filterTextActive: {
    color: COLORS.WHITE,
  },
  filterCount: {
    marginLeft: 5,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  filterCountTextActive: {
    color: COLORS.WHITE,
  },
  list: {
    padding: 14,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardIndicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardContent: {
    flex: 1,
    padding: 14,
    paddingLeft: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 2,
  },
  dcNumber: {
    fontSize: 11,
    color: COLORS.MUTED,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.MUTED,
  },
  arrow: {
    marginRight: 12,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.MUTED,
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.MUTED,
    marginTop: 4,
  },
});
