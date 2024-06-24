import { useEffect, useState } from 'react';
import { State } from 'react-native-ble-plx';
import useBleManager from './useBleManager';

const useBleStates = () => {
  const [bluetoothState, setBluetootheState] = useState<State>(State.Unknown);
  const bleManager = useBleManager();

  const subscribeToBleState = () => {
    const subscription = bleManager.onStateChange((state) => {
      switch (state) {
        case 'PoweredOn':
          setBluetootheState(State.PoweredOn);
          console.log('Bluetooth is on');
          break;
        case 'PoweredOff':
          setBluetootheState(State.PoweredOff);
          console.log('Bluetooth is off');
          break;
        case 'Unauthorized':
          setBluetootheState(State.Unauthorized);
          console.log('Bluetooth is unauthorized');
          break;
        case 'Unsupported':
          setBluetootheState(State.Unsupported);
          console.log('Bluetooth is unsupported');
          break;
        case 'Resetting':
          setBluetootheState(State.Resetting);
          console.log('Bluetooth is resetting');
          break;
        default:
          setBluetootheState(State.Unknown);
          break;
      }
    }, true);

    return subscription;
  };

  useEffect(() => {
    const subscription = subscribeToBleState();
    return () => {
      subscription.remove();
    };
  }, []);

  return bluetoothState;
};

export default useBleStates;
