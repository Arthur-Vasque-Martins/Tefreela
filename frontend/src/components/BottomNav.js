import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { colors } from '../theme';

const tabs = {
  cliente: [['Home', '🏠', 'Início'], ['Search', '🔎', 'Explorar'], ['Hirings', '📋', 'Contratações'], ['Chat', '💬', 'Mensagens'], ['Profile', '👤', 'Perfil']],
  freelancer: [['Dashboard', '🏠', 'Início'], ['Hirings', '📥', 'Solicitações'], ['Chat', '💬', 'Mensagens'], ['Profile', '👤', 'Perfil']],
  developer: [['DeveloperDashboard', '🛠️', 'Desenvolvedor'], ['Profile', '👤', 'Perfil']],
};
export default function BottomNav({ role, tab, onChange }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: colors.border }}>
      {tabs[role].map(([key, icon, label]) => (
        <TouchableOpacity key={key} accessibilityRole="tab" accessibilityLabel={label}
          onPress={() => onChange(key)} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, minHeight: 56 }}>
          <Text style={{ fontSize: 20 }}>{icon}</Text>
          <Text style={{ fontSize: 10, fontWeight: tab === key ? '800' : '500', color: tab === key ? colors.primary : colors.muted }}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
