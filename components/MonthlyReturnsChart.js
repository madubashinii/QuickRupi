import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { colors, spacing, fontSize, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

const MonthlyReturnsChart = ({ data }) => {
  // Transform data for react-native-chart-kit
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        data: data.map(item => item.returns),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.midnightBlue,
    labelColor: (opacity = 1) => colors.gray,
    style: {
      borderRadius: borderRadius.lg,
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: colors.lightGray,
      strokeWidth: 1,
    },
    barPercentage: 0.7,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Returns Trend</Text>
      <BarChart
        data={chartData}
        width={width - 80} // Account for margins
        height={200}
        chartConfig={chartConfig}
        style={styles.chart}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withHorizontalLines={true}
        withVerticalLines={false}
        yAxisSuffix=" LKR"
        yAxisInterval={1}
        showValuesOnTopOfBars={false}
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

export default MonthlyReturnsChart;
