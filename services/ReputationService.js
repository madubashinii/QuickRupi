import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { REPUTATION_LEVELS, ACTION_POINTS } from '../utils/constants/reputation';

export class ReputationService {
  static async calculateRiskScore(userData) {
    let score = 500; // Base score
    
    // Positive factors
    if (userData.kycVerified) score += 200;
    if (userData.bankLinked) score += 150;
    if (userData.employmentVerified) score += 100;
    
    // Negative factors
    if (userData.latePayments > 0) score -= userData.latePayments * 50;
    if (userData.defaultedLoans > 0) score -= userData.defaultedLoans * 200;
    
    return Math.max(0, Math.min(1000, score));
  }

  static async updateReputation(uid, action) {
    const reputationDoc = await getDoc(doc(db, 'reputation', uid));
    const currentData = reputationDoc.exists() ? reputationDoc.data() : {
      score: 0,
      level: 0,
      badges: [],
      completedActions: [],
      createdAt: new Date()
    };

    const points = ACTION_POINTS[action] || 0;
    const newScore = currentData.score + points;
    
    // Calculate new level
    let newLevel = 0;
    for (let level in REPUTATION_LEVELS) {
      if (newScore >= REPUTATION_LEVELS[level].minScore) {
        newLevel = parseInt(level);
      }
    }

    // Check for new badges
    const newBadges = [...currentData.badges];
    if (newLevel > currentData.level) {
      const newBadge = REPUTATION_LEVELS[newLevel].badge;
      if (!newBadges.includes(newBadge)) {
        newBadges.push(newBadge);
      }
    }

    await setDoc(doc(db, 'reputation', uid), {
      score: newScore,
      level: newLevel,
      badges: newBadges,
      completedActions: arrayUnion(action),
      lastUpdated: new Date()
    }, { merge: true });

    return {
      score: newScore,
      level: newLevel,
      badges: newBadges,
      levelInfo: REPUTATION_LEVELS[newLevel]
    };
  }

  static async getUserReputation(uid) {
    const reputationDoc = await getDoc(doc(db, 'reputation', uid));
    
    if (!reputationDoc.exists()) {
      return {
        score: 0,
        level: 0,
        badges: [],
        levelInfo: REPUTATION_LEVELS[0]
      };
    }

    const data = reputationDoc.data();
    return {
      ...data,
      levelInfo: REPUTATION_LEVELS[data.level]
    };
  }
}