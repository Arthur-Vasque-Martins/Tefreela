import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Button({ title, onPress, variant = 'primary', style }) {
  const v = variants[variant];
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={title}
      onPress={onPress} style={[s.btn, { backgroundColor: v.bg, borderColor: v.border }, style]}>
      <Text style={[s.txt, { color: v.color }]}>{title}</Text>
    </TouchableOpacity>
  );
}
const variants = {
  primary: { bg: colors.primary, color: '#fff', border: colors.primary },
  accent: { bg: colors.accent, color: '#1F2937', border: colors.accent },
  outline: { bg: '#fff', color: colors.primary, border: colors.primary },
  danger: { bg: '#fff', color: colors.danger, border: colors.danger },
};
const s = StyleSheet.create({
  btn: { minHeight: 48, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  txt: { fontSize: 16, fontWeight: '700' },
});
