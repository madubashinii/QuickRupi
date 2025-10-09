import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, Image, Button, TouchableOpacity, StyleSheet, Platform 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-root-toast";
import { db } from "../../services/firebaseConfig";
import { collection, addDoc, getDocs, query } from "firebase/firestore";

const PaymentForm = () => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [image, setImage] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Fetch payment methods on mount
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const q = query(collection(db, "paymentMethods"));
        const snapshot = await getDocs(q);
        const methods = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPaymentMethods(methods);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        Toast.show("Failed to load payment methods", { duration: Toast.durations.LONG });
      }
    };

    fetchPaymentMethods();
  }, []);

  // Pick image from gallery
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show("Gallery access is required", { duration: Toast.durations.LONG });
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

  // Save payment info
  const savePayment = async () => {
    // Check if method matches existing one
    const matchedMethod = paymentMethods.find(m => m.type.toLowerCase() === paymentMethod.toLowerCase());

    try {
      await addDoc(collection(db, "repayments"), {
        amount: paymentAmount,
        paidAt: paymentDate,
        method: paymentMethod,
        matchedMethodId: matchedMethod ? matchedMethod.id : null,
        imageUri: image,
        createdAt: new Date(),
      });

      Toast.show("Payment saved successfully!", { duration: Toast.durations.SHORT });

      // Reset form
      setPaymentAmount("");
      setPaymentMethod("");
      setImage(null);
    } catch (error) {
      console.error("Error saving payment:", error);
      Toast.show("Failed to save payment", { duration: Toast.durations.LONG });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Payment Form</Text>

      {/* Amount */}
      <TextInput
        placeholder="Payment Amount"
        keyboardType="numeric"
        value={paymentAmount}
        onChangeText={setPaymentAmount}
        style={styles.input}
      />

      {/* Date */}
      <TextInput
        placeholder="Payment Date (YYYY-MM-DD)"
        value={paymentDate}
        onChangeText={setPaymentDate}
        style={styles.input}
      />

      {/* Payment Method */}
      <TextInput
        placeholder="Payment Method"
        value={paymentMethod}
        onChangeText={setPaymentMethod}
        style={styles.input}
      />
      {paymentMethod.length > 0 && (
        <Text style={styles.helperText}>
          {paymentMethods.some(m => m.type.toLowerCase() === paymentMethod.toLowerCase())
            ? "Matched existing method"
            : "New/other method"}
        </Text>
      )}

      {/* Image Picker */}
      <Button title="Pick an image from gallery" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}

      {/* Save Button */}
      <View style={{ marginTop: 20 }}>
        <Button title="Save Payment" onPress={savePayment} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  text: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: "100%",
    padding: 10,
    marginVertical: 8,
  },
  image: { width: 200, height: 200, marginTop: 10, borderRadius: 10 },
  helperText: { fontSize: 12, color: "#555", marginBottom: 5 },
});

export default PaymentForm;
