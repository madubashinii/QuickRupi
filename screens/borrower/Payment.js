import { use, useEffect, useState } from 'react';
import react from react;
import { View, Text, StyleSheet, TextInput, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const PaymentForm = () => {

    useEffect(() => {
        const [loanID, setLoanId] = useState('');
        const paymentAmount = 0;
        const paymentDate = '';
        const [paymentMethod, setPaymentMethod] = useState('');
        const [image, setImage] = useState(null);
        const uploadImage = async () => {
  const formData = new FormData();
  formData.append("file", {
    uri: image,
    name: "photo.jpg",
    type: "image/jpeg",
  });

  try {
    const response = await fetch("https://your-server.com/upload", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const result = await response.json();
    console.log("Upload success:", result);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

        const fetchData = async () => {
          try {
            const response = await fetch('https://your-api-endpoint.com/api/payment');
            }catch (error) {
            console.error('Error fetching payment data:', error);
          }
           
        };

        const pickImage = async () => {
    // Ask for permission
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access gallery is required!');
      return;
    }

    // Open gallery
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };


        fetchData();
    }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Payment Form</Text>
      <TextInput
        placeholder="Payment Amount"
        keyboardType="numeric"
        value={paymentAmount}
        onChangeText={setPaymentAmount}
        style={styles.input}
      />
      <TextInput
        placeholder="Payment Date"
        value={paymentDate}
        onChangeText={setPaymentDate}
        style={styles.input}
      />
      <TextInput
        placeholder="Payment Method"
        value={paymentMethod}
        onChangeText={setPaymentMethod}
        style={styles.input}
      />
      <Button title="Pick an image from gallery" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentForm;