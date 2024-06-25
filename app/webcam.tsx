import { useLocalSearchParams, useRouter } from 'expo-router';
import { Circle, CircleStop, CircleX, Square, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Button, Pressable } from 'react-native';
import {
  RTCPeerConnection,
  mediaDevices,
  RTCView,
  MediaStream,
  RTCSessionDescription,
} from 'react-native-webrtc';
import * as Haptic from 'expo-haptics';
import useBleManager from '../hooks/ble/useBleManager';
import { decode, encode } from 'base-64';
import useRegisteredHosts from '../hooks/storage/useRegisteredHosts';
import { RTC_SDP_CHAR_NOTIFY_UUID, RTC_SDP_CHAR_WRITE_UUID } from '../constants/GattUUIDs';

const BLE_CONN_MTU = 200;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const Webcam = () => {
  const router = useRouter();
  const { deviceId, hostUUID } = useLocalSearchParams<{ deviceId: string; hostUUID: string }>();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const bleManager = useBleManager();

  const { registeredHosts } = useRegisteredHosts();

  console.log('deviceId', deviceId);

  const hostInfo = registeredHosts.find((host) => host.id === hostUUID);

  console.log('hostInfo', hostInfo);

  const start = async () => {
    try {
      if (!(await bleManager.isDeviceConnected(deviceId!))) {
        console.log('Device is disconnected');
        return;
      }

      let hosts = await bleManager.devices([deviceId!]);
      let host = hosts[0];
      host = await host.requestMTU(BLE_CONN_MTU);
      const mtu = host.mtu;
      console.log('connected host mtu', mtu);

      if (!host) {
        console.error('Host not found');
        return;
      }

      const localMediaStream = await mediaDevices.getUserMedia({ video: true });

      const peerConnection = new RTCPeerConnection({
        iceTransportPolicy: 'all',
        iceServers: [],
      });

      peerConnection.addEventListener('icecandidate', async (event) => {
        // When you find a null candidate then there are no more candidates.
        // Gathering of candidates has finished.
        if (!event.candidate) {
          // Create an offer.
          let localDescription = peerConnection.localDescription;
          console.log('localDescription', localDescription);
          let localDescriptionStr = JSON.stringify(peerConnection.localDescription);

          const dataLength = localDescriptionStr.length;
          let offset = 0;

          while (offset < dataLength) {
            const chunkSize = Math.min(156, dataLength - offset);
            const chunk = localDescriptionStr.slice(offset, offset + chunkSize);
            console.log('chunk', chunk);
            const chunkBase64 = encode(chunk);
            console.log('chunkBase64', chunkBase64);
            try {
              await host.writeCharacteristicWithResponseForService(
                hostUUID!,
                RTC_SDP_CHAR_WRITE_UUID,
                chunkBase64
              );
            } catch (error) {
              console.log('Error:', error);
            }
            offset += chunkSize;
            console.log('dataLength', chunkSize);
            console.log('offset', offset);
            await sleep(200);
          }
          return;
        }

        console.log('event.candidate', event.candidate);
      });

      peerConnection.addEventListener('negotiationneeded', (event) => {
        // You can start the offer stages here.
        // Be careful as this event can be called multiple times.
        console.log('negotiationneeded');
      });

      peerConnection.addEventListener('track', (event) => {});

      // Add our stream to the peer connection.
      localMediaStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localMediaStream));

      const offerDescription = await peerConnection.createOffer({});
      await peerConnection.setLocalDescription(offerDescription);

      let answer = '';
      bleManager.monitorCharacteristicForDevice(
        deviceId!,
        hostUUID!,
        RTC_SDP_CHAR_NOTIFY_UUID,
        async (error, char) => {
          if (char && char.value) {
            console.log('newchar value', char.value);
            let decoded = decode(char.value!);
            console.log('decoded', decoded);

            answer += decoded;

            if (answer.includes('}')) {
              const answerDescription = JSON.parse(answer);
              console.log('answerDescription', answerDescription);
              const remoteDescription = new RTCSessionDescription(answerDescription);
              if (remoteDescription) {
                console.log('remoteDescription', remoteDescription);
                await peerConnection.setRemoteDescription(remoteDescription);
                console.log('setStream');
                setStream(localMediaStream);
              } else {
                console.log('remoteDescription is null');
              }
            } else {
              console.log(error);
            }
          }
        }
      );
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const stop = () => {
    console.log('stop');
    if (stream) {
      stream?.getTracks().forEach((track) => track.stop());
      stream.release();
      setStream(null);
    }
  };

  useEffect(() => {
    start();
    return () => {
      stop();
    };
  }, []);

  return (
    <View>
      {stream && (
        <View>
          <RTCView mirror objectFit="cover" style={{ height: '100%' }} streamURL={stream.toURL()} />
          <View
            style={{
              position: 'absolute',
              bottom: '2%',
              padding: 10,
              right: '38%',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Pressable
              onLongPress={() => {
                Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Heavy);
                stream.getTracks().forEach((track) => track.stop());
                setStream(null);
                router.back();
              }}
              style={({ pressed }) => [
                {
                  borderRadius: 50,
                },
                {
                  backgroundColor: pressed ? 'rgba(0,0,0,0.1)' : 'transparent',
                },
              ]}
            >
              <CircleX
                size={70}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.8,
                  shadowRadius: 2,
                }}
                color="white"
                stroke="white"
              />
            </Pressable>
            <Text
              style={{
                color: 'white',
                fontFamily: 'Inter_600SemiBold',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
              }}
            >
              Press to Stop
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default Webcam;
