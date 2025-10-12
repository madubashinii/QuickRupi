import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import AnimatedScreen from '../../components/lender/AnimatedScreen';
import PaymentMethodsModal from '../../components/lender/PaymentMethodsModal';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Configuration
const CONFIG = {
  BACKGROUND_HEIGHT: 400,
  SETTINGS: [
    { id: 1, title: 'Personal Information', icon: 'person-outline' },
    { id: 2, title: 'Manage Payment Methods', icon: 'card-outline' },
    { id: 3, title: 'Push notifications', icon: 'notifications-outline' },
    { id: 4, title: 'Security', icon: 'shield-checkmark-outline' },
    { id: 5, title: 'Other settings', icon: 'settings-outline' },
    { id: 6, title: 'Rewards', icon: 'gift-outline' },
    { id: 7, title: 'Language', subtitle: 'English', icon: 'language-outline' },
    { id: 8, title: 'Agreements & Legal', icon: 'document-text-outline' },
    { id: 9, title: 'Help', icon: 'help-circle-outline' },
  ]
};

// Event Handlers
const useProfileHandlers = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              console.log('Starting logout process...');
              const result = await logout();
              
              if (result.success) {
                console.log('Logout successful - redirecting to LoginScreen');
                // Navigation to LoginScreen will be handled automatically by AppNavigator
                // when the auth state changes (user becomes null)
                // The AppNavigator's onAuthStateChanged will detect this and show AuthStack
              } else {
                setIsLoggingOut(false);
                Alert.alert('Logout Failed', result.error || 'Unable to logout. Please try again.');
              }
            } catch (error) {
              setIsLoggingOut(false);
              console.error('Logout error:', error);
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  return {
    handleSettingPress: (title) => {
      if (title === 'Manage Payment Methods') {
        setShowPaymentModal(true);
      } else {
        console.log(`Pressed: ${title}`);
      }
    },
    handleLogout,
    handleChatSupport: () => console.log('Chat support pressed'),
    showPaymentModal,
    setShowPaymentModal,
    isLoggingOut,
  };
};

const Profile = () => {
  const { handleSettingPress, handleLogout, handleChatSupport, showPaymentModal, setShowPaymentModal, isLoggingOut } = useProfileHandlers();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Check multiple possible locations for firstName and lastName
            let firstName = data.firstName || 
                          data.personalDetails?.firstName || 
                          data.contactDetails?.firstName || '';
                          
            let lastName = data.lastName || 
                         data.personalDetails?.lastName || 
                         data.contactDetails?.lastName || '';
            
            // Construct full name
            let fullName = 'User';
            if (firstName && lastName) {
              fullName = `${firstName} ${lastName}`;
            } else if (firstName) {
              fullName = firstName;
            } else if (lastName) {
              fullName = lastName;
            } else if (data.personalDetails?.nameWithInitials) {
              fullName = data.personalDetails.nameWithInitials;
            } else if (data.fullName) {
              fullName = data.fullName;
            } else if (data.name) {
              fullName = data.name;
            } else if (user.email) {
              // Last resort: use email username
              fullName = user.email.split('@')[0];
            }
            
            setUserData({
              name: fullName,
              id: user.uid.slice(0, 6).toUpperCase(),
              email: user.email,
              role: (data.role || 'lender').toUpperCase(),
              firstName: firstName,
              lastName: lastName,
              fullData: data
            });
          } else {
            setUserData({
              name: user.email?.split('@')[0] || 'User',
              id: user.uid.slice(0, 6).toUpperCase(),
              email: user.email,
              role: 'LENDER'
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user data
          setUserData({
            name: user.email?.split('@')[0] || 'User',
            id: user.uid.slice(0, 6).toUpperCase(),
            email: user.email,
            role: 'LENDER'
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <AnimatedScreen style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.blueGreen} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderSection />
        <UserInfoCard userData={userData} />
        <SettingsList settings={CONFIG.SETTINGS} onPress={handleSettingPress} />
        <FooterSection onLogout={handleLogout} />
      </ScrollView>
      <FloatingChatButton onPress={handleChatSupport} />
      <PaymentMethodsModal 
        visible={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
      
      {/* Logout Overlay */}
      {isLoggingOut && (
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutCard}>
            <ActivityIndicator size="large" color={colors.blueGreen} />
            <Text style={styles.logoutOverlayText}>Logging out...</Text>
          </View>
        </View>
      )}
    </AnimatedScreen>
  );
};

// Components
const HeaderSection = () => (
  <View style={styles.backgroundSection}>
    <Image source={require('../../assets/lender/profile.png')} style={styles.backgroundImage} resizeMode="cover" />
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Profile</Text>
    </View>
  </View>
);

const UserInfoCard = ({ userData }) => (
  <View style={styles.userInfoCard}>
    <View style={styles.profileImageContainer}>
      <View style={styles.profileImageBorder}>
        <View style={styles.profileImage}>
          <Ionicons name="person" size={30} color={colors.white} />
        </View>
      </View>
    </View>
    <View style={styles.userDetails}>
      <Text style={styles.userName}>Hello, {userData.name}</Text>
      <Text style={styles.userId}>User ID : {userData.id}</Text>
      <Text style={styles.userRole}>{userData.role}</Text>
    </View>
  </View>
);

const SettingItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.settingCard} onPress={() => onPress(item.title)} activeOpacity={0.7}>
    <View style={styles.settingLeft}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={item.icon} size={20} color={colors.midnightBlue} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && <Text style={styles.settingSubtitle}>{item.subtitle}</Text>}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.gray} />
  </TouchableOpacity>
);

const SettingsList = ({ settings, onPress }) => (
  <View style={styles.settingsContainer}>
    {settings.map((item) => <SettingItem key={item.id} item={item} onPress={onPress} />)}
  </View>
);

const FooterSection = ({ onLogout }) => (
  <View style={styles.footer}>
    <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
      <Ionicons name="log-out-outline" size={20} color={colors.white} />
      <Text style={styles.logoutText}>Log out</Text>
    </TouchableOpacity>
  </View>
);

const FloatingChatButton = ({ onPress }) => (
  <TouchableOpacity style={styles.floatingChatButton} onPress={onPress} activeOpacity={0.7}>
    <Image source={require('../../assets/lender/chatbot.png')} style={styles.chatbotImage} resizeMode="contain" />
  </TouchableOpacity>
);


// Shared Styles
const cardStyle = {
  backgroundColor: colors.white,
  borderRadius: borderRadius.lg,
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
};

const centerContent = {
  justifyContent: 'center',
  alignItems: 'center',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBlue,
  },
  
  // Header
  backgroundSection: {
    height: CONFIG.BACKGROUND_HEIGHT,
    position: 'relative',
    backgroundColor: colors.babyBlue,
  },
  backgroundImage: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    width: '100%',
    height: '70%',
    opacity: 0.4,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  
  // User Info Card
  userInfoCard: {
    marginHorizontal: spacing.lg,
    marginTop: -200,
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    ...cardStyle,
  },
  profileImageContainer: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
  },
  profileImageBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFB6C1',
    borderWidth: 4,
    borderColor: colors.white,
    ...centerContent,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.midnightBlue,
    ...centerContent,
  },
  userDetails: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  userName: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  userId: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  userRole: {
    fontSize: fontSize.sm,
    color: colors.blueGreen,
    textAlign: 'center',
  },
  
  // Settings
  settingsContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  settingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.babyBlue,
    marginRight: spacing.md,
    ...centerContent,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  logoutButton: {
    backgroundColor: colors.red,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    elevation: 3,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    minWidth: 120,
    ...centerContent,
  },
  logoutText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: '600',
  },
  
  // Floating Chat Button
  floatingChatButton: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.blueGreen,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    ...centerContent,
  },
  chatbotImage: {
    width: 40,
    height: 40,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '500',
  },
  
  // Logout Overlay
  logoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  logoutCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  logoutOverlayText: {
    marginTop: spacing.md,
    fontSize: fontSize.lg,
    color: colors.midnightBlue,
    fontWeight: '600',
  },
});

export default Profile;
