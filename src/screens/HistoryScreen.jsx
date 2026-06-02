import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';
import {deliveryApi} from '../api/deliveryApi';

const FILTERS = ['All', 'Delivered', 'Failed', 'Returned'];

const statusConfig = {
  pending: {color: COLORS.WARNING, icon: 'clock'},
  delivered: {color: COLORS.SUCCESS, icon: 'check-circle'},
  failed: {color: COLORS.FAILED, icon: 'x-circle'},
  returned: {color: COLORS.MUTED, icon: 'rotate-ccw'},
};

export default function HistoryScreen({navigation}) {
  const [deliveries, setDeliveries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    setLoading(true);
    try {
      const res = await deliveryApi.getHistory({
        status: filter,
        page: p,
        limit: 20,
      });
      if (reset) {
        setDeliveries(res.data);
        setPage(2);
      } else {
        setDeliveries(prev => [...prev, ...res.data]);
        setPage(p + 1);
      }
      setHasMore(res.pagination?.page < res.pagination?.pages);
    } catch (err) {
      console.log('History error:', err.message);
    }
    setLoading(false);
  }, [filter, page]);

  useEffect(() => {
    fetchHistory(true);
  }, [filter]);

  const renderItem = ({item}) => {
    const config = statusConfig[item.status] || statusConfig.pending;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DeliveryDetail', {deliveryId: item._id})}
        activeOpacity={0.7}>
        <View style={styles.cardLeft}>
          <Icon name={config.icon} size={18} color={config.color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.dcNumber}>{item.dcNumber}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>
              {new Date(item.scheduledDate).toLocaleDateString('en-IN', {day: '2-digit', month: 'short'})}
            </Text>
            <Text style={styles.metaText}>{item.area}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.statusText, {color: config.color}]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
          {item.deliveredAt && (
            <Text style={styles.timeText}>
              {new Date(item.deliveredAt).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={16} color={COLORS.WHITE} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Delivery History</Text>
          <Text style={styles.headerSub}>All past deliveries</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f.toLowerCase() && styles.filterActive]}
            onPress={() => setFilter(f.toLowerCase())}>
            <Text style={[styles.filterText, filter === f.toLowerCase() && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => fetchHistory(true)} colors={[COLORS.PRIMARY]} />
        }
        onEndReached={() => hasMore && !loading && fetchHistory()}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Icon name="inbox" size={40} color={COLORS.MUTED} />
              <Text style={styles.emptyText}>No delivery history</Text>
            </View>
          )
        }
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
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  headerTitle: {fontSize: 16, fontWeight: '700', color: COLORS.WHITE},
  headerSub: {fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1},
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.WHITE,
  },
  filterTab: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, marginRight: 8, backgroundColor: COLORS.BG,
  },
  filterActive: {backgroundColor: COLORS.PRIMARY},
  filterText: {fontSize: 12, fontWeight: '600', color: COLORS.MUTED},
  filterTextActive: {color: COLORS.WHITE},
  list: {padding: 14},
  card: {
    backgroundColor: COLORS.WHITE, borderRadius: 12,
    padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    elevation: 1, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.04, shadowRadius: 3,
  },
  cardLeft: {marginRight: 12},
  cardContent: {flex: 1},
  customerName: {fontSize: 14, fontWeight: '700', color: COLORS.TEXT},
  dcNumber: {fontSize: 11, color: COLORS.MUTED, marginTop: 2},
  cardMeta: {flexDirection: 'row', marginTop: 4},
  metaText: {fontSize: 11, color: COLORS.MUTED, marginRight: 10},
  cardRight: {alignItems: 'flex-end'},
  statusText: {fontSize: 11, fontWeight: '700'},
  timeText: {fontSize: 10, color: COLORS.MUTED, marginTop: 2},
  empty: {alignItems: 'center', paddingTop: 60},
  emptyText: {fontSize: 14, color: COLORS.MUTED, marginTop: 12},
});
