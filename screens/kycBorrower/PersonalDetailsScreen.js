import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function PersonalDetailsScreen({ navigation }) {
  const [form, setForm] = useState({
    title: "",
    firstName: "",
    lastName: "",
    initials: "",
    address: "",
    mobile: "",
    telephone: "",
    email: "",
    nic: "",
    dob: "",
    gender: "",
  });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleNext = () => {
    // Basic validation
    if (!form.title || !form.firstName || !form.lastName || !form.nic || !form.dob || !form.gender) {
      alert("Please complete all required fields.");
      return;
    }
    navigation.navigate("LoanDetailsScreen", { personalData: form });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QuickRupi</Text>
        <Text style={styles.headerSubtitle}>New here? Sign up!</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Personal Details</Text>

        <Text style={styles.label}>Title</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.title}
            onValueChange={(v) => handleChange("title", v)}
            style={styles.picker}
          >
            <Picker.Item label="Please select your title" value="" />
            <Picker.Item label="Mr." value="Mr." />
            <Picker.Item label="Ms." value="Ms." />
            <Picker.Item label="Mrs." value="Mrs." />
            <Picker.Item label="Dr." value="Dr." />
          </Picker>
        </View>

        <TextInput 
          placeholder="First Name" 
          value={form.firstName}
          style={styles.input} 
          onChangeText={(t) => handleChange("firstName", t)}
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput 
          placeholder="Last Name" 
          value={form.lastName}
          style={styles.input} 
          onChangeText={(t) => handleChange("lastName", t)}
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput 
          placeholder="Name with Initials" 
          value={form.initials}
          style={styles.input} 
          onChangeText={(t) => handleChange("initials", t)}
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput 
          placeholder="Permanent Address" 
          value={form.address}
          style={[styles.input, styles.textArea]} 
          onChangeText={(t) => handleChange("address", t)}
          multiline
          numberOfLines={3}
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput 
          placeholder="Mobile Number" 
          value={form.mobile}
          keyboardType="phone-pad" 
          style={styles.input} 
          onChangeText={(t) => handleChange("mobile", t)}
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput 
          placeholder="Telephone Number" 
          value={form.telephone}
          keyboardType="phone-pad" 
          style={styles.input} 
          onChangeText={(t) => handleChange("telephone", t)}
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput 
          placeholder="Email Address" 
          value={form.email}
          keyboardType="email-address" 
          style={styles.input} 
          onChangeText={(t) => handleChange("email", t)}
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput 
          placeholder="NIC Number" 
          value={form.nic}
          style={styles.input} 
          onChangeText={(t) => handleChange("nic", t)}
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput 
          placeholder="Date of Birth (mm/dd/yyyy)" 
          value={form.dob}
          style={styles.input} 
          onChangeText={(t) => handleChange("dob", t)}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.gender}
            onValueChange={(v) => handleChange("gender", v)}
            style={styles.picker}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>NEXT STEP</Text>
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  button: { 
    backgroundColor: colors.primary, 
    padding: 16, 
    borderRadius: 8, 
    marginTop: 20 
  },
  buttonText: { 
    color: colors.white, 
    textAlign: "center", 
    fontWeight: "bold",
    fontSize: 16
  },
});