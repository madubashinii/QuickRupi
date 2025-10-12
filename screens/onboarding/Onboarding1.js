// screens/onboarding/Onboarding1.js
import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../../components/Button";
import { colors } from "../../theme/colors";

const { width, height } = Dimensions.get("window");

const Onboarding1 = ({ navigation }) => {
  return (
    <LinearGradient
      colors={[colors.babyBlue, colors.white, colors.tiffanyBlue]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circleTop]} />
        <View style={[styles.circle, styles.circleBottom]} />
        
        <View style={styles.imageContainer}>
          <View style={styles.imageShadow}>
            <Image
              source={require("../../assets/images/community.png")}
              style={styles.image}
            />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to QuickRupi</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>
            A peer-to-peer microloan platform designed to empower underserved
            communities through financial inclusion
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Get Started" 
            onPress={() => navigation.navigate("Onboarding2")} 
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: height * 0.1,
    paddingBottom: 80,
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
    opacity: 0.15,
  },
  circleTop: {
    width: 250,
    height: 250,
    backgroundColor: colors.blueGreen,
    top: -100,
    right: -80,
  },
  circleBottom: {
    width: 200,
    height: 200,
    backgroundColor: colors.midnightBlue,
    bottom: -50,
    left: -60,
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  imageShadow: {
    shadowColor: colors.midnightBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: 200,
    backgroundColor: colors.white,
    padding: 15,
  },
  image: {
    width: 320,
    height: 320,
    resizeMode: "contain",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    color: colors.midnightBlue,
    letterSpacing: 0.5,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: colors.blueGreen,
    borderRadius: 2,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 17,
    textAlign: "center",
    color: colors.deepForestGreen,
    lineHeight: 26,
    paddingHorizontal: 10,
    fontWeight: "400",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
});

export default Onboarding1;
