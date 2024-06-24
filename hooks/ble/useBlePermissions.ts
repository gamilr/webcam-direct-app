import { useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

const requestBluetoothPermission = async () => {
  if (Platform.OS === 'ios') {
    return true;
  }
  if (Platform.OS === 'android' && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
    const apiLevel = parseInt(Platform.Version.toString(), 10);

    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return (
        result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
      );
    }
  }

  return false;
};

type UseBlePermissions = [boolean, () => Promise<void>];

const useBlePermissions = (): UseBlePermissions => {
  const [permissionsGranted, setBlePermissionGranted] = useState(false);

  const requestPermission = async () => {
    const granted = await requestBluetoothPermission();
    setBlePermissionGranted(granted);
  };

  return [permissionsGranted, requestPermission];
};

export default useBlePermissions;
