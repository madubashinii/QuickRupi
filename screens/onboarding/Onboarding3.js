// screens/onboarding/Onboarding3.js
import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../../components/Button";
import { colors } from "../../theme/colors";

const { width, height } = Dimensions.get("window");

const Onboarding3 = ({ navigation }) => {
  return (
    <LinearGradient
      colors={[colors.white, colors.tiffanyBlue, colors.blueGreen]}
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
              source={require("../../assets/images/sdg_no_poverty.png")}
              style={styles.image}
            />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Breaking the Cycle of Poverty</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>
            Every small loan empowers families and communities, contributing to
            UN Sustainable Development Goal #1: No Poverty.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Get Started" 
            onPress={() => navigation.navigate("AuthStack", { screen: "LoginScreen" })} 
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
    width: 240,
    height: 240,
    backgroundColor: colors.forestGreen,
    top: -90,
    right: -60,
  },
  circleBottom: {
    width: 190,
    height: 190,
    backgroundColor: colors.midnightBlue,
    bottom: -60,
    left: -70,
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  imageShadow: {
    shadowColor: colors.forestGreen,
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
    backgroundColor: colors.forestGreen,
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

export default Onboarding3;
