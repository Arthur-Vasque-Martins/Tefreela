import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme';
import { api } from '../api';
import Button from '../components/Button';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState('cliente');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const register = mode === 'register';

  const submit = async () => {
    if (!email.includes('@') || pass.length < 4) return setErr('Confira seu e-mail e senha (mínimo 4 caracteres) e tente novamente.');
    if (register && name.trim().length < 2) return setErr('Informe seu nome.');
    setBusy(true); setErr('');
    try {
      const res = register
        ? await api.register({ name, email, password: pass, role })
        : await api.login(email, pass);
      onLogin(res);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <Text style={s.logo}>Tefreela</Text>
      <Text style={s.title}>{register ? 'Crie sua conta' : 'Bem-vindo de volta'}</Text>
      {register && <>
        <Text style={s.label}>Nome</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Seu nome" />
      </>}
      <Text style={s.label}>E-mail</Text>
      <TextInput style={s.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="voce@email.com" />
      <Text style={s.label}>Senha</Text>
      <TextInput style={s.input} value={pass} onChangeText={setPass} secureTextEntry placeholder="••••••" />
      {register && <>
        <Text style={s.label}>Quero usar o Tefreela como</Text>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {['cliente', 'freelancer'].map(r => (
            <TouchableOpacity key={r} onPress={() => setRole(r)} style={[s.chip, role === r && s.chipOn]}>
              <Text style={{ color: role === r ? '#fff' : colors.text, fontWeight: '600' }}>{role === r ? '● ' : '○ '}{r === 'cliente' ? 'Cliente' : 'Freelancer'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>}
      {!!err && <Text style={s.err}>{err}</Text>}
      <Button title={busy ? 'Aguarde...' : register ? 'Criar conta' : 'Entrar'} onPress={busy ? () => {} : submit} />
      <Text style={s.or}>ou</Text>
      <Button title={register ? 'Já tenho conta' : 'Criar uma conta'} variant="outline" onPress={() => { setErr(''); setMode(register ? 'login' : 'register'); }} />
      {!register && <Text style={s.hint}>Demonstração (senha 1234): daniel@tefreela.com (cliente) · carlos@tefreela.com (freelancer)</Text>}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  wrap: { flexGrow: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center' },
  logo: { fontSize: 34, fontWeight: '900', color: colors.primary, textAlign: 'center' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 20, color: colors.text },
  label: { fontWeight: '600', marginBottom: 4, color: colors.text },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 12, minHeight: 48 },
  err: { color: colors.danger, marginBottom: 10 },
  chip: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginRight: 8, backgroundColor: '#fff' },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  or: { textAlign: 'center', color: colors.muted, marginVertical: 12 },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 16 },
});
