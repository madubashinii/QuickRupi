import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');

const ROIGrowthChart = ({ data }) => {
  // Transform data for react-native-chart-kit
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        data: data.map(item => item.roi),
        color: (opacity = 1) => colors.blueGreen,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 1,
    color: (opacity = 1) => colors.blueGreen,
    labelColor: (opacity = 1) => colors.gray,
    style: {
      borderRadius: borderRadius.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.blueGreen,
      fill: colors.blueGreen,
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: colors.lightGray,
      strokeWidth: 1,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ROI Growth (6 Months)</Text>
      <LineChart
        data={chartData}
        width={width - 80} // Account for margins
        height={200}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withDots={true}
        withShadow={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        yAxisSuffix="%"
        yAxisInterval={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
});

export default ROIGrowthChart;
