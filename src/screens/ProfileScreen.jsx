import React, {useState} from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';
import {useAuthStore} from '../store/authStore';
import AppModal from '../components/AppModal';

const menuItems = [
  {id: 'returns', icon: 'rotate-ccw', lib: 'feather', label: 'My Returns', screen: 'Returns'},
  {id: 'history', icon: 'clock', lib: 'feather', label: 'Delivery History', screen: 'History'},
  {id: 'route', icon: 'map', lib: 'feather', label: 'My Route', screen: 'Route'},
  {id: 'notifications', icon: 'bell', lib: 'feather', label: 'Notifications', screen: 'Notifications'},
  {id: 'settings', icon: 'settings', lib: 'feather', label: 'Settings', screen: 'Settings'},
];

export default function ProfileScreen({navigation}) {
  const agent = useAuthStore(state => state.agent);
  const logout = useAuthStore(state => state.logout);
  const [showLogout, setShowLogout] = useState(false);

  const handleMenuPress = item => {
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  const handleLogout = async () => {
    setShowLogout(false);
    await logout();
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{paddingBottom: 30}}
        showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>RK</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{agent?.name || 'Agent'}</Text>
              <Text style={styles.profileId}>Agent ID: {agent?.agentId || ''}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeBadgeText}>{agent?.status || 'Active'}</Text>
                </View>
                <View style={styles.zoneRow}>
                  <Icon name="map-pin" size={11} color={COLORS.MUTED} />
                  <Text style={styles.zoneText}> {agent?.zone || ''}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <IconMC name="truck-check-outline" size={18} color={COLORS.PRIMARY} />
            <Text style={styles.statValue}>
              {(agent?.stats?.totalDeliveries || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Deliveries</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Icon name="trending-up" size={18} color={COLORS.SUCCESS} />
            <Text style={styles.statValue}>{agent?.successRate || '0%'}</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="zap" size={18} color={COLORS.WARNING} />
            <Text style={styles.statValue}>{agent?.stats?.avgPerDay || 0}</Text>
            <Text style={styles.statLabel}>Avg/Day</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => {
            const IconLib = item.lib === 'mc' ? IconMC : Icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.6}>
                <View style={styles.menuIconWrap}>
                  <IconLib name={item.icon} size={18} color={COLORS.TEXT} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Icon name="chevron-right" size={18} color={COLORS.MUTED} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogout(true)}
          activeOpacity={0.7}>
          <Icon name="log-out" size={18} color={COLORS.PRIMARY} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ChakraDeliver v1.0.0</Text>
      </ScrollView>

      <AppModal
        visible={showLogout}
        type="warning"
        title="Logout"
        message="Are you sure you want to logout? You'll need to login again with OTP."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
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
    paddingTop: 32,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.WHITE,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  profileCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.WHITE,
  },
  profileInfo: {flex: 1},
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  profileId: {
    fontSize: 12,
    color: COLORS.MUTED,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.SUCCESS,
    marginRight: 4,
  },
  activeBadgeText: {
    fontSize: 10,
    color: COLORS.SUCCESS,
    fontWeight: '700',
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneText: {
    fontSize: 11,
    color: COLORS.MUTED,
  },
  statsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.BORDER,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.MUTED,
    marginTop: 2,
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BG,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.LIGHT_RED,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  logoutText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '700',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.MUTED,
    marginTop: 4,
  },
});
