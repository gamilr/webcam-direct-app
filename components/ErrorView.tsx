import { View, StyleSheet } from 'react-native';
import ScreenMsg from './ui/ScreenMsg';
import { CircleSlash } from 'lucide-react-native';
import Colors from '../constants/Colors';

const styles = StyleSheet.create({
  errorView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});

const ErrorView = ({ error }: { error: string }) => (
  <View style={styles.errorView}>
    <ScreenMsg icon={CircleSlash} message={error} messageColor={Colors.error} />
  </View>
);

export default ErrorView;
