import { BleManager } from 'react-native-ble-plx';

const globalBleManager = new BleManager();

const useBleManager = () => {
  return globalBleManager;
};

export default useBleManager;
