import React, { useState } from 'react';
import { SafeAreaView, View, StatusBar } from 'react-native';
import { colors } from './src/theme';
import { setToken } from './src/api';
import BottomNav from './src/components/BottomNav';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import ServiceDetailScreen from './src/screens/ServiceDetailScreen';
import HireScreen from './src/screens/HireScreen';
import HiringsScreen from './src/screens/HiringsScreen';
import HiringDetailScreen from './src/screens/HiringDetailScreen';
import ChatScreen from './src/screens/ChatScreen';
import CreditsScreen from './src/screens/CreditsScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ServiceFormScreen from './src/screens/ServiceFormScreen';

const screens = {
  Home: HomeScreen, Search: SearchScreen, ServiceDetail: ServiceDetailScreen, Hire: HireScreen,
  Hirings: HiringsScreen, HiringDetail: HiringDetailScreen, Chat: ChatScreen,
  Credits: CreditsScreen, Dashboard: DashboardScreen, Profile: ProfileScreen, ServiceForm: ServiceFormScreen,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('Home');
  const [stack, setStack] = useState([]);
  const nav = {
    go: (name, params = {}) => setStack(s => [...s, { name, params }]),
    back: () => setStack(s => s.slice(0, -1)),
  };
  const login = ({ token, user: u }) => {
    setToken(token); setUser(u); setStack([]); setTab(u.role === 'cliente' ? 'Home' : 'Dashboard');
  };
  const logout = () => { setToken(null); setUser(null); setStack([]); };

  if (!user) return <SafeAreaView style={{ flex: 1 }}><LoginScreen onLogin={login} /></SafeAreaView>;

  const top = stack[stack.length - 1];
  const Screen = screens[top ? top.name : tab];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <Screen nav={nav} user={user} role={user.role} onLogout={logout} {...(top ? top.params : {})} />
      </View>
      {!top && <BottomNav role={user.role} tab={tab} onChange={t => { setStack([]); setTab(t); }} />}
    </SafeAreaView>
  );
}
