import { FlatList, View } from 'react-native';
import HostCard from '../../components/ui/HostCard';
import { RegisteredHost } from '../../entities/HostEntity';
import * as Haptic from 'expo-haptics';
import { useRouter } from 'expo-router';
import { formatTimeSince } from '../../lib/utils';
import EmptyKnownHosts from '../../components/EmptyKnownHosts';
import useRegisteredHosts from '../../hooks/storage/useRegisteredHosts';
import LoadingHostView from '../../components/LoadingHostView';
import ErrorView from '../../components/ErrorView';

const ListItem = ({ id, name, connectionType, registeredAt }: RegisteredHost) => {
  const router = useRouter();

  return (
    <HostCard
      name={name}
      footerRight={formatTimeSince(registeredAt)}
      footerLeft={connectionType}
      action="See details"
      onPress={() => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Heavy);
        router.push(`/host/detail/${id}`);
      }}
    />
  );
};

const KnownHosts = () => {
  const { loading, error, registeredHosts } = useRegisteredHosts();

  return (
    <View>
      {loading ? (
        <LoadingHostView />
      ) : error ? (
        <ErrorView error={error} />
      ) : (
        <FlatList
          data={registeredHosts}
          ListEmptyComponent={<EmptyKnownHosts />}
          renderItem={({ item }: { item: RegisteredHost }) => <ListItem {...item} />}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </View>
  );
};

export default KnownHosts;
