import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert } from "react-native";
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
    <View style={styles.container}>
      <StatusBar backgroundColor="#d8f4ee" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.getParent()?.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#002f2f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QuickRupi</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.headerSubtitle}>Borrower Registration</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Personal Details</Text>

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
          placeholderTextColor="#7a9c9c"
          value={form.initials}
          style={styles.input}
          onChangeText={(t) => handleChange("initials", t)}
        />

        <Text style={styles.label}>Permanent Address *</Text>
        <TextInput
          placeholder="Enter your permanent address"
          placeholderTextColor="#7a9c9c"
          value={form.address}
          style={[styles.input, styles.textArea]}
          onChangeText={(t) => handleChange("address", t)}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Mobile Number *</Text>
        <TextInput
          placeholder="Enter your mobile number"
          placeholderTextColor="#7a9c9c"
          value={form.mobile}
          keyboardType="phone-pad"
          style={[styles.input, fieldErrors.mobile && styles.inputError]}
          onChangeText={(t) => validateAndSetField("mobile", t)}
        />
        {fieldErrors.mobile && <Text style={styles.errorText}>{fieldErrors.mobile}</Text>}


        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          placeholder="Enter your email address"
          placeholderTextColor="#7a9c9c"
          value={form.email}
          keyboardType="email-address"
          style={[styles.input, fieldErrors.email && styles.inputError]}
          onChangeText={(t) => validateAndSetField("email", t)}
          autoCapitalize="none"
        />
        {fieldErrors.email && <Text style={styles.errorText}>{fieldErrors.email}</Text>}

        <Text style={styles.label}>NIC Number *</Text>
        <TextInput
          placeholder="Enter your NIC number"
          placeholderTextColor="#7a9c9c"
          value={form.nic}
          style={[styles.input, fieldErrors.nic && styles.inputError]}
          onChangeText={(t) => validateAndSetField("nic", t)}
        />
        {fieldErrors.nic && <Text style={styles.errorText}>{fieldErrors.nic}</Text>}

        <Text style={styles.label}>Date of Birth *</Text>
        <TextInput
          placeholder="mm/dd/yyyy"
          placeholderTextColor="#7a9c9c"
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
    backgroundColor: "#d8f4ee",
  },
  header: {
    backgroundColor: "#d8f4ee",
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#7ad7c1",
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#002f2f",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#004c4c",
    textAlign: "center",
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#004c4c",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003f3f",
    marginBottom: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#7ad7c1",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    color: "#002f2f",
    marginBottom: 6,
    width: "100%",
  },
  textArea: {
    height: 65,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
    gap: 6,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#7ad7c1",
    backgroundColor: "#ffffff",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 65,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: "#004c4c",
    borderColor: "#004c4c",
  },
  optionText: {
    fontSize: 13,
    color: "#003f3f",
    fontWeight: '500',
  },
  optionTextActive: {
    color: "#ffffff",
    fontWeight: '600',
  },
  button: {
    backgroundColor: "#004c4c",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 11,
    marginTop: -4,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
});