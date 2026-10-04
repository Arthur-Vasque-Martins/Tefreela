import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';
import Button from './Button';

export default function EmptyState({ title, text, action, onAction }) {
  return (
    <View style={{ alignItems: 'center', padding: 32 }}>
      <Text style={{ fontSize: 44 }}>🔍</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 8 }}>{title}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center', marginVertical: 8 }}>{text}</Text>
      {action && <Button title={action} onPress={onAction} />}
    </View>
  );
}
