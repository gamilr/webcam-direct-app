import { Text, Pressable, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    borderRadius: 15,
    paddingHorizontal: 40,
    height: 50,
  },
  buttonLabel: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
  },
});

type ButtonProps = {
  onPress: () => void;
  backgroundColor?: string;
  label?: string;
};

const Button = ({ label, backgroundColor, onPress }: ButtonProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          opacity: pressed ? 0.5 : 1,
        },
        { backgroundColor: backgroundColor || Colors.text },
      ]}
      onPress={onPress}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
};

export default Button;
