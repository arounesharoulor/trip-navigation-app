import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';

const { width, height } = Dimensions.get('window');

// Mock coordinates for Doha (Home to Marina Office Tower)
const HOME_COORD = { latitude: 25.3184, longitude: 51.5273 };
const MARINA_COORD = { latitude: 25.3855, longitude: 51.5312 };

export default function RouteViewScreen({ navigation, route }) {
  const { pickup = 'Home', dropoff = 'Marina Office Tower' } = route.params || {};
  const [activeTab, setActiveTab] = useState('Drive');
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(9600); // 9.6 km
  const [currentInstruction, setCurrentInstruction] = useState('Head north on Street 840');
  const [currentIcon, setCurrentIcon] = useState('arrow-up');
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

  useEffect(() => {
    let interval;
    if (isNavigating) {
      interval = setInterval(() => {
        setCurrentDistance((prev) => {
          if (prev > 100) {
            return prev - 100;
          } else {
            if (currentInstruction.includes('Street 840') || currentInstruction.includes('Head north')) {
              setCurrentInstruction('Turn right at the junction');
              setCurrentIcon('arrow-redo');
              return 1800; 
            } else {
              return 0;
            }
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isNavigating, currentInstruction]);

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setCurrentDistance(9600); 
    setCurrentInstruction('Head north on main road');
    setCurrentIcon('arrow-up');
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
  };

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
      <View style={[styles.mapContainer, isNavigating && { height: height }]}>
        <WebView 
          source={{ html: mapHTML }} 
          style={styles.map} 
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Navigation Mode Header Overlay */}
        {isNavigating && (
          <View style={[styles.navigationHeader, { paddingTop: Math.max(insets.top, 20) }]}>
            <View style={styles.navInstructionRow}>
              <Ionicons name={currentIcon} size={40} color={COLORS.white} />
              <View style={styles.navInstructionTextContainer}>
                <Text style={styles.navInstructionDistance}>
                  {currentDistance > 1000 ? (currentDistance / 1000).toFixed(1) + ' km' : currentDistance + ' m'}
                </Text>
                <Text style={styles.navInstructionAction}>{currentInstruction}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Floating Header Actions (Only when NOT navigating) */}
        {!isNavigating && (
          <View style={[styles.floatingHeader, { top: Math.max(insets.top, 20) }]}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="layers-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* Traffic Alert Badge (Only when NOT navigating) */}
        {!isNavigating && (
          <View style={styles.trafficBadge}>
            <Text style={styles.trafficBadgeText}>⚠️ Heavy traffic near the marina</Text>
          </View>
        )}

        {/* Stop Navigation Button */}
        {isNavigating && (
          <View style={[styles.stopNavContainer, { bottom: Math.max(insets.bottom, 20) }]}>
             <TouchableOpacity style={styles.stopNavButton} onPress={handleStopNavigation}>
               <Ionicons name="close" size={28} color={COLORS.white} />
             </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Sheet (Hidden during navigation) */}
      {!isNavigating && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            
            <View style={styles.routeHeader}>
              <View>
                <Text style={styles.fastestRouteText}>
                  {activeTab === 'Walk' ? 'Walking route' : 'Fastest route'}
                </Text>
                <View style={styles.travelDetailsRow}>
                  <Text style={styles.timeText}>
                    {activeTab === 'Drive' ? '24 min' : activeTab === 'Ride' ? '28 min' : '1 hr 55 min'}
                  </Text>
                  <Text style={styles.distanceText}>
                    {activeTab === 'Walk' ? ' (9.2 km · arrive 12:13)' : activeTab === 'Ride' ? ' (9.6 km · arrive 10:46)' : ' (9.6 km · arrive 10:42)'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tabsContainer}>
              {['Drive', 'Ride', 'Walk'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.waypointsContainer}>
              <View style={styles.waypointRow}>
                <View style={styles.waypointDot} />
                <Text style={styles.waypointText}>{pickup} · Villa 12, Street 840</Text>
              </View>
              <View style={styles.waypointConnector} />
              <View style={styles.waypointRow}>
                <View style={styles.waypointSquare} />
                <Text style={styles.waypointText}>{dropoff} · Level 14, Al Fardan Rd</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.turnByTurnContainer}>
              <View style={styles.turnRow}>
                <View style={styles.turnIconContainer}>
                  <Ionicons name="arrow-up" size={20} color={COLORS.icon} />
                </View>
                <View style={styles.turnDetails}>
                  <Text style={styles.turnInstruction}>Head north on Street 840</Text>
                  <Text style={styles.turnSubInstruction}>Keep right past the service road</Text>
                </View>
                <Text style={styles.turnDistance}>450 m</Text>
              </View>

              <View style={styles.turnRow}>
                <View style={styles.turnIconContainer}>
                  <Ionicons name="arrow-redo" size={20} color={COLORS.icon} />
                </View>
                <View style={styles.turnDetails}>
                  <Text style={styles.turnInstruction}>Turn right onto Al Istiqlal St</Text>
                  <Text style={styles.turnSubInstruction}>Moderate traffic near the roundabout</Text>
                </View>
                <Text style={styles.turnDistance}>1.8 km</Text>
              </View>
            </View>

          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SIZES.padding) }]}>
            <TouchableOpacity style={styles.startButton} onPress={handleStartNavigation}>
              <Ionicons name="navigate" size={20} color={COLORS.white} style={styles.startIcon} />
              <Text style={styles.startButtonText}>Start navigation</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    height: height * 0.45,
    position: 'relative',
    backgroundColor: '#E8EAED',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  floatingHeader: {
    position: 'absolute',
    left: SIZES.padding,
    right: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trafficBadge: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trafficBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
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
  bottomSheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetContent: {
    padding: SIZES.padding,
    paddingTop: 8,
  },
  routeHeader: {
    marginBottom: 16,
  },
  fastestRouteText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  travelDetailsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  distanceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: SIZES.radius - 4,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.text,
  },
  waypointsContainer: {
    marginBottom: 16,
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waypointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  waypointSquare: {
    width: 10,
    height: 10,
    backgroundColor: COLORS.icon,
    marginRight: 12,
  },
  waypointConnector: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
    marginLeft: 4,
    marginVertical: 4,
  },
  waypointText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  turnByTurnContainer: {
    marginBottom: 20,
  },
  turnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  turnIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  turnDetails: {
    flex: 1,
  },
  turnInstruction: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  turnSubInstruction: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  turnDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  footer: {
    padding: SIZES.padding,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startIcon: {
    marginRight: 8,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F9D58', // Green navigation color
    padding: SIZES.padding,
    paddingBottom: 20,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  navInstructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navInstructionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  navInstructionDistance: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  navInstructionAction: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
  },
  stopNavContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
  },
  stopNavButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
