import React from 'react';
import { Text, StyleSheet, TextInput, View } from 'react-native';
import Colors from '../constants/Colors';
import { type RegisteredHost } from '../entities/HostEntity';

const styles = StyleSheet.create({
  inputView: {
    flex: 2,
    gap: 30,
    margin: 40,
  },
  label: {
    fontSize: 18,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 5,
  },
  inputText: {
    padding: 10,
    backgroundColor: Colors.card,
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: Colors.text,
    borderRadius: 5,
  },
});

const HostDetailForm = (hostInfo: RegisteredHost) => {
  return (
    <View style={styles.inputView}>
      <View>
        <Text style={styles.label}>Name:</Text>
        <TextInput readOnly value={hostInfo.name} style={styles.inputText} />
      </View>
      <View>
        <Text style={styles.label}>Connection:</Text>
        <TextInput value={hostInfo.connectionType} readOnly style={styles.inputText} />
      </View>
      <View>
        <Text style={styles.label}>Id:</Text>
        <TextInput
          value={hostInfo.id}
          readOnly
          style={styles.inputText}
          multiline={true}
          numberOfLines={4}
        />
      </View>
    </View>
  );
};

export default HostDetailForm;
