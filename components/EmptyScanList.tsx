import { View } from 'react-native';
import ScreenMsg from './ui/ScreenMsg';
import { ArrowDown, MonitorOff } from 'lucide-react-native';
import Colors from '../constants/Colors';

const EmptyScanList = ({ isScanning, error }: { isScanning: boolean; error: string | null }) => {
  let noScanningMsg = error
    ? `Stop by this error: ${error}, Scroll down to scan again`
    : 'Scroll down to find nearby hosts';
  return (
    <View
      style={{
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginTop: '50%',
      }}
    >
      <ScreenMsg
        icon={MonitorOff}
        message={!isScanning ? noScanningMsg : 'Finding your hosts, get closer!'}
        messageColor={error ? Colors.error : undefined}
      />
      {!isScanning && <ArrowDown size={30} color={Colors.text} />}
    </View>
  );
};

export default EmptyScanList;
