import React from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS} from '../theme/colors';

export default function TermsScreen({navigation}) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Privacy Policy</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* About Company */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Sri Chakra Industries</Text>
          <Text style={styles.paragraph}>
            Sri Chakra Industries was established in the year 2010. We are a
            leading manufacturer of pressure cookers and solar cookers based in
            India.
          </Text>
          <Text style={styles.paragraph}>
            We are a manufacturer, exporter and supplier of solar cookers. Solar
            cooker is preferred by most people because it is the simplest and
            safest mode to cook food. Solar cookers are available in different
            sizes. Our expert professionals have uniquely designed them.
          </Text>
          <Text style={styles.paragraph}>
            We offer a wide range of Pressure Cookers that are manufactured by
            our deft professionals using supreme quality metal alloys in
            compliance with set industry norms. Renowned for compact design,
            fine finish, corrosion resistance and durability, our pressure
            cookers have the ability to withstand extreme pressure.
          </Text>
        </View>

        {/* Terms of Service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms of Service</Text>
          <Text style={styles.paragraph}>
            By using the ChakraDeliver application, you agree to the following
            terms and conditions:
          </Text>

          <View style={styles.termItem}>
            <Text style={styles.termNumber}>1.</Text>
            <Text style={styles.termText}>
              This application is exclusively for authorized delivery agents of
              Sri Chakra Industries. Unauthorized access is strictly prohibited.
            </Text>
          </View>

          <View style={styles.termItem}>
            <Text style={styles.termNumber}>2.</Text>
            <Text style={styles.termText}>
              Delivery agents must ensure timely and safe delivery of all
              assigned packages. Any damage or loss must be reported immediately.
            </Text>
          </View>

          <View style={styles.termItem}>
            <Text style={styles.termNumber}>3.</Text>
            <Text style={styles.termText}>
              Proof of delivery (signature and photo) must be captured for every
              successful delivery. Incomplete POD may result in delivery being
              marked as pending.
            </Text>
          </View>

          <View style={styles.termItem}>
            <Text style={styles.termNumber}>4.</Text>
            <Text style={styles.termText}>
              Location tracking is enabled during active delivery hours for
              route optimization and delivery verification purposes.
            </Text>
          </View>

          <View style={styles.termItem}>
            <Text style={styles.termNumber}>5.</Text>
            <Text style={styles.termText}>
              The company reserves the right to modify these terms at any time.
              Continued use of the app constitutes acceptance of updated terms.
            </Text>
          </View>
        </View>

        {/* Privacy Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.paragraph}>
            Sri Chakra Industries is committed to protecting your privacy. This
            policy explains how we collect, use, and safeguard your information.
          </Text>

          <Text style={styles.subTitle}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            • Phone number for authentication{'\n'}
            • Location data during delivery hours{'\n'}
            • Delivery photos and signatures{'\n'}
            • Device information for app functionality
          </Text>

          <Text style={styles.subTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            • To verify your identity as an authorized agent{'\n'}
            • To assign and track deliveries{'\n'}
            • To optimize delivery routes{'\n'}
            • To maintain proof of delivery records{'\n'}
            • To improve our delivery services
          </Text>

          <Text style={styles.subTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your
            data. All information is encrypted in transit and at rest. Access to
            personal data is restricted to authorized personnel only.
          </Text>

          <Text style={styles.subTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            For any questions regarding these terms or privacy policy, please
            contact us at:{'\n\n'}
            Sri Chakra Industries{'\n'}
            Email: info@srichakraindustries.com{'\n'}
            Phone: +91 98765 43210
          </Text>
        </View>

        <Text style={styles.lastUpdated}>Last updated: May 2026</Text>
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
  backIcon: {
    fontSize: 16,
    color: COLORS.WHITE,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 4,
  },
  termNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginRight: 8,
    marginTop: 1,
  },
  termText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    flex: 1,
  },
  lastUpdated: {
    fontSize: 11,
    color: COLORS.MUTED,
    textAlign: 'center',
    marginTop: 4,
  },
});
