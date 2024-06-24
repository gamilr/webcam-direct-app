import KalmanFilter from 'kalmanjs';
import { type Device } from 'react-native-ble-plx';

export enum NearbyHostStatus {
  Close = 'Close',
  Far = 'Far',
  Unknown = 'Unknown',
}

export type NearbyHost = {
  device: Device;
  lastTimeSeen: number;
  filteredRssi: number;
  status: NearbyHostStatus;
  kalmanFilter: KalmanFilter;
  registeredId?: string; //kind of foreign key
};

export enum HostConnectionType {
  WifiDirect = 'WifiDirect',
  Wlan = 'WLAN',
}

export type RegisteredHost = {
  id: string;
  name: string;
  connectionType: HostConnectionType;
  registeredAt: number;
};
