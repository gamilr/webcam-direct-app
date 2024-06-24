import { useCallback, useEffect, useState } from 'react';
import useBleManager from './useBleManager';
import { Device } from 'react-native-ble-plx';

const CONNECTION_TIMEOUT = 15000;

const useBleConnect = (uuid: string) => {
  const bleManager = useBleManager();

  const [connecting, setConnecting] = useState(true);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      let connected_device: Device | null = null;
      if (!(await bleManager.isDeviceConnected(uuid))) {
        console.log('Connecting to device:', uuid);
        connected_device = await bleManager.connectToDevice(uuid, {
          timeout: CONNECTION_TIMEOUT,
          requestMTU: 200,
        });
      } else {
        //already get device
        const devices = await bleManager.devices([uuid]);
        connected_device = devices[0];
        console.log(`Device ${uuid} already connected with mtu ${connected_device.mtu}`);
      }

      if (connected_device) {
        setConnectedDevice(await connected_device.discoverAllServicesAndCharacteristics());
        const subs = bleManager.onDeviceDisconnected(uuid, async () => {
          subs.remove();
          setConnectedDevice(null);
        });
      } else {
        setError('Failed to connect to device');
      }
    } catch (error) {
      setError('Failed to connect to device. ' + error);
    } finally {
      setConnecting(false);
    }
  }, [uuid]);

  const disconnect = useCallback(async () => {
    try {
      console.log('Disconnecting from device:', uuid);
      await bleManager.cancelDeviceConnection(uuid);
      setConnectedDevice(null);
    } catch (error) {
      console.error(error);
      setError('Failed to disconnect from device ' + error);
    }
  }, [uuid]);

  return { connecting, connectedDevice, error, connect, disconnect };
};

export default useBleConnect;
