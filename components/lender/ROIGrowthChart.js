import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');

const ROIGrowthChart = ({ data }) => {
  // Handle empty or insufficient data
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ROI Growth</Text>
        <View style={styles.emptyState}>
          <Ionicons name="trending-up-outline" size={48} color={colors.lightGray} />
          <Text style={styles.emptyText}>No completed investments yet</Text>
          <Text style={styles.emptySubtext}>Complete your first investment to see ROI trends</Text>
        </View>
      </View>
    );
  }

  // Calculate metrics
  const currentROI = data[data.length - 1]?.roi || 0;
  const previousROI = data[data.length - 2]?.roi || 0;
  const roiChange = currentROI - previousROI;
  const isPositiveTrend = roiChange >= 0;
  const hasData = data.some(item => item.roi > 0);

  // Transform data for react-native-chart-kit
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        data: data.map(item => item.roi || 0.1), // Minimum 0.1 to show chart line
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
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>ROI Growth</Text>
          <Text style={styles.subtitle}>Last 6 months</Text>
        </View>
        <View style={styles.currentROI}>
          <Text style={styles.currentLabel}>Current ROI</Text>
          <View style={styles.roiValueContainer}>
            <Text style={styles.roiValue}>{currentROI.toFixed(1)}%</Text>
            {roiChange !== 0 && (
              <View style={[styles.trendBadge, { backgroundColor: isPositiveTrend ? colors.blueGreen : colors.red }]}>
                <Ionicons 
                  name={isPositiveTrend ? "arrow-up" : "arrow-down"} 
                  size={10} 
                  color={colors.white} 
                />
                <Text style={styles.trendText}>{Math.abs(roiChange).toFixed(1)}%</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {hasData ? (
        <LineChart
          data={chartData}
          width={width - 80}
          height={180}
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
      ) : (
        <View style={styles.noDataState}>
          <Ionicons name="bar-chart-outline" size={40} color={colors.lightGray} />
          <Text style={styles.noDataText}>Building your ROI history...</Text>
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
  currentROI: {
    alignItems: 'flex-end',
  },
  currentLabel: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  roiValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  roiValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.blueGreen,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  trendText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.white,
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

export default ROIGrowthChart;
