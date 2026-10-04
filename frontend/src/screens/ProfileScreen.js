import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';
import Button from '../components/Button';

export default function ProfileScreen({ nav, user, onLogout }) {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Meu perfil</Text>
      <View style={{ alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <Text style={{ fontSize: 48 }}>👤</Text>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{user.name}</Text>
        {!!user.headline && <Text style={{ color: colors.text }}>{user.headline}</Text>}
        <Text style={{ color: colors.muted }}>{user.email}{user.city ? ` · ${user.city}` : ''}</Text>
      </View>
      <Button title="Meus créditos" onPress={() => nav.go('Credits')} />
      <Button title="Editar perfil" variant="outline" style={{ marginVertical: 10 }} onPress={() => {}} />
      <Button title="Sair" variant="danger" onPress={onLogout} />
    </View>
  );
}
