import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import Colors from '../../constants/Colors';

type ScreenMsgProps = {
  icon?: LucideIcon;
  iconColor?: string;
  message: string;
  messageColor?: string;
  style?: StyleProp<ViewStyle>;
};

const ScreenMsg = ({ icon, iconColor, message, messageColor, style }: ScreenMsgProps) => {
  const Icon = icon;

  return (
    <View
      style={[
        {
          justifyContent: 'space-evenly',
          alignItems: 'center',
          marginTop: '0%',
        },
        style,
      ]}
    >
      {Icon && (
        <Icon
          size={150}
          color={iconColor ? iconColor : Colors.cardSelected}
          style={{ marginBottom: 22 }}
        />
      )}
      <Text
        style={{
          color: messageColor ? messageColor : Colors.text,
          fontSize: 22,
          marginBottom: 5,
          paddingHorizontal: 30,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default ScreenMsg;
