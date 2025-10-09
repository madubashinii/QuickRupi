import React, { useState } from "react";
import { View, TextInput, Button, Text, ScrollView, StyleSheet } from "react-native";
import Constants from "expo-constants";
import 'dotenv/config';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    try {
      const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${Constants.expoConfig.extra.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: input }),
      });

      const data = await response.json();
      const botReply = data.generated_text || data[0]?.generated_text || "Sorry, I didn't understand that.";

      setMessages((prev) => [...prev, { role: "bot", content: botReply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "bot", content: "Error contacting AI service." }]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatBox}>
        {messages.map((msg, index) => (
          <Text
            key={index}
            style={msg.role === "user" ? styles.userMessage : styles.botMessage}
          >
            {msg.content}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  chatBox: { flex: 1, marginVertical: 10 },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    padding: 10,
    borderRadius: 10,
    marginVertical: 2,
    maxWidth: "80%",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
    marginVertical: 2,
    maxWidth: "80%",
  },
  inputContainer: { flexDirection: "row", alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, marginRight: 8 },
});

export default Chatbot;
