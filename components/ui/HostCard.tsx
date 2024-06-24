import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Colors from '../../constants/Colors';
import { Monitor } from 'lucide-react-native';

const styles = StyleSheet.create({
  mediumFont: {
    fontFamily: 'Inter_500Medium',
  },
  semiBoldFont: {
    fontFamily: 'Inter_600SemiBold',
  },
  card: {
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 2,
  },
  cardFooter: {
    marginLeft: 2,
  },
  name: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap-reverse',
    flex: 1,
    gap: 8,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
  },
  action: {
    fontSize: 18,
  },
  footerText: {
    color: Colors.tint,
    fontSize: 16,
  },
});

export type HostCardProps = {
  name: string;
  footerLeft?: string;
  footerLeftColor?: string;
  footerRight?: string;
  footerRightColor?: string;
  action?: string;
  actionColor?: string;
  disabled?: boolean;
  onPress?: () => void;
};

//TODO: make this compoenent more generic and reusable
const HostCard = ({
  name,
  footerLeft,
  footerLeftColor,
  footerRight,
  footerRightColor,
  action,
  actionColor,
  disabled,
  onPress,
}: HostCardProps): React.ReactElement => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? Colors.cardSelected : Colors.card,
        },
        disabled && { opacity: 0.5 },
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <View style={[styles.cardSection, styles.cardHeader]}>
        <Monitor size={40} color={Colors.text} style={{ flex: 1 }} />
        <View style={styles.name}>
          <Text style={[styles.mediumFont, styles.title]}>{name}</Text>
          {action ? (
            <Text
              style={[styles.semiBoldFont, styles.action, { color: actionColor || Colors.success }]}
            >
              {action}
            </Text>
          ) : (
            <View />
          )}
        </View>
      </View>
      <View style={[styles.cardSection, styles.cardFooter]}>
        {footerLeft ? (
          <Text
            style={[
              styles.mediumFont,
              styles.footerText,
              { color: footerLeftColor || Colors.tint },
            ]}
          >
            {footerLeft}
          </Text>
        ) : (
          <View />
        )}
        {footerRight ? (
          <Text
            style={[
              styles.mediumFont,
              styles.footerText,
              { color: footerRightColor || Colors.tint },
            ]}
          >
            {footerRight}
          </Text>
        ) : (
          <View />
        )}
      </View>
    </Pressable>
  );
};

export default HostCard;
