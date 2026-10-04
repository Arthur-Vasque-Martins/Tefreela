import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, shadow } from '../theme';
import Rating from './Rating';
import Button from './Button';

export default function ServiceCard({ item, onPress }) {
  return (
    <View style={s.card}>
      <View style={s.img}><Text style={{ fontSize: 40 }}>{item.emoji}</Text></View>
      <Text style={s.cat}>{item.category}</Text>
      <Text style={s.title}>{item.title}</Text>
      <Text style={s.muted}>{item.freelancer}</Text>
      <Rating value={item.rating} reviews={item.reviews} />
      <Text style={s.price}>A partir de {item.price} créditos</Text>
      <Text style={s.muted}>Prazo: até {item.days} dias</Text>
      <Button title="Ver serviço" onPress={onPress} style={{ marginTop: 10 }} />
    </View>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 14, ...shadow },
  img: { height: 110, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cat: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, marginVertical: 2 },
  muted: { color: colors.muted, fontSize: 13 },
  price: { fontWeight: '800', color: colors.text, marginTop: 6 },
});
