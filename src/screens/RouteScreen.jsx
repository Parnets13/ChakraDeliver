import React from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';
import {useDeliveryStore} from '../store/deliveryStore';

export default function RouteScreen({navigation}) {
  const deliveries = useDeliveryStore(state => state.deliveries);
  const todayStops = deliveries.filter(d => d.status !== 'failed');

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
          <Text style={styles.headerTitle}>My Route</Text>
          <Text style={styles.headerSub}>
            {todayStops.length} stops today
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Map Placeholder */}
        <View style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Icon name="map" size={32} color={COLORS.PRIMARY} />
            <Text style={styles.mapText}>Route Visualization</Text>
            <Text style={styles.mapSub}>
              Chennai North Zone
            </Text>
          </View>
        </View>

        {/* Route Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <IconMC name="map-marker-distance" size={16} color={COLORS.PRIMARY} />
            <Text style={styles.summaryValue}>24.5 km</Text>
            <Text style={styles.summaryLabel}>Total Distance</Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="clock" size={16} color={COLORS.PRIMARY} />
            <Text style={styles.summaryValue}>~3.5 hrs</Text>
            <Text style={styles.summaryLabel}>Est. Time</Text>
          </View>
          <View style={styles.summaryItem}>
            <IconMC name="package-variant" size={16} color={COLORS.PRIMARY} />
            <Text style={styles.summaryValue}>{todayStops.length}</Text>
            <Text style={styles.summaryLabel}>Stops</Text>
          </View>
        </View>

        {/* Delivery Stops */}
        <Text style={styles.stopsTitle}>TODAY'S STOPS</Text>
        {todayStops.map((stop, index) => {
          const isDelivered = stop.status === 'delivered';
          return (
            <TouchableOpacity
              key={stop._id || stop.id || index}
              style={styles.stopCard}
              onPress={() =>
                navigation.navigate('DeliveryDetail', {deliveryId: stop._id || stop.id})
              }>
              <View style={styles.stopLeft}>
                <View
                  style={[
                    styles.stopNumber,
                    isDelivered && styles.stopNumberDone,
                  ]}>
                  {isDelivered ? (
                    <Icon name="check" size={12} color={COLORS.WHITE} />
                  ) : (
                    <Text style={styles.stopNumberText}>{index + 1}</Text>
                  )}
                </View>
                {index < todayStops.length - 1 && (
                  <View style={styles.stopLine} />
                )}
              </View>
              <View style={styles.stopContent}>
                <Text style={styles.stopName}>{stop.customerName}</Text>
                <Text style={styles.stopAddress} numberOfLines={1}>
                  {stop.address}
                </Text>
                <View style={styles.stopMeta}>
                  <Text style={styles.stopTime}>{stop.scheduledTime}</Text>
                  <Text
                    style={[
                      styles.stopStatus,
                      {color: isDelivered ? COLORS.SUCCESS : COLORS.WARNING},
                    ]}>
                    {isDelivered ? 'Delivered' : 'Pending'}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={16} color={COLORS.MUTED} />
            </TouchableOpacity>
          );
        })}

        <View style={{height: 20}} />
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
  mapCard: {
    marginBottom: 14,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  mapText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginTop: 8,
  },
  mapSub: {
    fontSize: 11,
    color: COLORS.MUTED,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.MUTED,
    marginTop: 2,
  },
  stopsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  stopCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  stopLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  stopNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.LIGHT_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopNumberDone: {
    backgroundColor: COLORS.SUCCESS,
  },
  stopNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.WARNING,
  },
  stopLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.BORDER,
    marginTop: 4,
  },
  stopContent: {
    flex: 1,
  },
  stopName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  stopAddress: {
    fontSize: 11,
    color: COLORS.MUTED,
    marginTop: 2,
  },
  stopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stopTime: {
    fontSize: 11,
    color: COLORS.TEXT,
    fontWeight: '500',
    marginRight: 10,
  },
  stopStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
});
