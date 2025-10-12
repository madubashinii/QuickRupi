import React, { useState, useEffect } from "react";
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const ProfileScreen = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fixedUserId = "B001"; // For demo, replace with auth.currentUser.uid in production

  // Fetch user info from Firestore
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "user"), where("userId", "==", fixedUserId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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
      </View>
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
});

export default ProfileScreen;
