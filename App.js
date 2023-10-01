import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("shoppingList.db");

export default function App() {
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [shoppingList, setShoppingList] = useState([]);

  // SQL
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, amount TEXT);",
        [],
        () => {
          // Success
          loadShoppingList();
        },
        (error) => {
          // Error
          console.error("Error when creating DB: ", error);
        }
      );
    });
  }, []);

  const addItem = () => {
    if (productName && amount) {
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO items (name, amount) VALUES (?, ?);",
          [productName, amount],
          (_, result) => {
            if (result.insertId) {
              setShoppingList([
                ...shoppingList,
                { id: result.insertId, name: productName, amount },
              ]);
              setProductName("");
              setAmount("");
            }
          }
        );
      });
    }
  };

  const loadShoppingList = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM items;", [], (_, { rows }) => {
        const items = rows._array;
        setShoppingList(items);
      });
    });
  };

  const removeItem = (id) => {
    db.transaction((tx) => {
      tx.executeSql("DELETE FROM items WHERE id = ?;", [id], () => {
        loadShoppingList();
      });
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Shopping List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Product"
          value={productName}
          onChangeText={(text) => setProductName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={(text) => setAmount(text)}
        />
        <Button title="Save" onPress={addItem} />
      </View>

      <FlatList
        data={shoppingList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItems}>
            <Text style={styles.listItem}>{item.name}</Text>
            <Text style={styles.listItem}>{item.amount}</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Text style={styles.deleteButton}>Bought</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  heading: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    width: "75%",
  },
  input: {
    height: 35,
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  listItems: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  listItem: {
    marginLeft: 5,
    marginRight: 5,
  },
  deleteButton: {
    color: "red",
    marginLeft: 10,
  },
});
