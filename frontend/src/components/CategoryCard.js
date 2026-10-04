import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { colors } from '../theme';

export default function CategoryCard({ item, onPress }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={item.name} onPress={onPress}
      style={{ width: '23%', alignItems: 'center', padding: 8, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}>
      <Text style={{ fontSize: 26 }}>{item.icon}</Text>
      <Text style={{ fontSize: 11, color: colors.text, marginTop: 4 }} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );
}
