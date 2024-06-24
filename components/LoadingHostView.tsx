import { StyleSheet, ActivityIndicator, View } from 'react-native';
import ScreenMsg from './ui/ScreenMsg';
import { ServerCog } from 'lucide-react-native';

const styles = StyleSheet.create({
  loadingView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});

const LoadingHostView = ({ msg }: { msg?: string }) => (
  <View style={styles.loadingView}>
    <ScreenMsg icon={ServerCog} message={msg ? msg : 'Loading your saved hosts'} />
    <ActivityIndicator size="large" color="gray" />
  </View>
);

export default LoadingHostView;
