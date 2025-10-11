import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');

const MonthlyReturnsChart = ({ data }) => {
  // Handle empty or insufficient data
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Monthly Returns</Text>
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={48} color={colors.lightGray} />
          <Text style={styles.emptyText}>No returns data yet</Text>
          <Text style={styles.emptySubtext}>Complete investments to track monthly returns</Text>
        </View>
      </View>
    );
  }

  // Calculate metrics
  const totalReturns = data.reduce((sum, item) => sum + (item.returns || 0), 0);
  const currentMonthReturns = data[data.length - 1]?.returns || 0;
  const previousMonthReturns = data[data.length - 2]?.returns || 0;
  const monthlyChange = currentMonthReturns - previousMonthReturns;
  const hasData = data.some(item => item.returns > 0);

  // Transform data for react-native-chart-kit
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        data: data.map(item => item.returns || 1), // Minimum 1 to show bar
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
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Monthly Returns</Text>
          <Text style={styles.subtitle}>Last 6 months</Text>
        </View>
        <View style={styles.totalReturns}>
          <Text style={styles.totalLabel}>Total Returns</Text>
          <Text style={styles.totalValue}>
            LKR {totalReturns.toLocaleString()}
          </Text>
          {monthlyChange !== 0 && currentMonthReturns > 0 && (
            <View style={styles.changeContainer}>
              <Ionicons 
                name={monthlyChange >= 0 ? "arrow-up" : "arrow-down"} 
                size={12} 
                color={monthlyChange >= 0 ? colors.blueGreen : colors.red} 
              />
              <Text style={[styles.changeText, { color: monthlyChange >= 0 ? colors.blueGreen : colors.red }]}>
                LKR {Math.abs(monthlyChange).toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {hasData ? (
        <BarChart
          data={chartData}
          width={width - 80}
          height={180}
          chartConfig={chartConfig}
          style={styles.chart}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          withHorizontalLines={true}
          withVerticalLines={false}
          yAxisSuffix=""
          yAxisInterval={1}
          showValuesOnTopOfBars={false}
          fromZero={true}
        />
      ) : (
        <View style={styles.noDataState}>
          <Ionicons name="cash-outline" size={40} color={colors.lightGray} />
          <Text style={styles.noDataText}>Earning returns soon...</Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.gray,
  },
  totalReturns: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  changeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.gray,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  noDataState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  noDataText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginTop: spacing.sm,
  },
});

export default MonthlyReturnsChart;
