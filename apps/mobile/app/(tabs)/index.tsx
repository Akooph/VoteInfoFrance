import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { api } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import type { PropositionListItem, GeoLookupResult } from '@vif/types';

export default function DashboardScreen() {
  const [propositions, setPropositions] = useState<PropositionListItem[]>([]);
  const [geoResult, setGeoResult] = useState<GeoLookupResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token) {
        const profile = await api.profile.get(token).catch(() => null);
        if (profile?.codePostal) {
          const geo = await api.geo.lookup(profile.codePostal).catch(() => null);
          setGeoResult(geo);
        }
      }

      const data = await api.propositions.list({ page: 1, token }).catch(() => null);
      setPropositions(data?.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1d4ed8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {geoResult && (
        <View style={styles.geoCard}>
          <Text style={styles.geoTitle}>Votre espace civique</Text>
          <Text style={styles.geoText}>
            {geoResult.commune.nom} · {geoResult.departement.nom} · {geoResult.region.nom}
          </Text>
        </View>
      )}

      <Text style={styles.heading}>Propositions</Text>

      <FlatList
        data={propositions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/proposition/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.levelBadge}>{item.geoLevel}</Text>
              {item.userVote && <Text style={styles.votedBadge}>✓ Voté</Text>}
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.titre}</Text>
            <Text style={styles.cardMeta}>
              {item.institution.replace(/_/g, ' ')}
              {item.dateDepot ? ` · ${new Date(item.dateDepot).toLocaleDateString('fr-FR')}` : ''}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  geoCard: { backgroundColor: '#eff6ff', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#bfdbfe' },
  geoTitle: { fontWeight: '700', color: '#1d4ed8', marginBottom: 4 },
  geoText: { fontSize: 13, color: '#1e40af' },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'center' },
  levelBadge: { fontSize: 12, color: '#1d4ed8', backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontWeight: '500' },
  votedBadge: { fontSize: 12, color: '#16a34a', fontWeight: '600' },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4, lineHeight: 20 },
  cardMeta: { fontSize: 12, color: '#6b7280' },
});
