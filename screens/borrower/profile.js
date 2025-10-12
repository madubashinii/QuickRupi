import React, { useState, useEffect } from "react";
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

const ProfileScreen = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  // Fetch user info from Firestore
  const fetchUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
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
        } else if (data.personalDetails?.fullName) {
          fullName = data.personalDetails.fullName;
        } else if (data.fullName) {
          fullName = data.fullName;
        } else if (data.name) {
          fullName = data.name;
        } else if (user.email) {
          fullName = user.email.split('@')[0];
        }
        
        setUserData({
          name: fullName,
          email: user.email || data.email || 'N/A',
          nic: data.personalDetails?.nicNumber || data.nic || 'N/A',
          dob: data.personalDetails?.dateOfBirth || data.dob || 'N/A',
          address: data.personalDetails?.address || data.address || 'N/A',
          userId: user.uid.slice(0, 6).toUpperCase(),
          role: (data.role || 'borrower').toUpperCase()
        });
      } else {
        setUserData({
          name: user.email?.split('@')[0] || 'User',
          email: user.email || 'N/A',
          nic: 'N/A',
          dob: 'N/A',
          address: 'N/A',
          userId: user.uid.slice(0, 6).toUpperCase(),
          role: 'BORROWER'
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch user data.");
      setUserData({
        name: user.email?.split('@')[0] || 'User',
        email: user.email || 'N/A',
        nic: 'N/A',
        dob: 'N/A',
        address: 'N/A',
        userId: user.uid.slice(0, 6).toUpperCase(),
        role: 'BORROWER'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show("Permission needed: Please allow gallery access to choose a profile image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names.length >= 2
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

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
              const result = await logout();
              
              if (result.success) {
                // Navigation to LoginScreen will be handled automatically by AppNavigator
                // when the auth state changes (user becomes null)
              } else {
                setIsLoggingOut(false);
                Alert.alert('Logout Failed', result.error || 'Unable to logout. Please try again.');
              }
            } catch (error) {
              setIsLoggingOut(false);
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f3460" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : userData?.name ? (
            <View style={styles.initialsPlaceholder}>
              <Text style={styles.initialsText}>{getUserInitials(userData.name)}</Text>
            </View>
          ) : (
            <Ionicons name="person-outline" size={60} color="#777" />
          )}
        </TouchableOpacity>

        <Text style={styles.userName}>{userData?.name || "User Name"}</Text>
        <Text style={styles.subText}>Tap image to change your photo</Text>

        {/* Personal Info Display */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Email: {userData?.email || "N/A"}</Text>
          <Text style={styles.infoText}>NIC: {userData?.nic || "N/A"}</Text>
          <Text style={styles.infoText}>DOB: {userData?.dob || "N/A"}</Text>
          <Text style={styles.infoText}>Address: {userData?.address || "N/A"}</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("BorrowerViewKYC")}
        >
          <Ionicons name="document-text-outline" size={22} color="#fff" />
          <Text style={styles.actionButtonText}>Go to KYC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("ChatBot")}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
          <Text style={styles.actionButtonText}>ChatBot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.actionButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Overlay */}
      {isLoggingOut && (
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutCard}>
            <ActivityIndicator size="large" color="#0f3460" />
            <Text style={styles.logoutOverlayText}>Logging out...</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
  },
  profileSection: { alignItems: "center", width: "100%" },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: { width: "100%", height: "100%" },
  initialsPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0f3460",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: { fontSize: 40, color: "#fff", fontWeight: "700" },
  userName: { fontSize: 22, fontWeight: "600", marginTop: 15 },
  subText: { fontSize: 14, color: "#888", marginBottom: 20 },
  infoContainer: { marginVertical: 20, width: "100%" },
  infoText: { fontSize: 16, marginVertical: 4 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f3460",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 12,
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 12,
    shadowColor: "#dc3545",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  logoutOverlayText: {
    marginTop: 15,
    fontSize: 18,
    color: '#0f3460',
    fontWeight: '600',
  },
});

export default ProfileScreen;
