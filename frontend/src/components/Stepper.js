import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';

export default function Stepper({ steps, current }) {
  return (
    <View>
      {steps.map((label, i) => {
        const done = i <= current;
        return (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: done ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: done ? '#fff' : colors.muted, fontWeight: '700' }}>{done ? '✓' : i + 1}</Text>
            </View>
            <Text style={{ marginLeft: 12, fontSize: 15, fontWeight: i === current ? '800' : '500', color: done ? colors.text : colors.muted }}>
              {label}{i === current ? '  ← agora' : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
