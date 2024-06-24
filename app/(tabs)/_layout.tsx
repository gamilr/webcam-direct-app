import { Tabs } from 'expo-router';
import { Radar, Webcam, Database } from 'lucide-react-native';
import * as Haptic from 'expo-haptics';
import Color from '../../constants/Colors';

const TabLayout = () => {
  return (
    <Tabs
      sceneContainerStyle={{
        backgroundColor: Color.background,
      }}
      screenOptions={{
        headerStyle: {
          backgroundColor: Color.background,
        },
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 22,
          color: Color.text,
        },
        tabBarActiveTintColor: Color.tabIconSelected,
        tabBarInactiveTintColor: Color.tabIconDefault,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 14,
          paddingBottom: 10,
        },
        tabBarStyle: {
          backgroundColor: Color.background,
          height: 78,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Webcam',
          title: 'Webcam',
          tabBarIcon: ({ color }) => <Webcam size={34} color={color} />,
        }}
        listeners={() => ({
          tabPress: () => {
            Haptic.selectionAsync();
          },
        })}
      />
      <Tabs.Screen
        name="near-hosts"
        options={{
          tabBarLabel: 'Scan',
          title: 'Nearby Hosts',
          tabBarIcon: ({ color }) => <Radar size={34} color={color} />,
        }}
        listeners={() => ({
          tabPress: () => {
            Haptic.selectionAsync();
          },
        })}
      />
      <Tabs.Screen
        name="known-hosts"
        options={{
          tabBarLabel: 'Hosts',
          title: 'Known Hosts',
          tabBarIcon: ({ color }) => <Database size={34} color={color} />,
          unmountOnBlur: true,
        }}
        listeners={() => ({
          tabPress: () => {
            Haptic.selectionAsync();
          },
        })}
      />
    </Tabs>
  );
};

export default TabLayout;
