import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { ROLES, PERMISSIONS } from '../utils/constants/roles';

export class RBACService {
  static async getUserRole(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data().role : ROLES.BORROWER;
    } catch (error) {
      console.error('Error getting user role:', error);
      return ROLES.BORROWER;
    }
  }

  static async setUserRole(uid, role) {
    if (!Object.values(ROLES).includes(role)) {
      throw new Error('Invalid role');
    }
    await setDoc(doc(db, 'users', uid), { role }, { merge: true });
  }

  static hasPermission(role, permission) {
    return PERMISSIONS[role]?.includes(permission) || false;
  }

  static async canAccess(uid, permission) {
    const role = await this.getUserRole(uid);
    return this.hasPermission(role, permission);
  }

  // Route guard for navigation
  static createRouteGuard(requiredPermission) {
    return async (navigation) => {
      const user = auth.currentUser;
      if (!user) {
        navigation.replace('Login');
        return false;
      }

      const hasAccess = await this.canAccess(user.uid, requiredPermission);
      if (!hasAccess) {
        navigation.replace('AccessDenied');
        return false;
      }

      return true;
    };
  }
}