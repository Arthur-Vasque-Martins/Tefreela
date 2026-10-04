import React from 'react';
import { View, Text } from 'react-native';
import { status } from '../theme';

export default function StatusBadge({ type }) {
  const st = status[type];
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: st.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ color: st.color, fontWeight: '700', fontSize: 12 }}>{st.icon} {st.label}</Text>
    </View>
  );
}
