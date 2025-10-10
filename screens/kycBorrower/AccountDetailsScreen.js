import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { CheckBox } from "react-native-elements";

export default function AccountDetailsScreen({ navigation, route }) {
  const [account, setAccount] = useState({ 
    username: "", 
    password: "", 
    confirm: "", 
    accepted: false 
  });

  const handleChange = (key, value) => setAccount({ ...account, [key]: value });

  const handleSubmit = () => {
    if (!account.username || !account.password || !account.confirm) {
      alert("Please complete all account information.");
      return;
    }

    if (account.password !== account.confirm) {
      alert("Passwords do not match.");
      return;
    }

    if (!account.accepted) {
      alert("You must agree to the terms and conditions.");
      return;
    }

    console.log("All KYC data:", {
      ...route.params,
      accountData: account,
    });
    alert("KYC form submitted successfully!");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QuickRupi</Text>
        <Text style={styles.headerSubtitle}>New here? Sign up!</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Account Information</Text>

        <TextInput 
          placeholder="Username" 
          value={account.username}
          style={styles.input} 
          onChangeText={(t) => handleChange("username", t)}
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput 
          placeholder="Password" 
          value={account.password}
          secureTextEntry 
          style={styles.input} 
          onChangeText={(t) => handleChange("password", t)}
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput 
          placeholder="Confirm Password" 
          value={account.confirm}
          secureTextEntry 
          style={styles.input} 
          onChangeText={(t) => handleChange("confirm", t)}
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
        />

        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>BORROWER'S TERMS OF USE</Text>
          <ScrollView style={styles.termsScroll} nestedScrollEnabled={true}>
            <Text style={styles.termsText}>
              These Borrower terms and conditions apply to a user who wishes to register to obtain a loan through the app. 
              Please read carefully before acceptance. By using our services, you agree to comply with all applicable terms 
              and conditions. We reserve the right to modify these terms at any time. Continued use of the service constitutes 
              acceptance of the modified terms.
            </Text>
          </ScrollView>
          
          <CheckBox
            title="I have read and agree to the above Borrower T&C (as well as the General T&C & Privacy Policy)"
            checked={account.accepted}
            onPress={() => handleChange("accepted", !account.accepted)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    textAlign: "center",
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  termsContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    backgroundColor: colors.lightGray,
  },
  termsTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
    color: colors.text,
    textAlign: "center",
  },
  termsScroll: {
    maxHeight: 120,
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
    marginTop: 8,
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.text,
  },
  humanVerification: {
    textAlign: "center",
    marginVertical: 16,
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButtonText: {
    color: colors.white,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryText: {
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});