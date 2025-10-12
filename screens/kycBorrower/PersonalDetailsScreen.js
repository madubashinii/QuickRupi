import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
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
            dropdownIconColor="#007f70"
          >
            <Picker.Item label="Please select your title" value="" color="#007f70" />
            <Picker.Item label="Mr." value="Mr." color="#002f2f" />
            <Picker.Item label="Ms." value="Ms." color="#002f2f" />
            <Picker.Item label="Mrs." value="Mrs." color="#002f2f" />
            <Picker.Item label="Dr." value="Dr." color="#002f2f" />
          </Picker>
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
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.gender}
            onValueChange={(v) => handleChange("gender", v)}
            style={styles.picker}
            dropdownIconColor="#007f70"
          >
            <Picker.Item label="Select Gender" value="" color="#007f70" />
            <Picker.Item label="Male" value="male" color="#002f2f" />
            <Picker.Item label="Female" value="female" color="#002f2f" />
            <Picker.Item label="Other" value="other" color="#002f2f" />
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
    backgroundColor: "#d8f4ee",
  },
  header: {
    backgroundColor: "#d8f4ee",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#7ad7c1",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#002f2f",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#004c4c",
    textAlign: "center",
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 25,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#004c4c",
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#003f3f",
    marginBottom: 8,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#7ad7c1",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: "#002f2f",
    marginBottom: 12,
    width: "100%",
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#7ad7c1",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#002f2f",
  },
  button: {
    backgroundColor: "#004c4c",
    padding: 16,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
});