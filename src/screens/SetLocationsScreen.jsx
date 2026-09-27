import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';
import { AuthContext } from '../context/AuthContext';

const MOCK_PLACES_DB = {
  'Chennai': [
    { id: '1', title: 'Home', subtitle: 'Anna Nagar, Chennai', icon: 'home-outline' },
    { id: '2', title: 'Tidel Park', subtitle: 'Taramani, Chennai', icon: 'business-outline' },
    { id: '3', title: 'Marina Beach', subtitle: 'Marina Beach Road, Chennai', icon: 'water-outline' },
    { id: '4', title: 'Chennai Central Railway Station', subtitle: 'Park Town, Chennai', icon: 'train-outline' },
    { id: '5', title: 'Chennai International Airport', subtitle: 'Meenambakkam, Chennai', icon: 'airplane-outline' },
  ],
  'Doha': [
    { id: '1', title: 'Home', subtitle: 'Villa 12, Street 840, Zone 61 · West Bay', icon: 'home-outline' },
    { id: '2', title: 'Marina Office Tower', subtitle: 'Level 14, Al Fardan Rd · Lusail Marina', icon: 'business-outline' },
    { id: '3', title: 'Corniche Ferry Terminal', subtitle: 'Gate 3, Corniche Promenade', icon: 'boat-outline' },
    { id: '4', title: 'Msheireb Metro Station', subtitle: 'Al Kinana St · Msheireb Downtown', icon: 'train-outline' },
    { id: '5', title: 'Hamad International Airport', subtitle: 'Doha, Qatar', icon: 'airplane-outline' },
  ],
  'Default': [
    { id: '1', title: 'Home', subtitle: 'Your saved home address', icon: 'home-outline' },
    { id: '2', title: 'Work', subtitle: 'Your saved work address', icon: 'business-outline' },
    { id: '3', title: 'Central Station', subtitle: 'Main city railway station', icon: 'train-outline' },
    { id: '4', title: 'City Airport', subtitle: 'International Airport', icon: 'airplane-outline' },
    { id: '5', title: 'Downtown Mall', subtitle: 'City Center Shopping Mall', icon: 'cart-outline' },
  ]
};

export default function SetLocationsScreen({ navigation }) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [activeInput, setActiveInput] = useState('pickup');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [suggestedPlaces, setSuggestedPlaces] = useState(MOCK_PLACES_DB['Default']);
  const insets = useSafeAreaInsets();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          let geocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
          
          if (geocode && geocode.length > 0) {
            const city = geocode[0].city || geocode[0].region || '';
            if (city.includes('Chennai')) {
              setSuggestedPlaces(MOCK_PLACES_DB['Chennai']);
            } else if (city.includes('Doha')) {
              setSuggestedPlaces(MOCK_PLACES_DB['Doha']);
            } else {
              setSuggestedPlaces(MOCK_PLACES_DB['Default']);
            }
          }
        }
      } catch (error) {
        // Silently fail for background check
      }
    })();
  }, []);

  const handleSwap = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const handleSelectPlace = (place) => {
    if (activeInput === 'pickup') {
      setPickup(place.title);
      setActiveInput('dropoff');
    } else {
      setDropoff(place.title);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant location permission to use this feature.');
        setIsLoadingLocation(false);
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      if (geocode && geocode.length > 0) {
        const g = geocode[0];
        
        // Construct a highly detailed address
        const streetDetails = [g.streetNumber, g.street].filter(Boolean).join(' ');
        const addressParts = [
          streetDetails || g.name, 
          g.district || g.subregion, 
          g.city, 
          g.region
        ].filter(Boolean);
        
        // Remove duplicates like "Chennai, Chennai"
        const uniqueParts = [...new Set(addressParts)];
        const address = uniqueParts.join(', ') || 'Current Location';
        const city = g.city || g.region || '';
        
        if (activeInput === 'pickup') {
          setPickup(address);
          setActiveInput('dropoff');
        } else {
          setDropoff(address);
        }

        // Update suggested places based on explicit location fetch
        if (city.includes('Chennai')) {
          setSuggestedPlaces(MOCK_PLACES_DB['Chennai']);
        } else if (city.includes('Doha')) {
          setSuggestedPlaces(MOCK_PLACES_DB['Doha']);
        } else {
          setSuggestedPlaces(MOCK_PLACES_DB['Default']);
        }
      } else {
        Alert.alert('Location Error', 'Could not determine address.');
      }
    } catch (error) {
      Alert.alert('Location Error', 'Error fetching location: ' + error.message);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const isNextEnabled = pickup.length > 0 && dropoff.length > 0;

  const getFilteredPlaces = () => {
    const searchText = activeInput === 'pickup' ? pickup : dropoff;
    if (!searchText) return suggestedPlaces;
    
    return suggestedPlaces.filter(place => 
      place.title.toLowerCase().includes(searchText.toLowerCase()) || 
      place.subtitle.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const filteredPlaces = getFilteredPlaces();

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <TouchableOpacity style={styles.backButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Where are you going?</Text>
            <Text style={styles.stepIndicator}>Step 1 of 2 · Set pickup and drop-off</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
          <View style={styles.selectorCard}>
            <View style={styles.inputRow}>
              <View style={styles.indicatorContainer}>
                <View style={styles.orangeDot} />
                <View style={styles.solidLine} />
                <View style={styles.darkSquare} />
              </View>
              <View style={styles.inputsWrapper}>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Pickup</Text>
                  <TextInput
                    style={styles.locationInput}
                    placeholder="Choose a starting point"
                    placeholderTextColor={COLORS.textSecondary}
                    value={pickup}
                    onChangeText={setPickup}
                    onFocus={() => setActiveInput('pickup')}
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Drop-off</Text>
                  <TextInput
                    style={styles.locationInput}
                    placeholder="Choose a destination"
                    placeholderTextColor={COLORS.textSecondary}
                    value={dropoff}
                    onChangeText={setDropoff}
                    onFocus={() => setActiveInput('dropoff')}
                  />
                </View>
              </View>
              <View style={styles.swapButtonContainer}>
                <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                  <Ionicons name="swap-vertical" size={20} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.shortcutsRow}>
            <TouchableOpacity style={styles.shortcutButton} onPress={handleUseCurrentLocation} disabled={isLoadingLocation}>
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={styles.shortcutIcon} />
              ) : (
                <Ionicons name="locate" size={18} color={COLORS.text} style={styles.shortcutIcon} />
              )}
              <Text style={styles.shortcutText}>{isLoadingLocation ? 'Locating...' : 'Use current'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortcutButton}>
              <Ionicons name="map-outline" size={18} color={COLORS.text} style={styles.shortcutIcon} />
              <Text style={styles.shortcutText}>Pick on map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.savedPlacesContainer}>
            <Text style={styles.sectionTitle}>
              {filteredPlaces.length > 0 ? `Set as ${activeInput === 'pickup' ? 'pickup' : 'drop-off'}` : 'No suggestions found'}
            </Text>
            <View style={styles.savedPlacesCard}>
              {filteredPlaces.map((item, index) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.placeItem, index === filteredPlaces.length - 1 && { borderBottomWidth: 0 }]} 
                  onPress={() => handleSelectPlace(item)}
                >
                  <View style={styles.placeIconContainer}>
                    <Ionicons name={item.icon} size={20} color={COLORS.text} />
                  </View>
                  <View style={styles.placeDetails}>
                    <Text style={styles.placeTitle}>{item.title}</Text>
                    <Text style={styles.placeSubtitle}>{item.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SIZES.padding) }]}>
          <TouchableOpacity 
            style={[styles.nextButton, !isNextEnabled && styles.nextButtonDisabled]}
            disabled={!isNextEnabled}
            onPress={() => navigation.navigate('TripReady', { pickup, dropoff })}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SIZES.padding,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  backButton: {
    marginRight: 12,
    marginTop: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  stepIndicator: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  selectorCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
  },
  indicatorContainer: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 10,
    paddingBottom: 24,
    width: 20,
  },
  orangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  solidLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  darkSquare: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.icon,
    borderRadius: 1,
  },
  inputsWrapper: {
    flex: 1,
  },
  inputBox: {
    paddingVertical: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  locationInput: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    padding: 0,
    height: 24,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  swapButtonContainer: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortcutsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  shortcutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    flex: 0.48,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 1,
  },
  shortcutIcon: {
    marginRight: 8,
  },
  shortcutText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  savedPlacesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  savedPlacesCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
    flex: 1,
    marginBottom: 16,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  placeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeDetails: {
    flex: 1,
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  placeSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    paddingBottom: Platform.OS === 'ios' ? 32 : SIZES.padding,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
