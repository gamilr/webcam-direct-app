import { useCallback, useRef, useState } from 'react';
import useBleManager from './useBleManager';
import { NearbyHost, NearbyHostStatus } from '../../entities/HostEntity';
import KalmanFilter from 'kalmanjs';
import { BleError, Device } from 'react-native-ble-plx';
import { PROV_SERVICE_INFO_UUID } from '../../constants/GattUUIDs';

const NEARBY_HOSTS_RSSI = -52;
const LIST_ITEM_UPDATE_INTERVAL = 1;
const SCAN_DURATION = 30;

const useNearbyScan = () => {
  const bleManager = useBleManager();
  const [scanning, setScanning] = useState(false);
  const [nearbyHostsList, setNearbyHostsList] = useState<NearbyHost[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);

  const nearbyHostsRef = useRef<NearbyHost[]>([]);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout>();
  const updateIntervalRef = useRef<NodeJS.Timeout>();

  const startScan = (registeredHostUUIDs: string[]) => {
    console.log('Scanning for devices');
    nearbyHostsRef.current = [];
    setNearbyHostsList([]);
    setScanError(null);

    console.log('registeredHosts from callback', registeredHostUUIDs);

    const scanCallback = (error: BleError | null, device: Device | null) => {
      if (error) {
        console.error(error);
        setScanError(error.reason);
        stopScan();
        return;
      }

      //Store the device in the list
      if (device && device.name && device.rssi && device.id) {
        let knownHostIndex = nearbyHostsRef.current.findIndex(
          (host) => host.device.id === device.id
        );
        //already known nearby host
        if (knownHostIndex !== -1) {
          let knownHost = nearbyHostsRef.current[knownHostIndex];

          let deviceUUIDs = device.serviceUUIDs || [];

          let filteredRssi = knownHost.kalmanFilter.filter(device.rssi);

          knownHost.status =
            filteredRssi >= NEARBY_HOSTS_RSSI ? NearbyHostStatus.Close : NearbyHostStatus.Far;

          //Once registered, keep the status
          if (!knownHost.registeredId) {
            let regsiteredUUID = deviceUUIDs.find((uuid) => registeredHostUUIDs.includes(uuid));
            if (regsiteredUUID) {
              knownHost.registeredId = regsiteredUUID;
            }
          }

          //update the known host
          nearbyHostsRef.current[knownHostIndex] = {
            ...knownHost,
            filteredRssi: filteredRssi,
            device: device,
            lastTimeSeen: Date.now(),
          };
        } else {
          //new nearby host ignore first rssi value
          let filter = new KalmanFilter();
          nearbyHostsRef.current.push({
            device: device,
            lastTimeSeen: Date.now(),
            filteredRssi: filter.filter(device.rssi),
            kalmanFilter: filter,
            status: NearbyHostStatus.Unknown, //skip first rssi value for accuracy
          });

          //start the update interval when at least a device is found
          if (updateIntervalRef.current === undefined) {
            updateIntervalRef.current = setInterval(() => {
              setNearbyHostsList([...nearbyHostsRef.current]);
            }, LIST_ITEM_UPDATE_INTERVAL * 1000);
          }
          console.log('Device new: ', device.id);
        }
      }
    };

    bleManager.startDeviceScan(
      [PROV_SERVICE_INFO_UUID, ...registeredHostUUIDs],
      { allowDuplicates: true },
      scanCallback
    );

    cleanupTimeoutRef.current = setTimeout(() => {
      stopScan();
    }, SCAN_DURATION * 1000);

    setScanning(true);
  };

  const stopScan = () => {
    console.log('Scan stopped');
    bleManager.stopDeviceScan();
    clearTimeout(cleanupTimeoutRef.current);
    cleanupTimeoutRef.current = undefined;
    clearInterval(updateIntervalRef.current);
    updateIntervalRef.current = undefined;
    setScanning(false);
  };

  return { scanning, nearbyHostsList, scanError, startScan, stopScan };
};

export default useNearbyScan;
