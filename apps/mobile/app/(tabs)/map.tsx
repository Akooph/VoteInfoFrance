import { View, Text, StyleSheet } from 'react-native';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Carte de France</Text>
      <Text style={styles.body}>
        Sélectionnez une proposition depuis Actualités pour visualiser
        les résultats par département sur la carte interactive.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f9fafb' },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22 },
});
