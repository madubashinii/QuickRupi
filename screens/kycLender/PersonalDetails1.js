import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from '../../theme/colors';
import { useKyc } from '../../context/KycContext';

export default function PersonalDetails({ navigation }) {
  const { updateKycData } = useKyc();
  const [form, setForm] = useState({
    title: "", firstName: "", lastName: "", nameWithInitials: "",
    nicNumber: "", dateOfBirth: "", gender: ""
  });

  const titles = ["Mr", "Mrs", "Ms", "Dr"];
  const genders = ["Male", "Female", "Other"];

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const formatDateOfBirth = (text) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Add slashes automatically: DD/MM/YYYY
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    
    updateField('dateOfBirth', formatted);
  };

  const handleNext = () => {
    if (!form.title || !form.firstName || !form.lastName || !form.nicNumber || !form.dateOfBirth || !form.gender) {
      return Alert.alert("Error", "Please complete all required fields.");
    }
    updateKycData('personalDetails', form);
    navigation.navigate("ContactDetails");
  };

  const renderOptions = (options, field) => (
    <View style={styles.buttonRow}>
      {options.map(item => (
        <TouchableOpacity
          key={item}
          style={[styles.optionBtn, form[field] === item && styles.optionBtnActive]}
          onPress={() => updateField(field, item)}
        >
          <Text style={[styles.optionTxt, form[field] === item && styles.optionTxtActive]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInput = (label, field, placeholder, icon, keyboardType = "default", autoCapitalize = "sentences") => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        {icon && <Ionicons name={icon} size={20} color={colors.forestGreen} style={styles.icon} />}
        <TextInput
          placeholder={placeholder}
          value={form[field]}
          onChangeText={(val) => updateField(field, val)}
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholderTextColor={colors.gray}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.tealGreen} barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QuickRupi</Text>
        <Text style={styles.headerSubtitle}>Investor Registration</Text>
        <View style={styles.progress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 4</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Ionicons name="person-outline" size={28} color={colors.tealGreen} />
          <Text style={styles.title}>Personal Details</Text>
        </View>
        <Text style={styles.subtitle}>Tell us about yourself</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>
          <Text style={styles.label}>Title *</Text>
          {renderOptions(titles, 'title')}
          
          <View style={styles.row}>
            <View style={styles.half}>
              {renderInput("First Name *", "firstName", "Nimal", null, "default", "words")}
            </View>
            <View style={styles.half}>
              {renderInput("Last Name *", "lastName", "Perera", null, "default", "words")}
            </View>
          </View>
          
          {renderInput("Name with Initials", "nameWithInitials", "N.M. Perera", null, "default", "words")}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Identity Information</Text>
          {renderInput("NIC Number *", "nicNumber", "952345678V or 199523456789", "card-outline")}
          
          <Text style={styles.label}>Date of Birth *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color={colors.forestGreen} style={styles.icon} />
            <TextInput
              placeholder="DD/MM/YYYY"
              value={form.dateOfBirth}
              onChangeText={formatDateOfBirth}
              style={[styles.input, styles.inputWithIcon]}
              placeholderTextColor={colors.gray}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          <Text style={styles.helpText}>Type numbers only - slashes will be added automatically</Text>
          
          <Text style={styles.label}>Gender *</Text>
          {renderOptions(genders, 'gender')}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextTxt}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>
        
        <Text style={styles.footer}>🔒 All information is encrypted and secure</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    backgroundColor: colors.tealGreen,
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.white, textAlign: "center", marginBottom: 2 },
  headerSubtitle: { fontSize: 11, color: colors.white, textAlign: "center", opacity: 0.95, marginBottom: 10 },
  progress: { marginTop: 6 },
  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1.5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.white, borderRadius: 1.5 },
  progressText: { fontSize: 10, color: colors.white, textAlign: 'center', marginTop: 4, opacity: 0.9 },
  content: { flex: 1 },
  scroll: { padding: 14, paddingBottom: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  title: { fontSize: 20, fontWeight: "700", color: colors.deepForestGreen },
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.tiffanyBlue,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 6,
  },
  input: { flex: 1, padding: 10, fontSize: 14, color: colors.deepForestGreen },
  inputWithIcon: { paddingLeft: 0 },
  icon: { marginLeft: 10, marginRight: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  half: { flex: 1 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6, gap: 6 },
  optionBtn: {
    borderWidth: 1,
    borderColor: colors.tiffanyBlue,
    backgroundColor: colors.babyBlue,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 65,
    alignItems: 'center',
  },
  optionBtnActive: { backgroundColor: colors.tealGreen, borderColor: colors.tealGreen },
  optionTxt: { fontSize: 13, color: colors.forestGreen, fontWeight: '600' },
  optionTxtActive: { color: colors.white, fontWeight: '700' },
  nextBtn: {
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
  nextTxt: { color: colors.white, fontWeight: "700", fontSize: 15 },
  footer: { fontSize: 11, color: colors.gray, textAlign: 'center', marginTop: 8, marginBottom: 16, fontStyle: 'italic' },
  helpText: { fontSize: 10, color: colors.gray, marginTop: -2, marginBottom: 6, fontStyle: 'italic' },
});
