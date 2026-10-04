import React from 'react';
import { Text } from 'react-native';
import { colors } from '../theme';

export default function Rating({ value, reviews }) {
  return (
    <Text accessibilityLabel={`Nota ${value}`} style={{ color: colors.text, fontSize: 13 }}>
      ⭐ {String(value).replace('.', ',')}{reviews ? ` · ${reviews} avaliações` : ''}
    </Text>
  );
}
