import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { CheckBox } from "react-native-elements";
import { auth } from "../../services/firebaseConfig";
import { updateLenderDoc } from "../../services/firestoreService";

export default function AccountInformation({ navigation }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    accepted: false
  });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) { 
      Alert.alert("Error", "Not logged in"); 
      navigation.replace("Login"); 
      return; 
    }
    
    if (!form.username || !form.password || !form.confirmPassword) {
      Alert.alert("Error", "Please complete all account information.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (!form.accepted) {
      Alert.alert("Error", "You must agree to the terms and conditions.");
      return;
    }

    try {
      await updateLenderDoc(user.uid, {
        accountInformation: {
          username: form.username,
          termsAccepted: true
        },
        kycStep: 6,
        kycCompleted: true,
        kycStatus: "completed"
      });

      Alert.alert("Success", "KYC process completed successfully!");
      navigation.replace("Dashboard");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to complete KYC process.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Account Information</Text>

      <TextInput 
        placeholder="Username" 
        value={form.username}
        style={styles.input} 
        onChangeText={(t) => handleChange("username", t)}
        autoCapitalize="none"
      />
      
      <TextInput 
        placeholder="Password" 
        value={form.password}
        style={styles.input} 
        onChangeText={(t) => handleChange("password", t)}
        secureTextEntry
        autoCapitalize="none"
      />
      
      <TextInput 
        placeholder="Confirm Password" 
        value={form.confirmPassword}
        style={styles.input} 
        onChangeText={(t) => handleChange("confirmPassword", t)}
        secureTextEntry
        autoCapitalize="none"
      />

      <View style={styles.termsBox}>
        <Text style={styles.termsTitle}>LENDER'S TERMS OF USE</Text>
        <ScrollView style={styles.termsScroll} nestedScrollEnabled={true}>
          <Text style={styles.termsText}>
            These tender terms and conditions apply to a user who wishes to register to lend through the site (i.e. a 'tender').  
            A tender is at all times subject to the specific 'tender terms and conditions' set out below ('Lender T&C'), which are deemed part and parcel of the Terms and Conditions as applicable to him (which include the Privacy Policy (accessed by clicking here) and the General T&C (accessed by clicking here)). In the event of any conflict between the tender T&C and the other applicable components of the Terms and Conditions, the tender T&C shall prevail.
            Please read these Lender T&C carefully. They impose contractual obligations which are binding and enforceable in law, and as such, should be carefully assessed before acceptance. By clicking 'I Accept'
          </Text>
        </ScrollView>
        
        <CheckBox
          title="I have read and agree to the above Lender T&C (as well as the General T&C & Privacy Policy)"
          checked={form.accepted}
          onPress={() => handleChange("accepted", !form.accepted)}
          containerStyle={styles.checkboxContainer}
          textStyle={styles.checkboxText}
          checkedColor={colors.primary}
        />
      </View>

      <Text style={styles.humanVerification}>Confirm that you are human</Text>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>SUBMIT</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryText}>PREVIOUS</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20,
    backgroundColor: colors.background 
  },
  header: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 20,
    color: colors.text,
    textAlign: "center"
  },
  input: { 
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: 8, 
    padding: 12, 
    marginVertical: 5,
    fontSize: 16,
    backgroundColor: colors.white
  },
  termsBox: { 
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: 8, 
    padding: 15, 
    marginVertical: 10 
  },
  termsTitle: { 
    fontWeight: "bold", 
    marginBottom: 10,
    color: colors.text,
    fontSize: 16
  },
  termsScroll: { 
    maxHeight: 150,
    marginBottom: 10
  },
  termsText: { 
    fontSize: 14, 
    color: colors.textLight,
    lineHeight: 20
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
    marginTop: 10,
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.text,
  },
  humanVerification: { 
    textAlign: "center", 
    marginVertical: 15, 
    fontSize: 14, 
    color: colors.textLight,
    fontStyle: 'italic'
  },
  submitButton: { 
    backgroundColor: colors.success, 
    padding: 15, 
    borderRadius: 10, 
    marginTop: 10 
  },
  submitButtonText: { 
    color: colors.white, 
    textAlign: "center", 
    fontWeight: "bold",
    fontSize: 16
  },
  secondaryButton: { 
    backgroundColor: colors.gray, 
    padding: 15, 
    borderRadius: 10, 
    marginTop: 10 
  },
  secondaryText: { 
    textAlign: "center", 
    color: colors.text,
    fontSize: 16
  },
});