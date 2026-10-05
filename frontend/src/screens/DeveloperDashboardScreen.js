import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { api } from '../api';
import { colors, shadow } from '../theme';
import useLoad from '../useLoad';
import { ErrorBox, Loading } from '../components/Loading';
import Button from '../components/Button';

const Stat = ({ title, value }) => (
  <View style={{ width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, ...shadow }}>
    <Text style={{ color: colors.muted, fontSize: 12 }}>{title}</Text>
    <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '800' }}>{value}</Text>
  </View>
);

export default function DeveloperDashboardScreen() {
  const { data, loading, error, reload } = useLoad(() => api.developerOverview());

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800', marginBottom: 4 }}>ÁREA RESTRITA</Text>
      <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 14 }}>Painel de desenvolvimento</Text>
      {loading && !data && <Loading />}
      {!!error && <ErrorBox message={error} onRetry={reload} />}
      {data && <>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Stat title="Contas cadastradas" value={data.counts.users} />
          <Stat title="Clientes" value={data.counts.clients} />
          <Stat title="Freelancers" value={data.counts.freelancers} />
          <Stat title="Serviços ativos" value={data.counts.services} />
          <Stat title="Contratações" value={data.counts.hirings} />
          <Stat title="Pendentes" value={data.counts.pending} />
        </View>

        <Text style={{ fontSize: 18, fontWeight: '800', marginVertical: 10 }}>Serviços recentes</Text>
        {data.services.length === 0 && <Text style={{ color: colors.muted }}>Ainda não há serviços cadastrados.</Text>}
        {data.services.map((service) => (
          <View key={service.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, ...shadow }}>
            <Text style={{ fontWeight: '700' }}>{service.title}</Text>
            <Text style={{ color: colors.muted }}>{service.category} · {service.freelancer} · {service.price} créditos · {service.active ? 'Ativo' : 'Inativo'}</Text>
          </View>
        ))}

        <Text style={{ fontSize: 18, fontWeight: '800', marginVertical: 10 }}>Contas recentes</Text>
        {data.users.map((user) => (
          <View key={user.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, ...shadow }}>
            <Text style={{ fontWeight: '700' }}>{user.name} · {user.role}</Text>
            <Text style={{ color: colors.muted }}>{user.email}</Text>
          </View>
        ))}
        <Button title="Atualizar painel" variant="outline" onPress={reload} style={{ marginVertical: 12 }} />
      </>}
    </ScrollView>
  );
}