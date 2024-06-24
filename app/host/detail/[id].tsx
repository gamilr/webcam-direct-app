import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '../../../constants/Colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from '../../../components/ui/Button';
import HostDetailForm from '../../../components/HostDetailForm';
import useRegisteredHosts from '../../../hooks/storage/useRegisteredHosts';
import LoadingHostView from '../../../components/LoadingHostView';
import ErrorView from '../../../components/ErrorView';

const HostDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { loading, error, registeredHosts, removeHost } = useRegisteredHosts();
  const [deleting, setDeleting] = useState<boolean>(false);

  const bleDeviceId = id || '';
  const hostInfo = registeredHosts.find((host) => host.id === bleDeviceId);

  const deleteHost = async () => {
    setDeleting(true);
    await removeHost(bleDeviceId);
    setDeleting(false);
    router.back();
  };

  return (
    <View>
      {loading ? (
        <LoadingHostView msg={deleting ? 'Deleting host' : undefined} />
      ) : error ? (
        <ErrorView error={error} />
      ) : (
        hostInfo && (
          <View style={styles.detailView}>
            <HostDetailForm {...hostInfo} />
            <View style={styles.submitButtonView}>
              <Button label="Delete" backgroundColor={Colors.error} onPress={deleteHost} />
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
  submitButtonView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HostDetail;
