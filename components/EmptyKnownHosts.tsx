import { View } from 'react-native';
import Colors from '../constants/Colors';
import ScreenMsg from './ui/ScreenMsg';
import { ServerOff } from 'lucide-react-native';
import { Link } from 'expo-router';

const EmptyKnownHosts = () => {
  return (
    <View
      style={{
        justifyContent: 'space-evenly',
        gap: 10,
        alignItems: 'center',
        marginTop: '50%',
      }}
    >
      <ScreenMsg icon={ServerOff} message="No hosts registered yet" />
      <Link
        href="/near-hosts"
        style={{
          color: Colors.text,
          fontSize: 18,
          fontFamily: 'Inter_700Bold',
        }}
      >
        {'Register a new host \u2192'}
      </Link>
    </View>
  );
};

export default EmptyKnownHosts;
