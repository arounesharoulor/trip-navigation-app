import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';

const { width, height } = Dimensions.get('window');

// Mock coordinates for map background
const HOME_COORD = { latitude: 25.3184, longitude: 51.5273 };
const MARINA_COORD = { latitude: 25.3855, longitude: 51.5312 };

export default function TripReadyScreen({ navigation, route }) {
  const { pickup = 'Current Location', dropoff = 'Destination' } = route.params || {};
  const insets = useSafeAreaInsets();

  // Dynamically resolve coordinates based on text (Mock Geocoding)
  const resolveCoordinates = (text, isPickup) => {
    const lower = text.toLowerCase();
    if (lower.includes('chennai') || lower.includes('tidel') || lower.includes('anna') || lower.includes('raja')) {
      if (lower.includes('tidel')) return { latitude: 12.9896, longitude: 80.2476 };
      if (isPickup) return { latitude: 13.0235, longitude: 80.2647 }; // Raja Annamalaipuram
      return { latitude: 13.0827, longitude: 80.2707 };
    }
    // Default Doha
    return isPickup ? { latitude: 25.3184, longitude: 51.5273 } : { latitude: 25.3855, longitude: 51.5312 };
  };

  const HOME_COORD = resolveCoordinates(pickup, true);
  const MARINA_COORD = resolveCoordinates(dropoff, false);

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; background-color: #E8EAED; }
        #map { width: 100%; height: 100vh; }
        .custom-icon { justify-content: center; align-items: center; display: flex; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false });
        
        /* EXACT GOOGLE MAPS DESIGN TILES (No API key required for direct tile fetch) */
        L.tileLayer('http://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20
        }).addTo(map);
        
        var home = [${HOME_COORD.latitude}, ${HOME_COORD.longitude}];
        var marina = [${MARINA_COORD.latitude}, ${MARINA_COORD.longitude}];
        
        var bounds = L.latLngBounds([home, marina]);
        map.fitBounds(bounds, { padding: [50, 50] });

        L.polyline([home, marina], {color: '${COLORS.primary}', weight: 4, dashArray: '5, 5'}).addTo(map);
        
        var originIcon = L.divIcon({
          className: 'custom-icon',
          html: '<div style="background-color:${COLORS.primary}; width:14px; height:14px; border-radius:50%; border: 2px solid white;"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });
        
        var destIcon = L.divIcon({
          className: 'custom-icon',
          html: '<div style="background-color:${COLORS.text}; width:14px; height:14px; border: 2px solid white;"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });

        L.marker(home, {icon: originIcon}).addTo(map);
        L.marker(marina, {icon: destIcon}).addTo(map);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView 
        source={{ html: mapHTML }} 
        style={styles.map} 
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Where are you going?</Text>
          <Text style={styles.stepIndicator}>Step 2 of 2 · Confirm route</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.floatingCard}>
          <View style={styles.inputRow}>
            <View style={styles.indicatorContainer}>
              <View style={styles.orangeDot} />
              <View style={styles.dottedLine} />
              <View style={styles.darkSquare} />
            </View>
            <View style={styles.inputsWrapper}>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Pickup</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.locationValue} numberOfLines={1}>{pickup}</Text>
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Drop-off</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.locationValue} numberOfLines={1}>{dropoff}</Text>
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.textSecondary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Route is ready. Proceed to view the turn-by-turn details and start your journey.
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SIZES.padding) }]}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => navigation.navigate('RouteView', { pickup, dropoff })}
        >
          <Text style={styles.nextButtonText}>View Route</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: 'rgba(244, 245, 247, 0.9)', // Slight opacity for map behind header
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepIndicator: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
  },
  floatingCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputRow: {
    flexDirection: 'row',
  },
  indicatorContainer: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  orangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  dottedLine: {
    width: 1,
    flex: 1,
    backgroundColor: COLORS.gray,
    marginVertical: 4,
    borderStyle: 'dashed',
  },
  darkSquare: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.icon,
  },
  inputsWrapper: {
    flex: 1,
  },
  inputBox: {
    paddingVertical: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationValue: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: SIZES.padding,
    paddingTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0)', // Transparent so button floats
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  originDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  destinationSquare: {
    width: 14,
    height: 14,
    backgroundColor: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
