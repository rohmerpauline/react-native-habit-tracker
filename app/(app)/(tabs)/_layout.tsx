'use client';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

const TabsLayout = () => {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => {
            {
              return focused ? (
                <FontAwesome name="home" size={24} color={color} />
              ) : (
                <AntDesign name="home" size={24} color="black" />
              );
            }
          },
        }}
      />
      <Tabs.Screen name="login" options={{ title: 'Login' }} />
    </Tabs>
  );
};

export default TabsLayout;
