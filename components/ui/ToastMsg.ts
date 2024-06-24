import Toast from 'react-native-root-toast';
import Colors from '../../constants/Colors';

export const ToastError = (msg: string) => {
  Toast.show(msg, {
    duration: Toast.durations.LONG,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    backgroundColor: Colors.error,
    textColor: 'white',
  });
};
