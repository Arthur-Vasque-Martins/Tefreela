import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { colors } from '../theme';
import { api } from '../api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

const Row = ({ k, v }) => <Text style={{ marginBottom: 6 }}><Text style={{ fontWeight: '700' }}>{k}: </Text>{v}</Text>;

export default function HireScreen({ nav, item, user }) {
  const [step, setStep] = useState(0);
  const [desc, setDesc] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [hiring, setHiring] = useState(null);

  const next = async () => {
    if (step === 1 && desc.trim().length < 10) return setErr('Descreva o que você precisa com pelo menos 10 caracteres.');
    setErr('');
    if (step < 2) return setStep(step + 1);
    setBusy(true);
    try { setHiring(await api.hire(item.id, desc.trim())); setStep(3); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };

  if (step === 3) return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 26, fontWeight: '800' }}>Solicitação enviada! 🎉</Text>
      <Text style={{ textAlign: 'center', color: colors.muted, marginVertical: 10 }}>Sua solicitação foi enviada para {item.freelancer}.</Text>
      <StatusBadge type="aguardando" />
      <Button title="Ver contratação" style={{ alignSelf: 'stretch', marginTop: 20 }} onPress={() => nav.go('Hirings')} />
      <Button title="Enviar mensagem" variant="outline" style={{ alignSelf: 'stretch', marginTop: 10 }} onPress={() => nav.go('Chat', { hiringId: hiring.id })} />
    </View>
  );
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text onPress={() => (step ? setStep(step - 1) : nav.back())} style={{ color: colors.primary, fontWeight: '700' }}>← Voltar</Text>
      <Text style={{ color: colors.muted, marginVertical: 8 }}>Etapa {step + 1} de 3</Text>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 12 }}>{['Serviço', 'Solicitação', 'Revisão'][step]}</Text>
      {step === 0 && <View><Row k="Serviço" v={item.title} /><Row k="Valor" v={`${item.price} créditos`} /><Row k="Prazo" v={`${item.days} dias`} /></View>}
      {step === 1 && <View>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Descreva o que você precisa.</Text>
        <TextInput multiline value={desc} onChangeText={setDesc} placeholder="Preciso de um site institucional para uma pequena empresa..."
          style={{ minHeight: 120, backgroundColor: '#fff', borderWidth: 1, borderColor: err ? colors.danger : colors.border, borderRadius: 12, padding: 12, textAlignVertical: 'top' }} />
      </View>}
      {step === 2 && <View>
        <Row k="Cliente" v={user.name} /><Row k="Serviço" v={item.title} /><Row k="Freelancer" v={item.freelancer} />
        <Row k="Valor" v={`${item.price} créditos`} /><Row k="Prazo" v={`${item.days} dias`} /><Row k="Descrição" v={desc} />
        <Text style={{ color: colors.muted, marginTop: 6 }}>O valor é reservado do seu saldo agora e devolvido se a solicitação for recusada ou cancelada.</Text>
      </View>}
      {!!err && <Text style={{ color: colors.danger, marginTop: 8 }}>{err}</Text>}
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Button title={busy ? 'Enviando...' : step === 2 ? 'Enviar solicitação' : 'Continuar'} onPress={busy ? () => {} : next} />
      </View>
    </View>
  );
}
