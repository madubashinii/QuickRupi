// screens/onboarding/Onboarding2.js
import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../../components/Button";
import { colors } from "../../theme/colors";

const { width, height } = Dimensions.get("window");

const Onboarding2 = ({ navigation }) => {
  return (
    <LinearGradient
      colors={[colors.tiffanyBlue, colors.white, colors.babyBlue]}
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
              source={require("../../assets/images/financial_inclusion.png")}
              style={styles.image}
            />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Financial Inclusion for Everyone</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>
            Borrowers get affordable loans, lenders make real impact. Together, we
            build sustainable growth and empowerment.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Continue" 
            onPress={() => navigation.navigate("Onboarding3")} 
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
    width: 220,
    height: 220,
    backgroundColor: colors.tealGreen,
    top: -80,
    left: -70,
  },
  circleBottom: {
    width: 180,
    height: 180,
    backgroundColor: colors.forestGreen,
    bottom: -40,
    right: -50,
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  imageShadow: {
    shadowColor: colors.tealGreen,
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
    backgroundColor: colors.tealGreen,
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

export default Onboarding2;
