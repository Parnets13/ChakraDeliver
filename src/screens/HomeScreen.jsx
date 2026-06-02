import React, {useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';
import {useDeliveryStore} from '../store/deliveryStore';
import {useAuthStore} from '../store/authStore';

export default function HomeScreen({navigation}) {
  const {stats, deliveries, fetchDeliveries, fetchStats, fetchNotifications, getNextDelivery, getUnreadCount, isLoading} = useDeliveryStore();
  const agent = useAuthStore(state => state.agent);
  const nextDelivery = getNextDelivery();
  const unreadCount = getUnreadCount();
  const pendingCount = deliveries.filter(d => d.status === 'pending').length;

  useEffect(() => {
    fetchDeliveries();
    fetchStats();
    fetchNotifications();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.agentName}>{agent?.name || 'Agent'}</Text>
          <View style={styles.idRow}>
            <Icon name="award" size={11} color="rgba(255,255,255,0.85)" />
            <Text style={styles.agentId}> {agent?.agentId || ''} · {agent?.zone || ''}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate('Notifications')}>
            <Icon name="bell" size={18} color={COLORS.WHITE} />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{paddingBottom: 20}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => { fetchDeliveries(); fetchStats(); }}
            colors={[COLORS.PRIMARY]}
          />
        }>
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Today"
            value={stats.today}
            sub="deliveries assigned"
            color={COLORS.PRIMARY}
            iconBg={COLORS.LIGHT_RED}
            icon="calendar"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            sub="delivered today"
            color={COLORS.SUCCESS}
            iconBg={COLORS.LIGHT_GREEN}
            icon="check-circle"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            label="Pending"
            value={stats.pending}
            sub="awaiting delivery"
            color={COLORS.WARNING}
            iconBg={COLORS.LIGHT_ORANGE}
            icon="clock"
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            sub="needs attention"
            color={COLORS.FAILED}
            iconBg={COLORS.LIGHT_RED}
            icon="x-circle"
          />
        </View>

        {/* Pending Returns Alert - only show if there are failed deliveries */}
        {deliveries.filter(d => d.status === 'failed').length > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => navigation.navigate('Main', {screen: 'Returns'})}
            activeOpacity={0.7}>
            <View style={styles.alertIconWrap}>
              <IconMC name="package-up" size={20} color={COLORS.WARNING} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{deliveries.filter(d => d.status === 'failed').length} Pending Returns</Text>
              <Text style={styles.alertText}>
                Return to warehouse
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={COLORS.WARNING} />
          </TouchableOpacity>
        )}

        {/* Next Delivery */}
        {nextDelivery && (
          <View style={styles.nextDeliveryCard}>
            <View style={styles.nextHeader}>
              <Text style={styles.nextTitle}>Next Delivery</Text>
              <View style={styles.countBadge}>
                <Text style={styles.nextCount}>#{stats.completed + 1} of {stats.today}</Text>
              </View>
            </View>

            <View style={styles.customerRow}>
              <View style={styles.customerIcon}>
                <IconMC name="store" size={18} color={COLORS.PRIMARY} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.customerName}>
                  {nextDelivery.customerName}
                </Text>
                <Text style={styles.dcText}>{nextDelivery.dcNumber}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.addressRow}>
              <Icon name="map-pin" size={14} color={COLORS.PRIMARY} />
              <Text style={styles.addressText}>{nextDelivery.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>DC Number</Text>
                <Text style={styles.infoValue}>{nextDelivery.dcNumber}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Boxes</Text>
                <View style={styles.boxRow}>
                  <IconMC name="package-variant-closed" size={14} color={COLORS.TEXT} />
                  <Text style={styles.infoValue}>
                    {' '}
                    {nextDelivery.boxes} boxes
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewDetailsBtn}
              onPress={() =>
                navigation.navigate('DeliveryDetail', {
                  deliveryId: nextDelivery._id || nextDelivery.id,
                })
              }>
              <IconMC name="map-marker-radius" size={16} color={COLORS.WHITE} />
              <Text style={styles.viewDetailsBtnText}>
                {' '}View Delivery Details
              </Text>
              <Icon name="arrow-right" size={16} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({label, value, sub, color, iconBg, icon}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={[styles.statIconCircle, {backgroundColor: iconBg}]}>
          <Icon name={icon} size={14} color={color} />
        </View>
      </View>
      <Text style={[styles.statValue, {color}]}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
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
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {flex: 1},
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  agentName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.WHITE,
    marginTop: 2,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  agentId: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFD600',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
  },
  bellBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '500',
  },
  statIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 6,
  },
  statSub: {
    fontSize: 10,
    color: COLORS.MUTED,
    marginTop: 1,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    marginHorizontal: 4,
    marginTop: 6,
    marginBottom: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5E6B8',
  },
  alertIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE8A3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.WARNING,
    marginBottom: 2,
  },
  alertText: {
    fontSize: 12,
    color: '#9A6B00',
  },
  nextDeliveryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  nextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  nextTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  countBadge: {
    backgroundColor: COLORS.LIGHT_RED,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nextCount: {
    fontSize: 11,
    color: COLORS.PRIMARY,
    fontWeight: '700',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.LIGHT_RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  dcText: {
    fontSize: 11,
    color: COLORS.MUTED,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  addressText: {
    fontSize: 12,
    color: COLORS.MUTED,
    flex: 1,
    lineHeight: 17,
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  infoBox: {
    flex: 1,
    backgroundColor: COLORS.BG,
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.MUTED,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginTop: 2,
  },
  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  viewDetailsBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  viewDetailsBtnText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },
});
