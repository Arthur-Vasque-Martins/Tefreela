import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../theme';
import { api } from '../api';
import ServiceCard from '../components/ServiceCard';
import EmptyState from '../components/EmptyState';
import { Loading, ErrorBox } from '../components/Loading';

export default function SearchScreen({ nav, cat = null }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState(cat);
  const [cheap, setCheap] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    const t = setTimeout(() => {
      api.services({ q, category, maxPrice: cheap ? 100 : undefined })
        .then(d => alive && (setList(d), setLoading(false)))
        .catch(e => alive && (setError(e.message), setLoading(false)));
    }, 250); // espera o usuário parar de digitar
    return () => { alive = false; clearTimeout(t); };
  }, [q, category, cheap, tick]);

  const reset = () => { setQ(''); setCategory(null); setCheap(false); };
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 10 }}>Pesquisar serviços</Text>
      <TextInput value={q} onChangeText={setQ} placeholder="Digite o serviço que você procura..."
        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14 }} />
      <View style={{ flexDirection: 'row', marginVertical: 10 }}>
        {category && <Chip label={`${category} ×`} on onPress={() => setCategory(null)} />}
        <Chip label={cheap ? 'Até 100 créditos ×' : 'Até 100 créditos'} on={cheap} onPress={() => setCheap(!cheap)} />
      </View>
      {!!error ? <ErrorBox message={error} onRetry={() => setTick(tick + 1)} /> : loading ? <Loading /> : <>
        <Text style={{ color: colors.muted, marginBottom: 8 }}>{list.length} serviços encontrados</Text>
        <FlatList data={list} keyExtractor={i => String(i.id)}
          ListEmptyComponent={<EmptyState title="Nenhum serviço encontrado." text="Tente alterar os filtros ou utilizar outros termos." action="Limpar filtros" onAction={reset} />}
          renderItem={({ item }) => <ServiceCard item={item} onPress={() => nav.go('ServiceDetail', { item })} />} />
      </>}
    </View>
  );
}
const Chip = ({ label, on, onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: on ? colors.primary : '#fff', borderWidth: 1, borderColor: colors.primary }}>
    <Text style={{ color: on ? '#fff' : colors.primary, fontWeight: '600', fontSize: 13 }}>{label}</Text>
  </TouchableOpacity>
);
