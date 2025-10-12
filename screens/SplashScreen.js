import React, { useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;
  
  // Floating circles
  const circle1Float = useRef(new Animated.Value(0)).current;
  const circle2Float = useRef(new Animated.Value(0)).current;
  const circle3Float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Text fade-in animations
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(600),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating circles animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle1Float, {
          toValue: -20,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(circle1Float, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(circle2Float, {
          toValue: 20,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(circle2Float, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(circle3Float, {
          toValue: -15,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(circle3Float, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      navigation.replace("Onboarding1");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={[colors.babyBlue, colors.white, colors.tiffanyBlue, colors.blueGreen]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Floating decorative circles */}
      <Animated.View
        style={[
          styles.circle,
          styles.circle1,
          { transform: [{ translateY: circle1Float }] },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          styles.circle2,
          { transform: [{ translateY: circle2Float }] },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          styles.circle3,
          { transform: [{ translateY: circle3Float }] },
        ]}
      />

      <View style={styles.content}>
        {/* Animated logo with glow */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.glowContainer,
              {
                transform: [{ scale: glowPulse }],
              },
            ]}
          >
            <View style={styles.glow} />
          </Animated.View>
          <View style={styles.logoShadow}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
            />
          </View>
        </Animated.View>

        {/* Animated title */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleOpacity,
            },
          ]}
        >
          QuickRupi
        </Animated.Text>

        {/* Animated subtitle */}
        <Animated.View
          style={[
            styles.subtitleContainer,
            {
              opacity: subtitleOpacity,
            },
          ]}
        >
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Peer-to-Peer Microloan Platform</Text>
          <Text style={styles.tagline}>Empowering Communities Together</Text>
        </Animated.View>

        {/* Loading dots animation */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: subtitleOpacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: subtitleOpacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: subtitleOpacity,
              },
            ]}
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
    opacity: 0.12,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: colors.blueGreen,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 250,
    height: 250,
    backgroundColor: colors.midnightBlue,
    bottom: -80,
    left: -80,
  },
  circle3: {
    width: 180,
    height: 180,
    backgroundColor: colors.tealGreen,
    top: height * 0.3,
    left: -60,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  glowContainer: {
    position: "absolute",
    width: 360,
    height: 360,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: colors.tiffanyBlue,
    opacity: 0.3,
  },
  logoShadow: {
    shadowColor: colors.midnightBlue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderRadius: 180,
    backgroundColor: colors.white,
    padding: 20,
  },
  logo: {
    width: 280,
    height: 280,
    resizeMode: "contain",
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: colors.midnightBlue,
    letterSpacing: 1,
    marginBottom: 15,
    textAlign: "center",
  },
  subtitleContainer: {
    alignItems: "center",
  },
  divider: {
    width: 80,
    height: 4,
    backgroundColor: colors.blueGreen,
    borderRadius: 2,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: colors.tealGreen,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: colors.forestGreen,
    fontWeight: "400",
    textAlign: "center",
    fontStyle: "italic",
  },
  loadingContainer: {
    flexDirection: "row",
    marginTop: 40,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blueGreen,
  },
});

export default SplashScreen;
