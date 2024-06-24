import { SplashScreen, Stack, router } from 'expo-router';
import {
  useFonts,
  Inter_500Medium,
  Inter_700Bold,
  Inter_600SemiBold,
  Inter_400Regular,
} from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import Colors from '../constants/Colors';
import { Platform, Pressable } from 'react-native';
import { BluetoothOff, X } from 'lucide-react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import useBlePermissions from '../hooks/ble/useBlePermissions';
import { State } from 'react-native-ble-plx';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenMsg from '../components/ui/ScreenMsg';
import useBleStates from '../hooks/ble/useBleStates';
import RegisteredHostStorageProvider from '../components/providers/RegisteredHostStorageProvider';

//Splash will not despear until the SplashScreen.hideAsync() is called
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [permissionsGranted, requestPermission] = useBlePermissions();
  const bluetoothState = useBleStates();

  useEffect(() => {
    if (!permissionsGranted) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Prevent rendering until the font has loaded or an error was returned
  if (!fontsLoaded && !fontError) {
    return null;
  }

  //Show if something is wrong with the BLE state
  if (bluetoothState !== State.PoweredOn) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
        <ScreenMsg
          icon={BluetoothOff}
          message="Check if Bluetooth is turned on or if the app has access to it"
          messageColor={Colors.error}
        />
      </SafeAreaView>
    );
  }

  return (
    <RegisteredHostStorageProvider>
      <RootSiblingParent>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="host/register"
            options={{
              title: 'Register New Host',
              presentation: 'modal',
              headerTitleStyle: {
                fontFamily: 'Inter_600SemiBold',
                fontSize: 22,
                color: Colors.text,
              },
              headerTitleAlign: 'center',
              contentStyle: {
                backgroundColor: Colors.background,
              },
              headerTintColor: Colors.text,
              headerRight: () =>
                Platform.OS === 'ios' && (
                  <Pressable
                    style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                    onPress={() => {
                      router.back();
                    }}
                  >
                    <X size={26} color={Colors.text} />
                  </Pressable>
                ),
            }}
          />

          <Stack.Screen
            name="host/detail/[id]"
            options={{
              title: 'Host Detail',
              presentation: 'modal',
              headerTitleStyle: {
                fontFamily: 'Inter_600SemiBold',
                fontSize: 22,
                color: Colors.text,
              },
              headerTitleAlign: 'center',
              contentStyle: {
                backgroundColor: Colors.background,
              },
              headerTintColor: Colors.text,
              headerRight: () =>
                Platform.OS === 'ios' && (
                  <Pressable
                    style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                    onPress={() => {
                      router.back();
                    }}
                  >
                    <X size={26} color={Colors.text} />
                  </Pressable>
                ),
            }}
          />
          <Stack.Screen
            name="webcam"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </RootSiblingParent>
    </RegisteredHostStorageProvider>
  );
};

export default RootLayout;
