import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from '../../theme/colors';
import { useKyc } from '../../context/KycContext';

export default function EmploymentDetails({ navigation }) {
  const { updateKycData } = useKyc();
  const [form, setForm] = useState({ employmentStatus: "", presentDesignation: "" });

  const employmentOptions = ["Salaried", "Self-Employed", "Business Owner", "Unemployed", "Student", "Retired"];

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (!form.employmentStatus) {
      return Alert.alert("Error", "Please select your employment status.");
    }
    updateKycData('employmentDetails', form);
    navigation.navigate("AccountInformation");
  };

  const renderInput = (label, field, placeholder, icon) => (
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
        />
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.tealGreen} barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QuickRupi</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.headerSubtitle}>Investor Registration</Text>
        <View style={styles.progress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 4</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Ionicons name="briefcase-outline" size={28} color={colors.tealGreen} />
          <Text style={styles.title}>Employment Details</Text>
        </View>
        <Text style={styles.subtitle}>Tell us about your occupation</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Employment Status *</Text>
          <View style={styles.buttonGrid}>
            {employmentOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionBtn, form.employmentStatus === option && styles.optionBtnActive]}
                onPress={() => updateField('employmentStatus', option)}
              >
                <Text style={[styles.optionTxt, form.employmentStatus === option && styles.optionTxtActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Information</Text>
          {renderInput(
            form.employmentStatus === "Salaried" || form.employmentStatus === "Self-Employed" 
              ? "Designation / Job Title *" 
              : "Designation / Job Title",
            "presentDesignation",
            form.employmentStatus === "Salaried" 
              ? "e.g., Manager - Commercial Bank"
              : form.employmentStatus === "Self-Employed"
              ? "e.g., Independent Accountant"
              : form.employmentStatus === "Business Owner"
              ? "e.g., Director / Proprietor"
              : "Your designation (if applicable)",
            "person-outline"
          )}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.tealGreen} />
            <Text style={styles.backTxt}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextTxt}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.white, textAlign: "center" },
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
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionBtn: {
    borderWidth: 1,
    borderColor: colors.tiffanyBlue,
    backgroundColor: colors.babyBlue,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  optionBtnActive: { backgroundColor: colors.tealGreen, borderColor: colors.tealGreen },
  optionTxt: { fontSize: 13, color: colors.forestGreen, fontWeight: '600' },
  optionTxtActive: { color: colors.white, fontWeight: '700' },
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, gap: 10 },
  backBtn: {
    borderWidth: 1.5,
    borderColor: colors.tealGreen,
    backgroundColor: colors.white,
    flexDirection: 'row',
    padding: 11,
    borderRadius: 10,
    flex: 0.4,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  backTxt: { color: colors.tealGreen, fontWeight: "600", fontSize: 14 },
  nextBtn: {
    backgroundColor: colors.tealGreen,
    flexDirection: 'row',
    padding: 11,
    borderRadius: 10,
    flex: 0.6,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: colors.tealGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  nextTxt: { color: colors.white, fontWeight: "700", fontSize: 15 },
  footer: { fontSize: 11, color: colors.gray, textAlign: 'center', marginTop: 8, marginBottom: 16, fontStyle: 'italic' },
});
