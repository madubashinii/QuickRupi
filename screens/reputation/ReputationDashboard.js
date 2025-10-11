import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { auth, db } from "../../services/firebaseConfig";
import { ReputationService } from '../../services/ReputationService';
import { colors } from '../../theme/colors';

export default function ReputationDashboard() {
  const [reputation, setReputation] = useState(null);

  useEffect(() => {
    loadReputation();
  }, []);

  const loadReputation = async () => {
    const user = auth.currentUser;
    if (user) {
      const repData = await ReputationService.getUserReputation(user.uid);
      setReputation(repData);
    }
  };

  if (!reputation) return <View><Text>Loading...</Text></View>;

  const progress = (reputation.score / 1000) * 100;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Trust & Reputation</Text>
      
      <View style={styles.scoreCard}>
        <Text style={styles.score}>{reputation.score}</Text>
        <Text style={styles.scoreLabel}>Reputation Score</Text>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        
        <Text style={styles.level}>Level {reputation.level}: {reputation.levelInfo.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgesContainer}>
          {reputation.badges.map((badge, index) => (
            <Text key={index} style={styles.badge}>{badge}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: colors.text },
  scoreCard: { backgroundColor: colors.white, padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  score: { fontSize: 48, fontWeight: 'bold', color: colors.primary },
  scoreLabel: { fontSize: 16, color: colors.textLight, marginBottom: 15 },
  progressBar: { width: '100%', height: 8, backgroundColor: colors.lightGray, borderRadius: 4, marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 4 },
  level: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  section: { backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: colors.text },
  badgesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  badge: { fontSize: 30, margin: 5 },
});