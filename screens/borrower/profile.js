import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState("John Doe"); // for testing
  const [user, setUser] = useState([]);
  const navigation = useNavigation();
  const fixedUserId = "B001";

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show("Permission needed", "Please allow gallery access to choose a profile image.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // square crop
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }

    UseEffect(()=>{
      const fetchRecords = async () => {
            try {
              const q = query(
                collection(db, "user"),
                where("userId", "==", fixedUserId) // replace later
              );
              const snapshot = await getDocs(q);
              const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              setRecords(data);
            } catch (error) {
              console.error("Error fetching payment records:", error);
            } finally {
              setLoading(false);
            }
          };
      
          fetchRecords();}
    );
  };

  return (
    <View style={styles.container}> 
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="person-outline" size={60} color="#777" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.subText}>Tap image to change your photo</Text>
        <Text style={styles.texts}>{userName}</Text>
        <Text style={styles.texts}>{userName}</Text>
        <Text style={styles.texts}>{userName}</Text>

        <TouchableOpacity
          style={styles.kycButton}
          onPress={() => navigation.navigate("BorrowerViewKYC")} 
        >
          <Ionicons name="document-text-outline" size={22} color="#fff" />
          <Text style={styles.kycButtonText}>Go to KYC</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.kycButton}
            onPress={() => navigation.navigate("ChatBot")}
             >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
          <Text style={styles.kycButtonText}>ChatBot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  profileSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 15,
  },
  texts: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 15,
  },
  subText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
});
export default ProfileScreen;