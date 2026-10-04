import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../theme';
import Button from './Button';

export const Loading = () => (
  <View style={{ padding: 32, alignItems: 'center' }}><ActivityIndicator color={colors.primary} size="large" /></View>
);

export const ErrorBox = ({ message, onRetry }) => (
  <View style={{ padding: 24, alignItems: 'center' }}>
    <Text style={{ fontSize: 40 }}>⚠️</Text>
    <Text style={{ color: colors.danger, textAlign: 'center', marginVertical: 10 }}>{message}</Text>
    {onRetry && <Button title="Tentar novamente" variant="outline" onPress={onRetry} />}
  </View>
);
