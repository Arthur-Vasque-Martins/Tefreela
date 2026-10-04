import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors } from '../theme';
import { api } from '../api';
import useLoad from '../useLoad';
import { Loading, ErrorBox } from '../components/Loading';
import Button from '../components/Button';

export default function CreditsScreen({ nav }) {
  const { data, loading, error, reload } = useLoad(() => api.credits());
  const [err, setErr] = useState('');
  const topup = async () => { setErr(''); try { await api.topup(100); reload(); } catch (e) { setErr(e.message); } };
  const fee = data ? data.platformFee : 10;
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text onPress={nav.back} style={{ color: colors.primary, fontWeight: '700' }}>← Voltar</Text>
      <Text style={{ fontSize: 22, fontWeight: '800', marginVertical: 8 }}>Meus créditos</Text>
      {loading && !data && <Loading />}
      {!!error && <ErrorBox message={error} onRetry={reload} />}
      {data && <>
        <View style={{ backgroundColor: colors.primary, borderRadius: 16, padding: 20 }}>
          <Text style={{ color: '#C7D2FE' }}>Saldo atual</Text>
          <Text style={{ color: '#fff', fontSize: 34, fontWeight: '900' }}>{data.balance} créditos</Text>
        </View>
        <Button title="Adicionar 100 créditos (simulação)" variant="outline" style={{ marginTop: 12 }} onPress={topup} />
        {!!err && <Text style={{ color: colors.danger, marginTop: 6 }}>{err}</Text>}
        <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontWeight: '700', marginBottom: 6 }}>Transparência da taxa</Text>
          <Text>Exemplo com um serviço de 120 créditos:</Text>
          <Text>Taxa da plataforma: {fee} créditos (descontada do freelancer na conclusão)</Text>
          <Text style={{ fontWeight: '800' }}>Valor líquido: {120 - fee} créditos</Text>
        </View>
        <Text style={{ fontSize: 17, fontWeight: '700', marginVertical: 14 }}>Movimentações recentes</Text>
        {data.transactions.length === 0 && <Text style={{ color: colors.muted }}>Nenhuma movimentação ainda.</Text>}
        {data.transactions.map(t => (
          <View key={t.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border }}>
            <View style={{ flex: 1, paddingRight: 8 }}><Text style={{ fontWeight: '600' }}>{t.desc}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{t.date}</Text></View>
            <Text style={{ fontWeight: '800', color: t.value > 0 ? '#166534' : colors.danger }}>{t.value > 0 ? '+' : ''}{t.value}</Text>
          </View>
        ))}
      </>}
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 16 }}>Os créditos são utilizados exclusivamente para simulação das operações nesta versão acadêmica.</Text>
    </ScrollView>
  );
}
