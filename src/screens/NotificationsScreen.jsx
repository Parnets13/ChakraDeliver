import React, {useEffect, useCallback} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';
import {useDeliveryStore} from '../store/deliveryStore';

const typeIcons = {
  new_delivery: {icon: 'package-variant', lib: 'mc', color: COLORS.PRIMARY, bg: COLORS.LIGHT_RED},
  delivery_cancelled: {icon: 'close-circle-outline', lib: 'mc', color: COLORS.FAILED, bg: COLORS.LIGHT_RED},
  route_update: {icon: 'map-pin', lib: 'feather', color: '#3B82F6', bg: COLORS.LIGHT_BLUE},
  return_approved: {icon: 'rotate-ccw', lib: 'feather', color: COLORS.WARNING, bg: COLORS.LIGHT_ORANGE},
  system: {icon: 'bell', lib: 'feather', color: COLORS.MUTED, bg: COLORS.BG},
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen({navigation}) {
  const notifications = useDeliveryStore(state => state.notifications);
  const fetchNotifications = useDeliveryStore(state => state.fetchNotifications);
  const markNotificationsRead = useDeliveryStore(state => state.markNotificationsRead);
  const getUnreadCount = useDeliveryStore(state => state.getUnreadCount);
  const isLoading = useDeliveryStore(state => state.isLoading);
  const unreadCount = getUnreadCount();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => {
    markNotificationsRead([]);
  };

  const renderNotification = ({item}) => {
    const typeStyle = typeIcons[item.type] || typeIcons.system;
    const IconComponent = typeStyle.lib === 'mc' ? IconMC : Icon;

    return (
      <View style={[styles.notifCard, !item.read && styles.unreadCard]}>
        <View style={[styles.iconCircle, {backgroundColor: typeStyle.bg}]}>
          <IconComponent name={typeStyle.icon} size={16} color={typeStyle.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifMessage}>{item.message}</Text>
          <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <IconMC name="bell-off-outline" size={40} color={COLORS.BORDER} />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySub}>You'll be notified when new deliveries are assigned</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color={COLORS.WHITE} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllBtn}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderNotification}
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />
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
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  markAllBtn: {
    fontSize: 12,
    color: COLORS.WHITE,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  list: {
    padding: 14,
  },
  emptyList: {
    flex: 1,
  },
  notifCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 3,
  },
  notifMessage: {
    fontSize: 12,
    color: COLORS.MUTED,
    lineHeight: 16,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 10,
    color: COLORS.MUTED,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginTop: 14,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.MUTED,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
