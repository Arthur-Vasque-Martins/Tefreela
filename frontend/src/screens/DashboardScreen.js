import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { colors, shadow } from '../theme';
import { api } from '../api';
import useLoad from '../useLoad';
import { Loading, ErrorBox } from '../components/Loading';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

const Card = ({ label, value }) => (
  <View style={{ width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, ...shadow }}>
    <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
    <Text style={{ fontSize: 24, fontWeight: '800' }}>{value}</Text>
  </View>
);

export default function DashboardScreen({ nav }) {
  const { data, loading, error, reload } = useLoad(async () => {
    const [stats, hirings] = await Promise.all([api.dashboard(), api.hirings()]);
    return { stats, pending: hirings.filter(h => h.status === 'aguardando').slice(0, 5) };
  });
  const [err, setErr] = useState('');

  const act = async (id, status) => { setErr(''); try { await api.updateStatus(id, status); reload(); } catch (e) { setErr(e.message); } };
  const accept = h => Alert.alert('Aceitar contratação?', `Serviço: ${h.service}\nCliente: ${h.client}\nValor: ${h.price} créditos\nPrazo: ${h.days} dias`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Confirmar', onPress: () => act(h.id, 'aceita') }]);
  const refuse = h => Alert.alert('Recusar solicitação?', 'O cliente será reembolsado e a solicitação será encerrada.', [{ text: 'Voltar', style: 'cancel' }, { text: 'Recusar', style: 'destructive', onPress: () => act(h.id, 'recusada') }]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {loading && !data && <Loading />}
      {!!error && <ErrorBox message={error} onRetry={reload} />}
      {data && <>
        <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Olá, {data.stats.name.split(' ')[0]} 👋</Text>
        <Button title="＋ Adicionar meu serviço" onPress={() => nav.go('ServiceForm', { onSaved: reload })} style={{ marginBottom: 14 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Card label="Saldo" value={`${data.stats.balance} créditos`} /><Card label="Solicitações pendentes" value={data.stats.pending} />
          <Card label="Serviços ativos" value={data.stats.active} /><Card label="Serviços concluídos" value={data.stats.completed} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: '700', marginVertical: 10 }}>Solicitações recentes</Text>
        {!!err && <Text style={{ color: colors.danger, marginBottom: 8 }}>{err}</Text>}
        {data.pending.length === 0 && <Text style={{ color: colors.muted }}>Nenhuma solicitação pendente.</Text>}
        {data.pending.map(h => (
          <View key={h.id} style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, ...shadow }}>
            <Text onPress={() => nav.go('HiringDetail', { h })} style={{ fontWeight: '700', fontSize: 16 }}>{h.service}</Text>
            <Text style={{ color: colors.muted }}>Cliente: {h.client} · {h.price} créditos</Text>
            <View style={{ marginVertical: 8 }}><StatusBadge type={h.status} /></View>
            <View style={{ flexDirection: 'row' }}>
              <Button title="Aceitar" onPress={() => accept(h)} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Recusar" variant="danger" onPress={() => refuse(h)} style={{ flex: 1 }} />
            </View>
          </View>
        ))}
      </>}
    </ScrollView>
  );
}
