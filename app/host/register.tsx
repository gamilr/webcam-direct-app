import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { type RegisteredHost, HostConnectionType } from '../../entities/HostEntity';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CHAR_PNP_EXCHANGE_SDP_UUID,
  CHAR_PROV_INFO_UUID,
  PROV_SERVICE_INFO_UUID,
} from '../../constants/GattUUIDs';
import { Device, Characteristic } from 'react-native-ble-plx';
import Button from '../../components/ui/Button';
import useBleConnect from '../../hooks/ble/useBleConnect';
import { encode, decode } from 'base-64';
import { getMobileUUID } from '../../serivces/app-store';
import { MobileInfo } from '../../entities/MobileEntity';
import * as ExpoDevice from 'expo-device';
import HostDetailForm from '../../components/HostDetailForm';
import useRegisteredHosts from '../../hooks/storage/useRegisteredHosts';
import ErrorView from '../../components/ErrorView';
import LoadingHostView from '../../components/LoadingHostView';
import { encode as msgenc, decode as msgdec } from '@msgpack/msgpack';

type RegisterHostStatusState =
  | { type: 'LOADING' | 'ERROR'; payload: string }
  | { type: 'HOST'; payload: RegisteredHost };

const RegisterHost = () => {
  const { deviceId, deviceName } = useLocalSearchParams<{
    deviceId: string;
    deviceName: string;
  }>();

  const bleDeviceId = deviceId || '';
  const bleDeviceName = deviceName || 'the host';

  const [hostStatus, setHostStatus] = useState<RegisterHostStatusState>({
    type: 'LOADING',
    payload: '',
  });

  const { connecting, connectedDevice, error, connect } = useBleConnect(bleDeviceId);
  const { loading, error: hostError, addHost } = useRegisteredHosts();
  const [addingHost, setAddingHost] = useState<boolean>(false);

  const provCharHostRef = React.useRef<Characteristic>();
  const provCharMobileRef = React.useRef<Characteristic>();

  const checkHost = async (host: Device) => {
    setHostStatus({ type: 'LOADING', payload: `Checking ${bleDeviceName}` });
    try {
      const provService = (await host.services()).find((s) => s.uuid === PROV_SERVICE_INFO_UUID);
      if (provService) {
        const chars = await provService.characteristics();
        if (chars) {
          provCharHostRef.current = chars.find((c) => c.uuid === CHAR_PROV_INFO_UUID);
          provCharMobileRef.current = chars.find((c) => c.uuid === CHAR_PNP_EXCHANGE_SDP_UUID);
          if (provCharHostRef.current && provCharMobileRef.current) {
            provCharHostRef.current = await provCharHostRef.current.read();
            if (provCharHostRef.current.value) {
              let decoded = decode(provCharHostRef.current.value);
              console.log(decoded);
              return;
              let hostData: RegisteredHost = {
                id: '',
                name: '',
                connection_type: HostConnectionType.Wlan,
                registeredAt: 0,
              };
              const sdpService = (await host.services()).find((s) => s.uuid === hostData.id);
              if (sdpService) {
                const sdpChars = await sdpService!.characteristics();
                if (sdpChars) {
                  const sdpChar_write = sdpChars.find((c) => c.uuid === CHAR_PNP_EXCHANGE_SDP_UUID);
                  const sdpChar_notify = sdpChars.find(
                    (c) => c.uuid === CHAR_PNP_EXCHANGE_SDP_UUID
                  );
                  const webcamChar_write = sdpChars.find(
                    (c) => c.uuid === CHAR_PNP_EXCHANGE_SDP_UUID
                  );
                  if (sdpChar_write && sdpChar_notify && webcamChar_write) {
                    setHostStatus({
                      type: 'HOST',
                      payload: {
                        id: hostData.id,
                        name: hostData.name,
                        connection_type:
                          hostData.connection_type === 'WLAN'
                            ? HostConnectionType.Wlan
                            : HostConnectionType.WifiDirect,
                        registeredAt: Date.now(),
                      },
                    });
                    return;
                  }
                }
              }
            }
          }
        }
      }
      setHostStatus({ type: 'ERROR', payload: 'Host not supported' });
    } catch (error) {
      setHostStatus({ type: 'ERROR', payload: 'Host not supported' });
    }
  };

  const registerHost = async (host: RegisteredHost) => {
    setHostStatus({ type: 'LOADING', payload: `Registering ${bleDeviceName}` });
    try {
      let mobileUUID = await getMobileUUID();
      let mobileName = ExpoDevice.deviceName;
      const mobileInfo: MobileInfo = {
        id: mobileUUID,
        name: mobileName || 'Mobile Device',
        cameras: [],
      };
      //await provCharMobileRef.current!.writeWithoutResponse(encode(JSON.stringify(mobileInfo)));
      setAddingHost(true);
      await addHost(host);
      setAddingHost(false);
      router.replace('/');
    } catch (error) {
      setHostStatus({ type: 'ERROR', payload: 'Error registering host' });
    }
  };

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    if (connecting) {
      setHostStatus({ type: 'LOADING', payload: `Connecting to ${bleDeviceName}` });
    }

    if (connectedDevice) {
      checkHost(connectedDevice);
    }

    if (error) {
      setHostStatus({ type: 'ERROR', payload: error });
    }

    if (loading) {
      setHostStatus({
        type: 'LOADING',
        payload: addingHost ? 'Adding host' : 'Loading to saved hosts',
      });
    }

    if (hostError) {
      setHostStatus({ type: 'ERROR', payload: hostError });
    }
  }, [connecting, connectedDevice, error, loading, hostError]);

  return (
    <View>
      {hostStatus.type === 'LOADING' ? (
        <LoadingHostView msg={hostStatus.payload} />
      ) : hostStatus.type === 'ERROR' ? (
        <ErrorView error={hostStatus.payload} />
      ) : (
        hostStatus.type === 'HOST' && (
          <View style={styles.detailView}>
            <HostDetailForm {...hostStatus.payload} />
            <View style={styles.submitButtonView}>
              <Button
                label="Register"
                onPress={async () => await registerHost(hostStatus.payload)}
              />
            </View>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  detailView: {
    height: '100%',
  },
  connectingView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%',
  },
  submitButtonView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RegisterHost;
