import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import {
  RTCPeerConnection,
  mediaDevices,
  RTCView,
  MediaStream,
  RTCSessionDescription,
} from 'react-native-webrtc';
import { useLocalSearchParams } from 'expo-router';
import useBleManager from '../../hooks/ble/useBleManager';
import {
  PROV_CHAR_MOBILE_INFO_UUID,
  PROV_CHAR_HOST_INFO_UUID,
  PROV_SERVICE_INFO_UUID,
} from '../../constants/GattUUIDs';
import { decode, encode } from 'base-64';

const App = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const { deviceId, deviceName } = useLocalSearchParams<{ deviceId: string; deviceName: string }>();

  const { bleManager } = useBleManager();

  const startRTC = async () => {
    try {
      if (await bleManager.isDeviceConnected(deviceId!)) {
        console.log('Device is connected');
        console.log('Cancelling connection');
        await bleManager.cancelDeviceConnection(deviceId!);
      }

      let host = await bleManager.connectToDevice(deviceId!);

      if (!host) {
        console.error('Host not found');
        return;
      }

      console.log('Connected to device:', deviceName);
      host = await host.discoverAllServicesAndCharacteristics();

      const localMediaStream = await mediaDevices.getUserMedia({ video: true });

      const peerConnection = new RTCPeerConnection({
        iceTransportPolicy: 'all',
        iceServers: [],
      });

      peerConnection.addEventListener('connectionstatechange', (event) => {
        switch (peerConnection.connectionState) {
          case 'closed':
            // You can handle the call being disconnected here.
            console.log('connection closed');

            break;
        }
      });

      peerConnection.addEventListener('icecandidate', async (event) => {
        // When you find a null candidate then there are no more candidates.
        // Gathering of candidates has finished.
        if (!event.candidate) {
          // Create an offer.
          let deviceBase64 = encode(JSON.stringify(peerConnection.localDescription));
          //send offer to host
          console.log('deviceBase64', deviceBase64);
          console.log('deviceBase64 len', deviceBase64.length);

          const dataLength = deviceBase64.length;
          let offset = 0;

          while (offset < dataLength) {
            const chunkSize = Math.min(256, dataLength - offset);
            const chunk = deviceBase64.slice(offset, offset + chunkSize);
            console.log('chunk', chunk);
            await host.writeCharacteristicWithoutResponseForService(
              PROV_SERVICE_INFO_UUID,
              PROV_CHAR_MOBILE_INFO_UUID,
              chunk
            );
            offset += chunkSize;
          }
          return;
        }

        console.log('event.candidate', event.candidate);
        // Send the event.candidate onto the person you're calling.
        // Keeping to Trickle ICE Standards, you should send the candidates immediately.
      });

      peerConnection.addEventListener('icecandidateerror', (event) => {
        // You can ignore some candidate errors.
        // Connections can still be made even when errors occur.
        console.error(event);
      });

      peerConnection.addEventListener('iceconnectionstatechange', (event) => {
        switch (peerConnection.iceConnectionState) {
          case 'connected':
          case 'completed':
            // You can handle the call being connected here.
            // Like setting the video streams to visible.

            break;
        }
      });

      peerConnection.addEventListener('negotiationneeded', (event) => {
        // You can start the offer stages here.
        // Be careful as this event can be called multiple times.
        console.log('negotiationneeded');
        console.log('event', event);
      });

      peerConnection.addEventListener('signalingstatechange', (event) => {
        switch (peerConnection.signalingState) {
          case 'closed':
            // You can handle the call being disconnected here.
            break;
        }
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
        PROV_SERVICE_INFO_UUID,
        PROV_CHAR_HOST_INFO_UUID,
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
      stream.release();
      setStream(null);
      bleManager.cancelDeviceConnection(deviceId!);
    }
  };

  useEffect(() => {
    console.log('deviceId', deviceId);
    return stop;
  }, []);

  return (
    <>
      <View>
        <Button title="Start" onPress={startRTC} />
        <Button title="Stop" onPress={stop} />
      </View>
      {stream && <RTCView streamURL={stream.toURL()} style={styles.stream} />}
      <View></View>
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.black,
  },
  stream: {
    flex: 1,
  },
  footer: {
    backgroundColor: Colors.lighter,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default App;
