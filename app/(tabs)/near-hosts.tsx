import { FlatList } from 'react-native';
import React, { useCallback } from 'react';
import HostCard from '../../components/ui/HostCard';
import { NearbyHost, NearbyHostStatus } from '../../entities/HostEntity';
import Colors from '../../constants/Colors';
import * as Haptic from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import useNearbyScan from '../../hooks/ble/useNearbyScan';
import { formatTimeSince } from '../../lib/utils';
import EmptyScanList from '../../components/EmptyScanList';
import useRegisteredHosts from '../../hooks/storage/useRegisteredHosts';

const ListItem = (scannedHost: NearbyHost) => {
  const { device, filteredRssi, lastTimeSeen, status } = scannedHost;
  const router = useRouter();

  const name = device.name || 'Unknown';

  const ADVS_TIMEOUT = 20;

  let actionLabel = '';
  let actionColor = Colors.success;
  switch (status) {
    case NearbyHostStatus.Close:
      actionLabel = 'Register';
      break;
    case NearbyHostStatus.Far:
      actionLabel = 'Far Away';
      actionColor = Colors.error;
      break;
    default:
      actionLabel = 'Unknown';
      break;
  }

  if (scannedHost.registeredId) {
    actionLabel = 'Registered';
    actionColor = Colors.success;
  }

  const since = Date.now() - lastTimeSeen;
  if (since > ADVS_TIMEOUT * 1000) {
    actionLabel = 'Timeout';
    actionColor = Colors.error;
  }

  let timeout = since > ADVS_TIMEOUT * 1000;
  let disabled = timeout || status !== NearbyHostStatus.Close || Boolean(scannedHost.registeredId);

  return (
    <HostCard
      name={name}
      footerLeft={`RSSI: ${Math.floor(filteredRssi)} dBm`}
      footerRight={formatTimeSince(lastTimeSeen)}
      action={actionLabel}
      actionColor={actionColor}
      disabled={disabled}
      onPress={() => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Rigid);
        router.push({
          pathname: '/host/register',
          params: { deviceId: device.id, deviceName: device.name },
        });
      }}
    />
  );
};

const NearbyHostList = () => {
  const { scanning, nearbyHostsList, scanError, startScan, stopScan } = useNearbyScan();

  const { registeredHosts } = useRegisteredHosts();
  const registeredHostUUIDs = registeredHosts.map((host) => host.id);

  //get only known status hosts
  const scannedHosts = nearbyHostsList.filter(
    (host: NearbyHost) => host.status !== NearbyHostStatus.Unknown
  );

  useFocusEffect(
    useCallback(() => {
      startScan(registeredHostUUIDs);
      return () => {
        stopScan();
      };
    }, [registeredHosts])
  );

  return (
    <FlatList
      onRefresh={() => startScan(registeredHostUUIDs)}
      refreshing={scanning}
      data={scanning ? scannedHosts : []}
      ListEmptyComponent={<EmptyScanList isScanning={scanning} error={scanError} />}
      renderItem={({ item }: { item: NearbyHost }) => <ListItem {...item} />}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default NearbyHostList;
