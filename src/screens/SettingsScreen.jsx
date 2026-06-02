import React, {useState} from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {COLORS} from '../theme/colors';

export default function SettingsScreen({navigation}) {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={16} color={COLORS.WHITE} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>App preferences</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Toggle Settings */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="bell" size={16} color={COLORS.TEXT} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{false: COLORS.BORDER, true: COLORS.PRIMARY}}
              thumbColor={COLORS.WHITE}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="map-pin" size={16} color={COLORS.TEXT} />
              <Text style={styles.settingLabel}>Location Tracking</Text>
            </View>
            <Switch
              value={locationTracking}
              onValueChange={setLocationTracking}
              trackColor={{false: COLORS.BORDER, true: COLORS.PRIMARY}}
              thumbColor={COLORS.WHITE}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="moon" size={16} color={COLORS.TEXT} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{false: COLORS.BORDER, true: COLORS.PRIMARY}}
              thumbColor={COLORS.WHITE}
            />
          </View>
        </View>

        {/* Info Items */}
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="info" size={16} color={COLORS.TEXT} />
              <Text style={styles.settingLabel}>App Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="trash-2" size={16} color={COLORS.TEXT} />
              <Text style={styles.settingLabel}>Clear Cache</Text>
            </View>
            <Icon name="chevron-right" size={16} color={COLORS.MUTED} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="help-circle" size={16} color={COLORS.TEXT} />
              <Text style={styles.settingLabel}>About</Text>
            </View>
            <Icon name="chevron-right" size={16} color={COLORS.MUTED} />
          </TouchableOpacity>
        </View>

        <View style={{height: 30}} />
      </ScrollView>
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
    paddingBottom: 14,
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
  content: {
    flex: 1,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: COLORS.TEXT,
    marginLeft: 12,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 13,
    color: COLORS.MUTED,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginHorizontal: 12,
  },
});
