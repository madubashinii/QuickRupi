import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InfoBox = ({ title, data }) => {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>

      {data.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Text style={styles.itemKey}>{item.key}:</Text>
          <Text style={styles.itemValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    alignItems: 'flex-start', // align items left for list
    justifyContent: 'center',
    marginVertical: 10,
    width: 250,
  },
  title: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  itemKey: {
    fontSize: 14,
    color: '#555',
  },
  itemValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default InfoBox;
