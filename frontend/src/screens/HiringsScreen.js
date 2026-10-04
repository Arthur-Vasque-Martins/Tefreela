import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors, shadow } from '../theme';
import { api } from '../api';
import useLoad from '../useLoad';
import { Loading, ErrorBox } from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const tabs = [['todas', 'Todas'], ['aguardando', 'Pendentes'], ['andamento', 'Em andamento'], ['concluida', 'Concluídas'], ['recusada', 'Recusadas']];

export default function HiringsScreen({ nav, role }) {
  const [tab, setTab] = useState('todas');
  const { data, loading, error, reload } = useLoad(() => api.hirings());
  const list = (data || []).filter(h => tab === 'todas' || h.status === tab);
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 10 }}>{role === 'cliente' ? 'Minhas contratações' : 'Solicitações'}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 10 }}>
        {tabs.map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => setTab(k)} style={{ paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, borderRadius: 20, backgroundColor: tab === k ? colors.primary : '#fff', borderWidth: 1, borderColor: colors.primary }}>
            <Text style={{ color: tab === k ? '#fff' : colors.primary, fontWeight: '600' }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView>
        {loading && <Loading />}
        {!!error && <ErrorBox message={error} onRetry={reload} />}
        {data && list.length === 0 && (role === 'cliente'
          ? <EmptyState title="Você ainda não possui contratações." text="Explore os serviços disponíveis e encontre um profissional." action="Explorar serviços" onAction={() => nav.go('Search')} />
          : <EmptyState title="Nenhuma solicitação por aqui." text="Quando um cliente contratar seus serviços, as solicitações aparecem nesta lista." />)}
        {list.map(h => (
          <TouchableOpacity key={h.id} onPress={() => nav.go('HiringDetail', { h })} style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, ...shadow }}>
            <Text style={{ fontWeight: '700', fontSize: 16 }}>{h.service}</Text>
            <Text style={{ color: colors.muted }}>{role === 'cliente' ? h.freelancer : h.client} · {h.date}</Text>
            <Text style={{ fontWeight: '800', marginVertical: 6 }}>{h.price} créditos</Text>
            <StatusBadge type={h.status} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
