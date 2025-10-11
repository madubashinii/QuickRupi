import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { OCRService } from '../../services/OCRService';
import { colors } from '../../theme/colors';

export default function DocumentVerificationScreen({ navigation, route }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setCapturedImage(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to capture image');
      }
    }
  };

  const verifyDocument = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      const result = await OCRService.verifyDocument(capturedImage, 'nic');
      
      if (result.isValid) {
        Alert.alert('Success', `NIC Verified: ${result.nicNumber}`);
        // Update reputation
        await ReputationService.updateReputation(auth.currentUser.uid, 'complete_kyc');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Could not verify NIC. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) return <View><Text>Requesting camera permission...</Text></View>;
  if (hasPermission === false) return <View><Text>No access to camera</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NIC Document Verification</Text>
      
      {!capturedImage ? (
        <Camera style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraButtons}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.buttonText}>Capture NIC</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.button} onPress={verifyDocument} disabled={isProcessing}>
              <Text style={styles.buttonText}>{isProcessing ? 'Processing...' : 'Verify'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => setCapturedImage(null)}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: colors.text },
  camera: { flex: 1, justifyContent: 'flex-end' },
  cameraButtons: { flexDirection: 'row', justifyContent: 'center', padding: 20 },
  previewContainer: { flex: 1, alignItems: 'center' },
  preview: { width: '100%', height: '70%', borderRadius: 10 },
  previewButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
  button: { backgroundColor: colors.primary, padding: 15, borderRadius: 8, minWidth: 120, alignItems: 'center' },
  secondaryButton: { backgroundColor: colors.secondary },
  buttonText: { color: colors.white, fontWeight: 'bold' },
});