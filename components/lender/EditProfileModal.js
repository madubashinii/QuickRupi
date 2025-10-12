import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { db } from '../../services/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const EditProfileModal = ({ visible, onClose, userData, userId, onSave }) => {
  // Personal Details
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameWithInitials, setNameWithInitials] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  
  // Contact Details
  const [mobileNumber, setMobileNumber] = useState('');
  const [telephoneNumber, setTelephoneNumber] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  
  // Employment Details
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [presentDesignation, setPresentDesignation] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && userData) {
      const data = userData.fullData || {};
      
      // Personal Details
      setTitle(data.personalDetails?.title || data.title || '');
      setFirstName(data.personalDetails?.firstName || data.firstName || '');
      setLastName(data.personalDetails?.lastName || data.lastName || '');
      setNameWithInitials(data.personalDetails?.nameWithInitials || data.nameWithInitials || '');
      setGender(data.personalDetails?.gender || data.gender || '');
      setDateOfBirth(data.personalDetails?.dateOfBirth || data.dateOfBirth || '');
      setNicNumber(data.personalDetails?.nicNumber || data.nicNumber || '');
      
      // Contact Details
      setMobileNumber(data.contactDetails?.mobileNumber || data.phone || '');
      setTelephoneNumber(data.contactDetails?.telephoneNumber || '');
      setPermanentAddress(data.contactDetails?.permanentAddress || data.address || '');
      
      // Employment Details
      setEmploymentStatus(data.employmentDetails?.employmentStatus || '');
      setPresentDesignation(data.employmentDetails?.presentDesignation || '');
    }
  }, [visible, userData]);

  const handleSave = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', userId);
      
      // Prepare update data with nested structure
      const updateData = {
        // Top-level fields for backward compatibility
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: mobileNumber.trim(),
        
        // Personal Details (nested)
        personalDetails: {
          title: title.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          nameWithInitials: nameWithInitials.trim(),
          gender: gender.trim(),
          dateOfBirth: dateOfBirth.trim(),
          nicNumber: nicNumber.trim(),
        },
        
        // Contact Details (nested)
        contactDetails: {
          mobileNumber: mobileNumber.trim(),
          telephoneNumber: telephoneNumber.trim(),
          permanentAddress: permanentAddress.trim(),
        },
        
        // Employment Details (nested)
        employmentDetails: {
          employmentStatus: employmentStatus.trim(),
          presentDesignation: presentDesignation.trim(),
        },
        
        updatedAt: new Date().toISOString()
      };

      await updateDoc(userRef, updateData);

      Alert.alert('Success', 'Profile updated successfully!');
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset all fields to original values
    if (userData) {
      const data = userData.fullData || {};
      
      setTitle(data.personalDetails?.title || data.title || '');
      setFirstName(data.personalDetails?.firstName || data.firstName || '');
      setLastName(data.personalDetails?.lastName || data.lastName || '');
      setNameWithInitials(data.personalDetails?.nameWithInitials || data.nameWithInitials || '');
      setGender(data.personalDetails?.gender || data.gender || '');
      setDateOfBirth(data.personalDetails?.dateOfBirth || data.dateOfBirth || '');
      setNicNumber(data.personalDetails?.nicNumber || data.nicNumber || '');
      
      setMobileNumber(data.contactDetails?.mobileNumber || data.phone || '');
      setTelephoneNumber(data.contactDetails?.telephoneNumber || '');
      setPermanentAddress(data.contactDetails?.permanentAddress || data.address || '');
      
      setEmploymentStatus(data.employmentDetails?.employmentStatus || '');
      setPresentDesignation(data.employmentDetails?.presentDesignation || '');
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.editModalOverlay}>
        <View style={styles.editModalContent}>
          <View style={styles.editModalHeader}>
            <Text style={styles.editModalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleCancel} disabled={isSaving}>
              <Ionicons name="close" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editModalBody} showsVerticalScrollIndicator={false}>
            {/* Personal Details Section */}
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            {/* Title, First Name, Last Name in row */}
            <View style={styles.rowContainer}>
              <View style={styles.smallInputGroup}>
                <Text style={styles.inputLabel}>Title</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Mr/Mrs"
                    placeholderTextColor={colors.gray}
                    value={title}
                    onChangeText={setTitle}
                    editable={!isSaving}
                  />
                </View>
              </View>
              <View style={styles.flexInputGroup}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="First name"
                    placeholderTextColor={colors.gray}
                    value={firstName}
                    onChangeText={setFirstName}
                    editable={!isSaving}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Last name"
                  placeholderTextColor={colors.gray}
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* Name with Initials & Gender in row */}
            <View style={styles.rowContainer}>
              <View style={styles.flexInputGroup}>
                <Text style={styles.inputLabel}>Name with Initials</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="J D Don"
                    placeholderTextColor={colors.gray}
                    value={nameWithInitials}
                    onChangeText={setNameWithInitials}
                    editable={!isSaving}
                  />
                </View>
              </View>
              <View style={styles.flexInputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Male/Female"
                    placeholderTextColor={colors.gray}
                    value={gender}
                    onChangeText={setGender}
                    editable={!isSaving}
                  />
                </View>
              </View>
            </View>

            {/* Date of Birth & NIC in row */}
            <View style={styles.rowContainer}>
              <View style={styles.flexInputGroup}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={colors.gray}
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    editable={!isSaving}
                  />
                </View>
              </View>
              <View style={styles.flexInputGroup}>
                <Text style={styles.inputLabel}>NIC Number</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="NIC"
                    placeholderTextColor={colors.gray}
                    value={nicNumber}
                    onChangeText={setNicNumber}
                    editable={!isSaving}
                  />
                </View>
              </View>
            </View>

            {/* Contact Details Section */}
            <Text style={styles.sectionTitle}>Contact Details</Text>

            {/* Mobile & Telephone in row */}
            <View style={styles.rowContainer}>
              <View style={styles.flexInputGroup}>
                <Text style={styles.inputLabel}>Mobile</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Mobile"
                    placeholderTextColor={colors.gray}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                    editable={!isSaving}
                  />
                </View>
              </View>
              <View style={styles.flexInputGroup}>
                <Text style={styles.inputLabel}>Telephone</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Telephone"
                    placeholderTextColor={colors.gray}
                    value={telephoneNumber}
                    onChangeText={setTelephoneNumber}
                    keyboardType="phone-pad"
                    editable={!isSaving}
                  />
                </View>
              </View>
            </View>

            {/* Permanent Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Permanent Address</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Address"
                  placeholderTextColor={colors.gray}
                  value={permanentAddress}
                  onChangeText={setPermanentAddress}
                  multiline
                  numberOfLines={2}
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* Employment Details Section */}
            <Text style={styles.sectionTitle}>Employment</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Employment Status</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Employed/Self-Employed"
                  placeholderTextColor={colors.gray}
                  value={employmentStatus}
                  onChangeText={setEmploymentStatus}
                  editable={!isSaving}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Present Designation</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Job title"
                  placeholderTextColor={colors.gray}
                  value={presentDesignation}
                  onChangeText={setPresentDesignation}
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* Email (Read-only) */}
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (Read-only)</Text>
              <View style={[styles.inputContainer, styles.readOnlyInput]}>
                <Text style={styles.readOnlyText}>{userData?.email}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.editModalFooter}>
            <TouchableOpacity 
              style={styles.editCancelButton} 
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={styles.editCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editSaveButton, isSaving && styles.buttonDisabled]} 
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.editSaveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Edit Profile Modal Styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxWidth: 420,
    maxHeight: '85%',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  editModalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  editModalBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  smallInputGroup: {
    width: 80,
  },
  flexInputGroup: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  inputIconTop: {
    marginRight: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  textInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.midnightBlue,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  readOnlyInput: {
    backgroundColor: colors.babyBlue,
    borderColor: colors.lightGray,
  },
  readOnlyText: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.gray,
  },
  editModalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    gap: spacing.sm,
  },
  editCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  editCancelButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.gray,
  },
  editSaveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.blueGreen,
    alignItems: 'center',
  },
  editSaveButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default EditProfileModal;

