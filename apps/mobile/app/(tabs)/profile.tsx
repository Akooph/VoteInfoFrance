import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api-client';
import type { UserProfile } from '@vif/types';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [codePostal, setCodePostal] = useState('');
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/(auth)/sign-in'); return; }
      setEmail(session.user.email ?? null);
      const p = await api.profile.get(session.access_token).catch(() => null);
      if (p) { setProfile(p); setCodePostal(p.codePostal ?? ''); }
    }
    load();
  }, []);

  async function handleSave() {
    if (!/^\d{5}$/.test(codePostal)) {
      Alert.alert('Code postal invalide', 'Veuillez entrer un code postal à 5 chiffres.');
      return;
    }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const updated = await api.profile.update(codePostal, session.access_token).catch((e: Error) => {
      Alert.alert('Erreur', e.message);
      return null;
    });
    if (updated) setProfile(updated);
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Mon profil</Text>
      {email && <Text style={styles.email}>{email}</Text>}

      <Text style={styles.label}>Code postal</Text>
      <TextInput
        style={styles.input}
        value={codePostal}
        onChangeText={setCodePostal}
        placeholder="75001"
        keyboardType="number-pad"
        maxLength={5}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f9fafb' },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  email: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#374151' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', marginBottom: 16 },
  button: { backgroundColor: '#1d4ed8', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  signOutButton: { padding: 14, alignItems: 'center' },
  signOutText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
});
