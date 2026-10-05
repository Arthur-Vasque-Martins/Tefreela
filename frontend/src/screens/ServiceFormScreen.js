import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../api';
import { colors } from '../theme';
import Button from '../components/Button';
import { Loading } from '../components/Loading';

const Field = ({ label, value, onChangeText, placeholder, multiline, keyboardType }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={{ fontWeight: '700', marginBottom: 6 }}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      keyboardType={keyboardType}
      accessibilityLabel={label}
      style={{ minHeight: multiline ? 100 : 48, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, backgroundColor: '#fff', textAlignVertical: multiline ? 'top' : 'center' }}
    />
  </View>
);

export default function ServiceFormScreen({ nav, onSaved }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [days, setDays] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.categories()
      .then((items) => {
        setCategories(items);
        if (items.length) setCategoryId(items[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingCategories(false));
  }, []);

  const submit = async () => {
    setError('');
    setSuccess('');
    if (title.trim().length < 5) return setError('O título precisa ter pelo menos 5 caracteres.');
    if (!categoryId) return setError('Escolha uma categoria.');
    if (!Number.isInteger(Number(price)) || Number(price) < 1) return setError('Informe um preço em créditos maior que zero.');
    if (!Number.isInteger(Number(days)) || Number(days) < 1) return setError('Informe o prazo em dias.');

    setSaving(true);
    try {
      await api.createService({ title: title.trim(), description: description.trim(), categoryId, price: Number(price), days: Number(days) });
      setSuccess('Serviço publicado! Ele já pode aparecer na busca.');
      onSaved?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text onPress={nav.back} style={{ color: colors.primary, fontWeight: '700', marginBottom: 12 }}>← Voltar ao painel</Text>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 6 }}>Adicionar serviço</Text>
      <Text style={{ color: colors.muted, marginBottom: 18 }}>Explique o que você oferece, quanto custa e em quantos dias entrega.</Text>

      <Field label="Nome do serviço" value={title} onChangeText={setTitle} placeholder="Ex.: Criação de identidade visual" />
      <Field label="Descrição" value={description} onChangeText={setDescription} placeholder="Descreva o que está incluído no serviço" multiline />

      <Text style={{ fontWeight: '700', marginBottom: 8 }}>Categoria</Text>
      {loadingCategories ? <Loading /> : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }}>
          {categories.map((category) => {
            const selected = category.id === categoryId;
            return (
              <TouchableOpacity key={category.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setCategoryId(category.id)}
                style={{ paddingVertical: 9, paddingHorizontal: 12, marginRight: 8, marginBottom: 8, borderRadius: 18, borderWidth: 1, borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? '#EEF2FF' : '#fff' }}>
                <Text style={{ color: selected ? colors.primary : colors.text }}>{category.icon} {category.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Field label="Preço (créditos)" value={price} onChangeText={setPrice} placeholder="Ex.: 50" keyboardType="numeric" />
      <Field label="Prazo de entrega (dias)" value={days} onChangeText={setDays} placeholder="Ex.: 5" keyboardType="numeric" />
      {!!error && <Text accessibilityRole="alert" style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text>}
      {!!success && <Text accessibilityRole="status" style={{ color: '#15803D', marginBottom: 12 }}>{success}</Text>}
      <Button title={saving ? 'Publicando…' : 'Publicar serviço'} onPress={submit} />
    </ScrollView>
  );
}