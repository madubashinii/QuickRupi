import React, { useState } from "react";
import { auth } from "../../services/firebaseConfig";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from '../../theme/colors';

export default function PersonalDetails({ navigation }) {
  const [form, setForm] = useState({
    title: "",
    firstName: "",
    lastName: "",
    nameWithInitials: "",
    nicNumber: "",
    dateOfBirth: "",
    gender: "",
  });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleNext = () => {
    if (!form.title || !form.firstName || !form.lastName || !form.nicNumber || !form.dateOfBirth || !form.gender) {
      Alert.alert("Error", "Please complete all required fields.");
      return;
    }

    // Pass data to next screen instead of saving to Firestore
    navigation.navigate("ContactDetails", { personalData: form });
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
            <Picker.Item label="Mr" value="Mr" />
            <Picker.Item label="Mrs" value="Mrs" />
            <Picker.Item label="Ms" value="Ms" />
            <Picker.Item label="Dr" value="Dr" />
          </Picker>
        </View>

        <Text style={styles.label}>First Name</Text>
        <TextInput
          placeholder="First Name"
          value={form.firstName}
          onChangeText={(t) => handleChange("firstName", t)}
          style={styles.input}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          placeholder="Last Name"
          value={form.lastName}
          onChangeText={(t) => handleChange("lastName", t)}
          style={styles.input}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Name with Initials</Text>
        <TextInput
          placeholder="Name with Initials"
          value={form.nameWithInitials}
          onChangeText={(t) => handleChange("nameWithInitials", t)}
          style={styles.input}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>NIC Number</Text>
        <TextInput
          placeholder="NIC Number"
          value={form.nicNumber}
          onChangeText={(t) => handleChange("nicNumber", t)}
          style={styles.input}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          placeholder="mm/dd/yyyy"
          value={form.dateOfBirth}
          onChangeText={(t) => handleChange("dateOfBirth", t)}
          style={styles.input}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Select Gender</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.gender}
            onValueChange={(v) => handleChange("gender", v)}
            style={styles.picker}
          >
            <Picker.Item label="Please select your gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
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
  nextButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  nextButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
});