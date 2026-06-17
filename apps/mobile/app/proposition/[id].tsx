import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import type { Proposition, VoteTally, VoteOption } from '@vif/types';

const VOTE_OPTIONS: VoteOption[] = ['POUR', 'CONTRE', 'INFO', 'BLANC'];
const VOTE_COLORS: Record<VoteOption, string> = {
  POUR: '#16a34a',
  CONTRE: '#dc2626',
  INFO: '#d97706',
  BLANC: '#6b7280',
};

export default function PropositionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [proposition, setProposition] = useState<Proposition | null>(null);
  const [tally, setTally] = useState<VoteTally | null>(null);
  const [userVote, setUserVote] = useState<VoteOption | null>(null);
  const [voting, setVoting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      setToken(session?.access_token ?? null);

      const [prop, t] = await Promise.all([
        api.propositions.get(id, session?.access_token),
        api.propositions.tally(id),
      ]);
      setProposition(prop);
      setTally(t);

      if (session?.access_token) {
        const votes = await api.votes.myVotes(session.access_token).catch(() => []);
        const existing = votes.find((v) => v.propositionId === id);
        if (existing) setUserVote(existing.option as VoteOption);
      }
    }
    load();
  }, [id]);

  async function handleVote(option: VoteOption) {
    if (!token || userVote || voting) return;
    setVoting(true);
    try {
      await api.votes.cast({ propositionId: id!, option }, token);
      setUserVote(option);
      const updated = await api.propositions.tally(id!);
      setTally(updated);
    } catch (e: unknown) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Impossible de voter');
    } finally {
      setVoting(false);
    }
  }

  if (!proposition) {
    return <View style={styles.center}><ActivityIndicator color="#1d4ed8" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.badges}>
        <Text style={styles.levelBadge}>{proposition.geoLevel}</Text>
        <Text style={styles.institution}>{proposition.institution.replace(/_/g, ' ')}</Text>
      </View>

      <Text style={styles.title}>{proposition.titre}</Text>
      {proposition.dateDepot && (
        <Text style={styles.date}>
          Déposé le {new Date(proposition.dateDepot).toLocaleDateString('fr-FR')}
        </Text>
      )}

      {proposition.summary ? (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Résumé</Text>
            <Text style={styles.summaryText}>{proposition.summary.resume}</Text>
          </View>
          <View style={[styles.summaryCard, styles.pourCard]}>
            <Text style={[styles.sectionTitle, { color: '#16a34a' }]}>Pour</Text>
            <Text style={styles.summaryText}>{proposition.summary.pour}</Text>
          </View>
          <View style={[styles.summaryCard, styles.contreCard]}>
            <Text style={[styles.sectionTitle, { color: '#dc2626' }]}>Contre</Text>
            <Text style={styles.summaryText}>{proposition.summary.contre}</Text>
          </View>
        </>
      ) : (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingText}>Résumé en cours de génération...</Text>
        </View>
      )}

      <TouchableOpacity onPress={() => Linking.openURL(proposition.sourceUrl)}>
        <Text style={styles.sourceLink}>Consulter le document officiel →</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Votre vote</Text>
      {userVote ? (
        <View style={[styles.votedBadge, { backgroundColor: VOTE_COLORS[userVote] }]}>
          <Text style={styles.votedText}>Vous avez voté : {userVote}</Text>
        </View>
      ) : !token ? (
        <Text style={styles.authNote}>Connectez-vous pour voter.</Text>
      ) : (
        <View style={styles.voteButtons}>
          {VOTE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.voteBtn, { backgroundColor: VOTE_COLORS[opt] }]}
              onPress={() => handleVote(opt)}
              disabled={voting}
            >
              <Text style={styles.voteBtnText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {tally && tally.total > 0 && (
        <View style={styles.tallySection}>
          <Text style={styles.sectionTitle}>Résultats ({tally.total.toLocaleString('fr-FR')} votes)</Text>
          {VOTE_OPTIONS.map((opt) => (
            <View key={opt} style={styles.tallyRow}>
              <Text style={[styles.tallyLabel, { color: VOTE_COLORS[opt] }]}>{opt}</Text>
              <View style={styles.tallyBar}>
                <View
                  style={[
                    styles.tallyFill,
                    { width: `${tally.total > 0 ? (tally[opt] / tally.total) * 100 : 0}%`, backgroundColor: VOTE_COLORS[opt] },
                  ]}
                />
              </View>
              <Text style={styles.tallyCount}>{tally[opt].toLocaleString('fr-FR')}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  badges: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 },
  levelBadge: { fontSize: 12, color: '#1d4ed8', backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontWeight: '600' },
  institution: { fontSize: 13, color: '#6b7280' },
  title: { fontSize: 20, fontWeight: '700', lineHeight: 28, marginBottom: 8 },
  date: { fontSize: 13, color: '#9ca3af', marginBottom: 16 },
  summaryCard: { backgroundColor: '#f0fdf4', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0', marginBottom: 10 },
  pourCard: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  contreCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  pendingCard: { backgroundColor: '#f3f4f6', padding: 14, borderRadius: 8, marginBottom: 10 },
  pendingText: { color: '#9ca3af', fontSize: 14 },
  sectionTitle: { fontWeight: '700', fontSize: 14, marginBottom: 6 },
  summaryText: { fontSize: 14, lineHeight: 22, color: '#374151' },
  sourceLink: { color: '#2563eb', fontSize: 14, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 20 },
  voteButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  voteBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 6 },
  voteBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  votedBadge: { padding: 12, borderRadius: 8 },
  votedText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  authNote: { color: '#6b7280', fontSize: 14 },
  tallySection: { marginTop: 16 },
  tallyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  tallyLabel: { width: 56, fontWeight: '600', fontSize: 13 },
  tallyBar: { flex: 1, height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  tallyFill: { height: '100%', borderRadius: 5 },
  tallyCount: { width: 48, textAlign: 'right', fontSize: 12, color: '#6b7280' },
});
