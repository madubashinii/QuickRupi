import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from '../../theme/colors';
import { validatePersonalDetails, validateField } from '../../utils/validation';

export default function PersonalDetailsScreen({ navigation }) {
  const [form, setForm] = useState({
    title: "",
    firstName: "",
    lastName: "",
    initials: "",
    address: "",
    mobile: "",
    email: "",
    nic: "",
    dob: "",
    gender: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const titles = ["Mr.", "Mrs.", "Ms.", "Dr."];
  const genders = ["Male", "Female", "Other"];

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    // Clear field error when user types
    if (fieldErrors[key]) {
      setFieldErrors({ ...fieldErrors, [key]: '' });
    }
  };

  const validateAndSetField = (key, value) => {
    handleChange(key, value);
    const errors = validateField(key, value, form);
    setFieldErrors({ ...fieldErrors, ...errors });
  };

  const handleNext = () => {
    const errors = validatePersonalDetails(form);
    
    if (errors.length > 0) {
      Alert.alert("Please Complete All Fields", errors.join('\n• '));
      return;
    }

    // Pass data to next screen
    navigation.navigate("AccountDetailsScreen", { personalData: form });
  };

  return (
    <LinearGradient
      colors={[colors.babyBlue, colors.lightGray, colors.white]}
      style={styles.container}
    >
      <StatusBar backgroundColor={colors.tealGreen} barStyle="light-content" />

      <LinearGradient
        colors={[colors.tealGreen, colors.midnightBlue]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.getParent()?.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QuickRupi</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.headerSubtitle}>Borrower Registration</Text>
        <View style={styles.progress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 2</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Ionicons name="person-outline" size={28} color={colors.tealGreen} />
          <Text style={styles.screenTitle}>Personal Details</Text>
        </View>
        <Text style={styles.subtitle}>Tell us about yourself</Text>

        <View style={styles.card}>

          <Text style={styles.cardTitle}>Basic Information</Text>
          <Text style={styles.label}>Title *</Text>
          <View style={styles.buttonRow}>
            {titles.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.optionButton, form.title === item && styles.optionButtonActive]}
                onPress={() => handleChange("title", item)}
              >
                <Text style={[styles.optionText, form.title === item && styles.optionTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>First Name *</Text>
        <TextInput
          placeholder="Enter your first name"
          placeholderTextColor="#7a9c9c"
          value={form.firstName}
          style={[styles.input, fieldErrors.firstName && styles.inputError]}
          onChangeText={(t) => validateAndSetField("firstName", t)}
        />
        {fieldErrors.firstName && <Text style={styles.errorText}>{fieldErrors.firstName}</Text>}

        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          placeholder="Enter your last name"
          placeholderTextColor="#7a9c9c"
          value={form.lastName}
          style={[styles.input, fieldErrors.lastName && styles.inputError]}
          onChangeText={(t) => validateAndSetField("lastName", t)}
        />
        {fieldErrors.lastName && <Text style={styles.errorText}>{fieldErrors.lastName}</Text>}

          <Text style={styles.label}>Name with Initials</Text>
          <TextInput
            placeholder="Enter your name with initials"
            placeholderTextColor={colors.gray}
            value={form.initials}
            style={styles.input}
            onChangeText={(t) => handleChange("initials", t)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
            <Text style={styles.label}>Permanent Address *</Text>
          <TextInput
            placeholder="Enter your permanent address"
            placeholderTextColor={colors.gray}
            value={form.address}
            style={[styles.input, styles.textArea]}
            onChangeText={(t) => handleChange("address", t)}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput
            placeholder="Enter your mobile number"
            placeholderTextColor={colors.gray}
            value={form.mobile}
            keyboardType="phone-pad"
            style={[styles.input, fieldErrors.mobile && styles.inputError]}
            onChangeText={(t) => validateAndSetField("mobile", t)}
          />
          {fieldErrors.mobile && <Text style={styles.errorText}>{fieldErrors.mobile}</Text>}

          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            placeholder="Enter your email address"
            placeholderTextColor={colors.gray}
            value={form.email}
            keyboardType="email-address"
            style={[styles.input, fieldErrors.email && styles.inputError]}
            onChangeText={(t) => validateAndSetField("email", t)}
            autoCapitalize="none"
          />
          {fieldErrors.email && <Text style={styles.errorText}>{fieldErrors.email}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Identity Information</Text>
            <Text style={styles.label}>NIC Number *</Text>
          <TextInput
            placeholder="Enter your NIC number"
            placeholderTextColor={colors.gray}
            value={form.nic}
            style={[styles.input, fieldErrors.nic && styles.inputError]}
            onChangeText={(t) => validateAndSetField("nic", t)}
          />
          {fieldErrors.nic && <Text style={styles.errorText}>{fieldErrors.nic}</Text>}

          <Text style={styles.label}>Date of Birth *</Text>
          <TextInput
            placeholder="mm/dd/yyyy"
            placeholderTextColor={colors.gray}
            value={form.dob}
            style={styles.input}
            onChangeText={(t) => handleChange("dob", t)}
          />

          <Text style={styles.label}>Gender *</Text>
          <View style={styles.buttonRow}>
            {genders.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.optionButton, form.gender === item.toLowerCase() && styles.optionButtonActive]}
                onPress={() => handleChange("gender", item.toLowerCase())}
              >
                <Text style={[styles.optionText, form.gender === item.toLowerCase() && styles.optionTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.footer}> All information is encrypted and secure</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.white,
    textAlign: "center",
    opacity: 0.95,
    marginBottom: 10,
  },
  progress: { marginTop: 6 },
  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1.5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.white, borderRadius: 1.5 },
  progressText: { fontSize: 10, color: colors.white, textAlign: 'center', marginTop: 4, opacity: 0.9 },
  content: { flex: 1 },
  scroll: { padding: 14, paddingBottom: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.deepForestGreen,
  },
  subtitle: { fontSize: 12, color: colors.gray, marginBottom: 14, fontStyle: 'italic' },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.tealGreen, marginBottom: 10 },
  label: { fontSize: 12, fontWeight: "600", color: colors.forestGreen, marginBottom: 6, marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.tiffanyBlue,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    color: colors.deepForestGreen,
    marginBottom: 6,
  },
  textArea: { height: 65, textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6, gap: 6 },
  optionButton: {
    borderWidth: 1,
    borderColor: colors.tiffanyBlue,
    backgroundColor: colors.babyBlue,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 65,
    alignItems: 'center',
  },
  optionButtonActive: { backgroundColor: colors.tealGreen, borderColor: colors.tealGreen },
  optionText: { fontSize: 13, color: colors.forestGreen, fontWeight: '600' },
  optionTextActive: { color: colors.white, fontWeight: '700' },
  button: {
    backgroundColor: colors.tealGreen,
    flexDirection: 'row',
    padding: 11,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8,
    gap: 6,
    shadowColor: colors.tealGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  inputError: { borderColor: colors.red, backgroundColor: '#fdf2f2' },
  errorText: { color: colors.red, fontSize: 10, marginTop: -2, marginBottom: 6, fontStyle: 'italic' },
  footer: { fontSize: 11, color: colors.gray, textAlign: 'center', marginTop: 8, marginBottom: 16, fontStyle: 'italic' },
});