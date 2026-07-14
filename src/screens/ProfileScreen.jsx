import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';
import {useAuthStore} from '../store/authStore';
import AppModal from '../components/AppModal';

const menuItems = [
  {id: 'returns', icon: 'rotate-ccw', lib: 'feather', label: 'My Returns', screen: 'Main', params: {screen: 'Returns'}},
  {id: 'history', icon: 'clock', lib: 'feather', label: 'Delivery History', screen: 'History'},
  {id: 'route', icon: 'map', lib: 'feather', label: 'My Route', screen: 'Route'},
  {id: 'notifications', icon: 'bell', lib: 'feather', label: 'Notifications', screen: 'Notifications'},
  {id: 'settings', icon: 'settings', lib: 'feather', label: 'Settings', screen: 'Settings'},
];

/** Format an ISO date string / Date object to DD/MM/YYYY for display */
function fmtDate(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Reusable detail row for Personal Details card */
function DetailRow({icon, label, value, masked, multiline, last}) {
  const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
  return (
    <View style={[pdStyles.row, !last && pdStyles.rowBorder]}>
      <View style={pdStyles.iconWrap}>
        <Icon name={icon} size={13} color={COLORS.PRIMARY} />
      </View>
      <View style={pdStyles.rowContent}>
        <Text style={pdStyles.rowLabel}>{label}</Text>
        <Text
          style={[
            pdStyles.rowValue,
            masked && pdStyles.rowMasked,
            isEmpty && pdStyles.rowEmpty,
          ]}
          numberOfLines={multiline ? 3 : 1}>
          {isEmpty ? '—' : value}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen({navigation}) {
  const agent = useAuthStore(state => state.agent);
  const logout = useAuthStore(state => state.logout);
  const loadProfile = useAuthStore(state => state.loadProfile);
  const [showLogout, setShowLogout] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [savedPassword, setSavedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Fetch fresh profile data on mount so Personal Details are always up-to-date
  useEffect(() => {
    (async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        await loadProfile();
        // Load locally-stored password (saved at login time)
        const pwd = await AsyncStorage.getItem('userPassword');
        setSavedPassword(pwd || '');
      } catch {
        setProfileError('Could not load profile details. Please try again.');
      } finally {
        setProfileLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuPress = item => {
    if (item.screen) {
      navigation.navigate(item.screen, item.params || undefined);
    }
  };

  const handleLogout = async () => {
    setShowLogout(false);
    await logout();
    navigation.reset({index: 0, routes: [{name: 'SelectUserType'}]});
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
            {/* Avatar — shows profile photo if available, else initials */}
            <View style={styles.avatarWrap}>
              {agent?.profilePhoto ? (
                <Image
                  source={{uri: agent.profilePhoto}}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {agent?.name
                      ? agent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      : 'AG'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{agent?.name || 'Agent'}</Text>
              <Text style={styles.profileId}>ID: {agent?.agentId || ''}</Text>
              {agent?.designation ? (
                <Text style={styles.profileDesig}>{agent.designation}</Text>
              ) : null}
              <View style={styles.badgeRow}>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeBadgeText}>{agent?.status || 'Active'}</Text>
                </View>
                {agent?.department ? (
                  <View style={styles.deptBadge}>
                    <Text style={styles.deptBadgeText}>{agent.department}</Text>
                  </View>
                ) : null}
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

        {/* ─── Personal Details Card ─────────────────────────────── */}
        <View style={styles.personalCard}>
          {/* Card header */}
          <View style={styles.personalCardHeader}>
            <View style={styles.personalCardHeaderIcon}>
              <Icon name="credit-card" size={15} color={COLORS.WHITE} />
            </View>
            <View>
              <Text style={styles.personalCardTitle}>User Details</Text>
             
            </View>
          </View>

          {profileLoading ? (
            <View style={styles.personalLoadingWrap}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <Text style={styles.personalLoadingText}>Fetching your details…</Text>
            </View>
          ) : profileError ? (
            <TouchableOpacity
              style={styles.personalErrorWrap}
              onPress={async () => {
                setProfileLoading(true);
                setProfileError(null);
                try { await loadProfile(); } catch { setProfileError('Could not load profile. Tap to retry.'); }
                finally { setProfileLoading(false); }
              }}>
              <Icon name="alert-circle" size={20} color={COLORS.FAILED} />
              <Text style={styles.personalErrorText}>{profileError}</Text>
              <Icon name="refresh-cw" size={14} color={COLORS.FAILED} />
            </TouchableOpacity>
          ) : (
            <View style={styles.personalBody}>
              <View style={styles.sectionCard}>
                <DetailRow icon="user"        label="Full Name"       value={agent?.name} />
                <DetailRow icon="phone"       label="Mobile"          value={agent?.phone} />
                <DetailRow icon="mail"        label="Email ID"        value={agent?.email} />
                {/* Password row — shows actual password with show/hide toggle */}
                <View style={[pdStyles.row, pdStyles.rowBorder]}>
                  <View style={pdStyles.iconWrap}>
                    <Icon name="lock" size={13} color={COLORS.PRIMARY} />
                  </View>
                  <View style={[pdStyles.rowContent, {paddingRight: 4}]}>
                    <Text style={pdStyles.rowLabel}>Password</Text>
                    <Text
                      style={[pdStyles.rowValue, !showPassword && pdStyles.rowMasked]}
                      numberOfLines={1}>
                      {savedPassword
                        ? (showPassword ? savedPassword : '•'.repeat(savedPassword.length))
                        : '••••••••'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowPassword(p => !p)}
                      style={pdStyles.eyeBtn}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={15}
                        color={COLORS.MUTED}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <DetailRow icon="grid"        label="Department"      value={agent?.department} />
                <DetailRow icon="award"       label="Designation"     value={agent?.designation} />
                <DetailRow icon="calendar"    label="Date of Joining" value={fmtDate(agent?.joiningDate)} />
                <DetailRow icon="file-text"   label="GST Number"      value={agent?.gstNumber} />
                <DetailRow icon="credit-card" label="PAN Card No."    value={agent?.panNumber} />
                <DetailRow icon="briefcase"   label="Industry"        value={agent?.industry} />
                <DetailRow icon="users"       label="Gender"          value={agent?.gender} />
                <DetailRow icon="map-pin"     label="Address"         value={agent?.address} multiline last />
              </View>
            </View>
          )}
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
  /* Avatar wrapper — same size for photo and initials */
  avatarWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    marginRight: 14,
    borderWidth: 2.5,
    borderColor: COLORS.PRIMARY,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
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
  profileDesig: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: '600',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
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
  deptBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  deptBadgeText: {
    fontSize: 10,
    color: '#4F46E5',
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

  // ─── Personal Details Card ────────────────────────────────────────────────
  personalCard: {
    backgroundColor: COLORS.BG,
    borderRadius: 0,
    marginBottom: 12,
  },
  personalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
    elevation: 3,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  personalCardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.WHITE,
    letterSpacing: 0.3,
  },
  personalCardSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  personalBody: {
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: 'hidden',
  },

  // Loading / error states
  personalLoadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingVertical: 28,
    gap: 10,
    elevation: 1,
  },
  personalLoadingText: {
    fontSize: 13,
    color: COLORS.MUTED,
    marginLeft: 8,
  },
  personalErrorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_RED,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  personalErrorText: {
    fontSize: 13,
    color: COLORS.FAILED,
    fontWeight: '600',
    flex: 1,
  },

  // kept for safety (unused stubs)
  personalCardHeaderIcon_old: {},
  personalDivider: {height: 0},
  personalRow: {},
  personalRowBorder: {},
  personalRowLeft: {},
  personalRowIconWrap: {},
  personalRowLabel: {},
  personalRowValue: {},
  personalRowMasked: {},
  personalRowNA: {},
  personalPhotoRow: {},
  personalPhotoImg: {},
  personalPhotoFallback: {},
  personalPhotoFallbackText: {},
  personalPhotoInfo: {},
  personalPhotoName: {},
  personalPhotoDesig: {},
});

// ─── DetailRow styles (used by the DetailRow component above) ────────────────
const pdStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: COLORS.WHITE,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.LIGHT_RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '600',
    flex: 1,
  },
  rowValue: {
    fontSize: 13,
    color: COLORS.TEXT,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1.6,
  },
  rowMasked: {
    fontSize: 18,
    letterSpacing: 3,
    color: COLORS.MUTED,
    fontWeight: '400',
  },
  rowEmpty: {
    color: '#CCCCCC',
    fontWeight: '400',
    fontStyle: 'italic',
    fontSize: 15,
  },
  eyeBtn: {
    paddingLeft: 8,
  },
});
