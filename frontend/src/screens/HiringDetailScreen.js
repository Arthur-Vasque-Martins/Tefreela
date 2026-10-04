import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { colors } from '../theme';
import { api } from '../api';
import Stepper from '../components/Stepper';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

// Ações disponíveis para cada papel, conforme o status atual.
const actionsFor = (role, status) => role === 'freelancer'
  ? ({ aguardando: [['aceita', 'Aceitar', 'primary'], ['recusada', 'Recusar', 'danger']],
       aceita: [['andamento', 'Iniciar serviço', 'primary']],
       andamento: [['concluida', 'Marcar como concluído', 'primary']] })[status] || []
  : ({ aguardando: [['cancelada', 'Cancelar solicitação', 'danger']],
       aceita: [['cancelada', 'Cancelar contratação', 'danger']] })[status] || [];

export default function HiringDetailScreen({ nav, h: initial, role }) {
  const [h, setH] = useState(initial);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (status, label) => Alert.alert(`${label}?`, `${h.service}\nValor: ${h.price} créditos`, [
    { text: 'Voltar', style: 'cancel' },
    { text: 'Confirmar', onPress: async () => {
      setBusy(true); setErr('');
      try { setH(await api.updateStatus(h.id, status)); } catch (e) { setErr(e.message); }
      setBusy(false);
    } },
  ]);
  const review = async () => {
    if (!stars) return setErr('Escolha de 1 a 5 estrelas.');
    setBusy(true); setErr('');
    try { setH(await api.review(h.id, stars, comment)); } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text onPress={nav.back} style={{ color: colors.primary, fontWeight: '700' }}>← Voltar</Text>
      <Text style={{ fontSize: 22, fontWeight: '800', marginVertical: 8 }}>{role === 'cliente' ? 'Minha contratação' : 'Solicitação'}</Text>
      <Text style={{ fontWeight: '700' }}>{h.service}</Text>
      <Text style={{ color: colors.muted, marginBottom: 8 }}>{role === 'cliente' ? h.freelancer : h.client} · {h.price} créditos · {h.days} dias</Text>
      <StatusBadge type={h.status} />
      <Text style={{ marginTop: 10, color: colors.text }}>{h.msg}</Text>
      <View style={{ marginVertical: 20 }}>
        <Stepper steps={['Solicitada', 'Aguardando freelancer', 'Aceita', 'Em andamento', 'Concluída']} current={h.step} />
      </View>
      {!!err && <Text style={{ color: colors.danger, marginBottom: 10 }}>{err}</Text>}
      {!busy && actionsFor(role, h.status).map(([status, label, variant]) => (
        <Button key={status} title={label} variant={variant} style={{ marginBottom: 10 }} onPress={() => change(status, label)} />
      ))}
      <Button title={role === 'cliente' ? 'Conversar com o freelancer' : 'Conversar com o cliente'} variant="outline" onPress={() => nav.go('Chat', { hiringId: h.id })} />
      {role === 'cliente' && h.status === 'concluida' && (
        <View style={{ marginTop: 20 }}>
          {h.reviewed ? <Text style={{ color: '#166534', fontWeight: '700' }}>Avaliação enviada com sucesso! ({h.reviewRating} ★)</Text> : <>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>Como foi sua experiência?</Text>
            <View style={{ flexDirection: 'row', marginVertical: 8 }}>
              {[1, 2, 3, 4, 5].map(n => <Text key={n} accessibilityLabel={`${n} estrelas`} onPress={() => setStars(n)} style={{ fontSize: 34, color: n <= stars ? colors.accent : colors.border }}>★</Text>)}
            </View>
            <TextInput multiline value={comment} onChangeText={setComment} placeholder="Conte como foi sua experiência." style={{ minHeight: 80, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 }} />
            <Button title="Enviar avaliação" onPress={review} />
          </>}
        </View>
      )}
    </ScrollView>
  );
}
