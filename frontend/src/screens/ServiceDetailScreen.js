import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { colors } from '../theme';
import { portfolio } from '../data/mock';
import Rating from '../components/Rating';
import Button from '../components/Button';

const H = ({ t }) => <Text style={{ fontSize: 17, fontWeight: '700', marginTop: 18, marginBottom: 6 }}>{t}</Text>;

export default function ServiceDetailScreen({ nav, item }) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text onPress={nav.back} style={{ color: colors.primary, fontWeight: '700', marginBottom: 8 }}>← Voltar</Text>
        <View style={{ height: 160, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 60 }}>{item.emoji}</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', marginTop: 12 }}>{item.title}</Text>
        <Text style={{ color: colors.muted }}>{item.freelancer}</Text>
        <Rating value={item.rating} reviews={item.reviews} />
        <Text style={{ fontSize: 20, fontWeight: '800', marginTop: 8 }}>{item.price} créditos</Text>
        <Text style={{ color: colors.muted }}>Prazo: até {item.days} dias</Text>
        <H t="Sobre este serviço" />
        <Text style={{ color: colors.text }}>{item.description || 'Serviço profissional, com entrega acompanhada e comunicação direta pelo chat.'}</Text>
        <H t="O que está incluído" />
        <Text>✓ Briefing inicial{'\n'}✓ Entrega dentro do prazo{'\n'}✓ 2 ajustes após a entrega</Text>
        <H t="Sobre o freelancer" />
        <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontWeight: '700' }}>👤 {item.freelancer}</Text>
          <Text style={{ color: colors.muted }}>{item.role}</Text>
          <Text style={{ color: colors.muted }}>📍 {item.city}</Text>
        </View>
        <H t="Portfólio" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {portfolio.map((p, i) => (
            <View key={i} accessibilityLabel={`Trabalho ${i + 1}`} style={{ width: '48%', height: 80, borderRadius: 12, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 30 }}>{p}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: colors.border }}>
        <Button title="Solicitar contratação" variant="accent" onPress={() => nav.go('Hire', { item })} />
      </View>
    </View>
  );
}
