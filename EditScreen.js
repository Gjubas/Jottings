// EditScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("shoppingList.db");

export default function EditScreen({ route, navigation }) {
  const { itemId, itemName } = route.params;
  const [editedName, setEditedName] = useState(itemName);

  const updateItem = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE items SET name = ? WHERE id = ?;",
        [editedName, itemId],
        (_, result) => {
          if (result.rowsAffected > 0) {
            navigation.goBack();
          }
        }
      );
    });
  };

  const deleteItem = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM items WHERE id = ?;",
        [itemId],
        (_, result) => {
          if (result.rowsAffected > 0) {
            navigation.goBack();
          }
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Edit your note..."
          value={editedName}
          onChangeText={(text) => setEditedName(text)}
          multiline={true}
          numberOfLines={4}
        />
      </View>
        </TouchableWithoutFeedback>
      <View style={styles.buttonContainer}>
        <Button
          title="Save"
          buttonStyle={styles.saveButton}
          icon={
            <Icon
              name="save"
              type="font-awesome"
              color="white"
              iconStyle={styles.iconStyle}
            />
          }
          onPress={updateItem}
        />
        <Button
          title="Delete"
          buttonStyle={styles.deleteButton}
          icon={
            <Icon
              name="trash"
              type="font-awesome"
              color="white"
              iconStyle={styles.iconStyle}
            />
          }
          onPress={deleteItem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
  },
  heading: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    backgroundColor: "#3EB489",
    color: "white",
    padding: 10,
  },
  input: {
    height: 70,
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  inputContainer: {
    paddingTop: 20,
    width: "75%",
  },
  saveButton: {
    backgroundColor: "#3EB489",
    flexDirection: "row-reverse",
    width: 100,
  },
  deleteButton: {
    backgroundColor: "red",
    flexDirection: "row-reverse",
    width: 100,
  },
  iconStyle: {
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 10,
    width: 225,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
