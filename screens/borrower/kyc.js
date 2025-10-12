import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db } from "../../services/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Toast from "react-native-root-toast";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const KYCForm = () => {
  const navigation = useNavigation();

  // Form states
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const userId = "B001"; // Replace with auth.currentUser.uid in production

  // Image picker
  const pickImage = async (setImage) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show("Please allow gallery access to upload ID images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Submit KYC
  const submitKYC = async () => {
    if (!fullName || !email || !phone || !frontImage || !backImage) {
      Toast.show("Please fill all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "kyc"), {
        userId,
        fullName,
        businessName,
        city,
        postalCode,
        dateOfBirth,
        email,
        phone,
        occupation,
        monthlyIncome,
        employerName,
        identityProofFront: frontImage ? "uploaded" : null,
        identityProofBack: backImage ? "uploaded" : null,
        kycStatus: "pending",
        submittedAt: serverTimestamp(),
      });

      Toast.show("KYC submitted successfully!");

      // Reset form
      setFullName("");
      setBusinessName("");
      setCity("");
      setPostalCode("");
      setDateOfBirth("");
      setEmail("");
      setPhone("");
      setOccupation("");
      setMonthlyIncome("");
      setEmployerName("");
      setFrontImage(null);
      setBackImage(null);
    } catch (error) {
      console.error("Error submitting KYC:", error);
      Toast.show("Failed to submit KYC.");
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("BorrowerProfile")}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>KYC Form</Text>

      {/* Form Fields */}
      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />
      <TextInput
        placeholder="Business Name"
        value={businessName}
        onChangeText={setBusinessName}
        style={styles.input}
      />
      <TextInput
        placeholder="City"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />
      <TextInput
        placeholder="Postal Code"
        value={postalCode}
        onChangeText={setPostalCode}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Occupation"
        value={occupation}
        onChangeText={setOccupation}
        style={styles.input}
      />
      <TextInput
        placeholder="Monthly Income (LKR)"
        value={monthlyIncome}
        onChangeText={setMonthlyIncome}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Employer Name (optional)"
        value={employerName}
        onChangeText={setEmployerName}
        style={styles.input}
      />

      {/* Image Pickers */}
      <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(setFrontImage)}>
        <Text style={styles.imageButtonText}>Pick Front ID Image</Text>
      </TouchableOpacity>
      {frontImage && <Image source={{ uri: frontImage }} style={styles.image} />}

      <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(setBackImage)}>
        <Text style={styles.imageButtonText}>Pick Back ID Image</Text>
      </TouchableOpacity>
      {backImage && <Image source={{ uri: backImage }} style={styles.image} />}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={submitKYC}>
        <Text style={styles.submitButtonText}>Submit KYC</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#e6f8f9" },
  contentContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#045d56" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  image: { width: "100%", height: 200, marginVertical: 10, borderRadius: 12 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ade80",
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  backButtonText: { fontSize: 16, marginLeft: 5, fontWeight: "600", color: "#000" },
  imageButton: {
    backgroundColor: "#4ade80",
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  imageButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
  submitButton: {
    backgroundColor: "#4ade80",
    padding: 14,
    borderRadius: 12,
    marginVertical: 20,
    alignItems: "center",
  },
  submitButtonText: { color: "#000", fontSize: 18, fontWeight: "700" },
});

export default KYCForm;
