import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

let globalMobileUUID: string | null = null;

export const getMobileUUID = async () => {
  if (!globalMobileUUID) {
    globalMobileUUID = await AsyncStorage.getItem('mobileUUID');

    if (!globalMobileUUID) {
      globalMobileUUID = Crypto.randomUUID();
      await AsyncStorage.setItem('mobileUUID', globalMobileUUID);
    }
  }

  return globalMobileUUID;
};
