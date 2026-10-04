import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme';
import { api } from '../api';
import useLoad from '../useLoad';
import { Loading, ErrorBox } from '../components/Loading';
import CategoryCard from '../components/CategoryCard';
import ServiceCard from '../components/ServiceCard';

export default function HomeScreen({ nav, user }) {
  const { data, loading, error, reload } = useLoad(async () => {
    const [categories, services] = await Promise.all([api.categories(), api.services()]);
    return { categories, services };
  });
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.primary }}>Tefreela</Text>
        <Text style={{ fontSize: 22 }}>🔔  👤</Text>
      </View>
      <Text style={{ fontSize: 22, fontWeight: '800', marginTop: 16, color: colors.text }}>Olá, {user.name.split(' ')[0]} 👋</Text>
      <Text style={{ color: colors.muted, marginBottom: 12 }}>O que você precisa hoje?</Text>
      <TouchableOpacity onPress={() => nav.go('Search')} accessibilityRole="search"
        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16 }}>
        <Text style={{ color: colors.muted }}>🔎  Que serviço você está procurando?</Text>
      </TouchableOpacity>
      {loading && <Loading />}
      {!!error && <ErrorBox message={error} onRetry={reload} />}
      {data && <>
        <Text style={{ fontSize: 17, fontWeight: '700', marginVertical: 14 }}>Encontre por categoria</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {data.categories.map(c => <CategoryCard key={c.id} item={c} onPress={() => nav.go('Search', { cat: c.name })} />)}
        </View>
        <Text style={{ fontSize: 17, fontWeight: '700', marginVertical: 14 }}>Serviços para você</Text>
        {data.services.map(i => <ServiceCard key={i.id} item={i} onPress={() => nav.go('ServiceDetail', { item: i })} />)}
      </>}
    </ScrollView>
  );
}
