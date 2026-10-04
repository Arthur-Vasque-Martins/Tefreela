import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { colors, shadow } from '../theme';
import { api } from '../api';
import useLoad from '../useLoad';
import { Loading, ErrorBox } from '../components/Loading';
import EmptyState from '../components/EmptyState';

// Sem hiringId (aba Mensagens): lista de conversas. Com hiringId: conversa aberta.
export default function ChatScreen({ nav, hiringId = null }) {
  const [open, setOpen] = useState(hiringId);
  if (open) return <Thread id={open} onBack={hiringId ? nav.back : () => setOpen(null)} />;
  return <Conversations onOpen={setOpen} nav={nav} />;
}

function Conversations({ onOpen, nav }) {
  const { data, loading, error, reload } = useLoad(() => api.conversations());
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 10 }}>Mensagens</Text>
      {loading && <Loading />}
      {!!error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="Nenhuma conversa ainda." text="As conversas aparecem aqui quando existe uma contratação." />}
      {(data || []).map(c => (
        <TouchableOpacity key={c.hiringId} onPress={() => onOpen(c.hiringId)} style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, ...shadow }}>
          <Text style={{ fontWeight: '800', fontSize: 16 }}>{c.other}</Text>
          <Text style={{ color: colors.muted }}>{c.service}</Text>
          {!!c.lastText && <Text numberOfLines={1} style={{ marginTop: 4, color: colors.text }}>{c.lastText}</Text>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function Thread({ id, onBack }) {
  const [info, setInfo] = useState({ other: '', service: '' });
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef(null);

  const load = () => api.messages(id).then(d => { setInfo({ other: d.other, service: d.service }); setMsgs(d.messages); setError(''); }).catch(e => setError(e.message));
  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [id]); // atualização periódica

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    try { const m = await api.sendMessage(id, t); setMsgs(list => [...(list || []), m]); }
    catch (e) { setError(e.message); setText(t); }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: colors.border }}>
        <Text onPress={onBack} style={{ color: colors.primary, fontWeight: '700', marginBottom: 4 }}>← Voltar</Text>
        <Text style={{ fontWeight: '800', fontSize: 17 }}>{info.other}</Text>
        <Text style={{ color: colors.muted }}>{info.service}</Text>
      </View>
      {msgs === null && !error && <Loading />}
      {!!error && <Text style={{ color: colors.danger, padding: 12 }}>{error}</Text>}
      <FlatList ref={listRef} data={msgs || []} keyExtractor={m => String(m.id)} contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => listRef.current && listRef.current.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={{ alignSelf: item.mine ? 'flex-end' : 'flex-start', maxWidth: '80%', backgroundColor: item.mine ? colors.primary : '#fff', borderRadius: 16, padding: 12, marginBottom: 8, borderWidth: item.mine ? 0 : 1, borderColor: colors.border }}>
            <Text style={{ color: item.mine ? '#fff' : colors.text }}>{item.text}</Text>
          </View>
        )} />
      <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: colors.border }}>
        <TextInput value={text} onChangeText={setText} placeholder="Digite uma mensagem..." onSubmitEditing={send} style={{ flex: 1, minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 22, paddingHorizontal: 14 }} />
        <TouchableOpacity accessibilityLabel="Enviar" onPress={send} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
          <Text style={{ fontSize: 18 }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
