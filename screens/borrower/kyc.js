import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, ScrollView, Image,TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db } from "../../services/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import Toast from "react-native-root-toast";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const KYCForm = () => {
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const navigation = useNavigation();

  const pickImage = async (setImage) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show("Permission denied", "Please allow gallery access.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const submitKYC = async () => {
    if (!fullName || !email || !phone || !frontImage || !backImage) {
      Toast.show("Error", "Please fill all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "kyc"), {
        fullName,
        businessName,
        city,
        dateOfBirth: new Date(dateOfBirth),
        email,
        phone,
        occupation,
        monthlyIncome,
        identityProofFront: frontImage,
        identityProofBack: backImage,
        kycStatus: "pending",
        submittedAt: new Date(),
        user: "B001", // replace with current userId
      });

      Toast.show("Success", "KYC submitted successfully!");
      // Reset form
      setFullName(""); setBusinessName(""); setCity(""); setDateOfBirth("");
      setEmail(""); setPhone(""); setOccupation(""); setMonthlyIncome("");
      setFrontImage(null); setBackImage(null);
    } catch (error) {
      console.error("Error submitting KYC:", error);
      Toast.show("Error", "Failed to submit KYC.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
                 style={styles.kycButton}
                 onPress={() => navigation.navigate("BorrowerProfile")}
              >
                <Ionicons name="chevron-back" size={28} color="#000" />
                <Text style={styles.kycButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>KYC Form</Text>

      <TextInput placeholder="Full Name" value={fullName} onChangeText={setFullName} style={styles.input} />
      <TextInput placeholder="Business Name" value={businessName} onChangeText={setBusinessName} style={styles.input} />
      <TextInput placeholder="City" value={city} onChangeText={setCity} style={styles.input} />
      <TextInput placeholder="Date of Birth (YYYY-MM-DD)" value={dateOfBirth} onChangeText={setDateOfBirth} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Occupation" value={occupation} onChangeText={setOccupation} style={styles.input} />
      <TextInput placeholder="Monthly Income" value={monthlyIncome} onChangeText={setMonthlyIncome} style={styles.input} keyboardType="numeric" />

      <Button title="Pick Front ID Image" onPress={() => pickImage(setFrontImage)} />
      {frontImage && <Image source={{ uri: frontImage }} style={styles.image} />}
      <Button title="Pick Back ID Image" onPress={() => pickImage(setBackImage)} />
      {backImage && <Image source={{ uri: backImage }} style={styles.image} />}

      <View style={{ marginTop: 20 }}>
        <Button title="Submit KYC" onPress={submitKYC} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  image: { width: "100%", height: 200, marginVertical: 10, borderRadius: 8 },
});

export default KYCForm;
