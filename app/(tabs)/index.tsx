import { Text, FlatList, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import HostCard from '../../components/ui/HostCard';
import { NearbyHost, NearbyHostStatus } from '../../entities/HostEntity';
import Colors from '../../constants/Colors';
import { ArrowDown } from 'lucide-react-native';
import * as Haptic from 'expo-haptics';
import { Link, router, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import useNearbyScan from '../../hooks/ble/useNearbyScan';
import EmptyKnownHosts from '../../components/EmptyKnownHosts';
import EmptyScanList from '../../components/EmptyScanList';
import useBleConnect from '../../hooks/ble/useBleConnect';
import { ToastError } from '../../components/ui/ToastMsg';
import ScreenMsg from '../../components/ui/ScreenMsg';
import useRegisteredHosts from '../../hooks/storage/useRegisteredHosts';
import { Device } from 'react-native-ble-plx';
import { WEBCAM_PNP_CHAR_WRITE_UUID } from '../../constants/GattUUIDs';
import { encode } from 'base-64';
import { getMobileUUID } from '../../serivces/app-store';

const ListItem = (scannedHost: NearbyHost) => {
  const { device, filteredRssi, registeredId } = scannedHost;

  const { connecting, connectedDevice, connect } = useBleConnect(device.id);

  const [knownConnected, setKnownConnected] = useState<string | null>(null);

  const rssiInterval = useRef<NodeJS.Timeout | null>(null);
  const [rssi, setRssi] = useState<number>(Math.floor(filteredRssi));

  const startHost = async (connectedDevice: Device) => {
    const sdpRegister = (await connectedDevice.services())
      .map((service) => service.uuid)
      .includes(registeredId!);

    if (sdpRegister) {
      const mobileUUID = await getMobileUUID();
      try {
        console.log('Writing mobile UUID');
        await device.writeCharacteristicWithoutResponseForService(
          registeredId!,
          WEBCAM_PNP_CHAR_WRITE_UUID,
          encode(mobileUUID)
        );
      } catch (error) {
        ToastError('Failed to write mobile UUID');
      }
      setKnownConnected(registeredId!);
    }

    rssiInterval.current = setInterval(async () => {
      try {
        const device_rssi = await connectedDevice.readRSSI();
        if (device_rssi && device_rssi.rssi) {
          setRssi(Math.floor(device_rssi.rssi));
        } else {
          ToastError('Failed to read RSSI');
        }
      } catch (error) {}
    }, 1000);
  };

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    if (connectedDevice) {
      startHost(connectedDevice);
    } else {
      setKnownConnected(null);
    }

    return () => {
      if (rssiInterval.current) {
        clearInterval(rssiInterval.current);
        rssiInterval.current = null;
      }
    };
  }, [connectedDevice]);

  let connectionStatus = 'Disconnected';
  if (connecting) {
    connectionStatus = 'Connecting...';
  } else if (knownConnected && connectedDevice) {
    connectionStatus = 'Connected';
  } else if (connectedDevice) {
    connectionStatus = 'Unsupported';
  }

  let rssiLabel = 'RSSI: ' + (knownConnected ? `${rssi} dBm` : 'Unknown');

  return (
    <HostCard
      name={device.name!}
      action={knownConnected ? 'Tap to start' : 'Registered'}
      footerRight={connectionStatus}
      footerLeft={rssiLabel}
      disabled={!knownConnected}
      onPress={() => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Heavy);
        router.push({
          pathname: '/webcam',
          params: { deviceId: device.id, hostUUID: knownConnected },
        });
      }}
    />
  );
};

const ListFooter = () => {
  return (
    <View
      style={{
        justifyContent: 'space-evenly',
        alignItems: 'center',
      }}
    >
      <ScreenMsg message="Scroll down to find or reconnect your hosts" />
      <ArrowDown size={30} color={Colors.text} />
    </View>
  );
};

const Webcam = () => {
  const { scanning, nearbyHostsList, scanError, startScan, stopScan } = useNearbyScan();

  const { registeredHosts } = useRegisteredHosts();
  const registeredHostUUIDs = registeredHosts.map((host) => host.id);

  //get only registered hosts
  const scannedHosts = nearbyHostsList.filter((host: NearbyHost) => host.registeredId);

  useFocusEffect(
    useCallback(() => {
      if (registeredHosts.length !== 0) {
        startScan(registeredHostUUIDs);
      }
      return () => {
        console.log('Webcam stop scan');
        stopScan();
      };
    }, [registeredHosts])
  );

  return (
    <View>
      {registeredHosts.length !== 0 ? (
        <FlatList
          onRefresh={() => startScan(registeredHostUUIDs)}
          refreshing={scanning}
          data={scannedHosts}
          ListEmptyComponent={<EmptyScanList isScanning={scanning} error={scanError} />}
          ListFooterComponent={scannedHosts.length !== 0 && !scanning ? <ListFooter /> : null}
          renderItem={({ item }: { item: NearbyHost }) => <ListItem {...item} />}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <EmptyKnownHosts />
      )}
    </View>
  );
};

export default Webcam;
