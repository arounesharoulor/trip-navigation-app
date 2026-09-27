# Trip Navigation App

A beautiful, fully functional UI prototype for a ride-sharing and navigation mobile application built with **React Native** and **Expo**. This project precisely implements a minimalist Figma design, complete with user authentication, location searching, and dynamic live maps.

## ✨ Features

- **Authentication System:** 
  - Login and Create Account screens.
  - State management powered by React Context API (`AuthContext`).
  - Persistent login state using `@react-native-async-storage/async-storage`.

- **Location & Search:** 
  - Dynamic "Set Location" screen with interactive input focus states.
  - Reverse-geocoding using `expo-location` to grab the user's real-world current address.
  - Real-time search filtering for saved and recent places.

- **Dynamic Live Maps:** 
  - 100% free, API-keyless live map powered by **Leaflet** and `react-native-webview`.
  - Automatically fetches authentic Google Maps tiles (`mt1.google.com`) for a rich, detailed map experience that bypasses native SDK billing locks and crashes.
  - Dynamically centers the map and draws a route line based on the user's selected pickup and drop-off locations (e.g., automatically detecting coordinates for Chennai vs. Doha).

- **Route Navigation Simulation:**
  - Interactive tab switching (Drive, Ride, Walk) that dynamically recalculates travel time and distance.
  - Real-time "Navigation Mode" that simulates driving by ticking down the distance remaining and updating turn-by-turn instructions automatically.
  - Custom traffic alert badges and interactive floating action buttons.

## 🛠️ Technology Stack

- **Framework:** [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) (SDK 51+)
- **Navigation:** [React Navigation v6](https://reactnavigation.org/) (Native Stack)
- **Maps:** Leaflet.js via `react-native-webview` (Replaced `react-native-maps` to avoid Google Cloud API billing locks and fatal `AIRMap` duplicate registry bugs in Expo Go).
- **Icons:** `@expo/vector-icons` (Ionicons)
- **Storage:** `@react-native-async-storage/async-storage`

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed, and the [Expo Go](https://expo.dev/client) app installed on your iOS or Android device.

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Start the Development Server
\`\`\`bash
npx expo start
\`\`\`
*(If you encounter caching errors regarding native modules, clear the cache using `npx expo start -c`)*

### 3. Run the App
Scan the QR code printed in the terminal using the Expo Go app on your phone, or press `a` to run it on an Android Emulator.

## 📦 Building an APK (Android)

By default, EAS builds `.aab` files for the Google Play Store. We have configured a special `preview` profile in `eas.json` that generates an `.apk` file so you can easily install and test the app directly on your device.

Run the following command to build the APK in the cloud:
\`\`\`bash
eas build -p android --profile preview
\`\`\`
Once the build finishes, EAS will provide a direct download link to your `.apk` file.
