import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import * as SQLite from "expo-sqlite";
import { useIsFocused } from "@react-navigation/native";
import * as Location from "expo-location";

const db = SQLite.openDatabase("shoppingList.db");

export default function HomeScreen() {
  const navigation = useNavigation();

  const [note, setNote] = useState("");
  const [noteList, setNoteList] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const maxCharactersToShow = 40;
  const isFocused = useIsFocused();

  useEffect(() => {
    loadJottingList();
  }, [isFocused]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, latitude REAL, longitude REAL);",
        [],
        () => {
          loadJottingList();
        },
        (error) => {
          console.error("Error when creating DB: ", error);
        }
      );
    });
  }, []);

  const addItem = async () => {
    if (note) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Location permission not granted");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        setLatitude(latitude);
        setLongitude(longitude);

        db.transaction((tx) => {
          tx.executeSql(
            "INSERT INTO items (name, latitude, longitude) VALUES (?, ?, ?);",
            [note, latitude, longitude],
            (_, result) => {
              if (result.insertId) {
                setNoteList([
                  ...noteList,
                  {
                    id: result.insertId,
                    name: note,
                    latitude,
                    longitude,
                  },
                ]);
                setNote("");
              }
            }
          );
        });
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    }
  };

  const loadJottingList = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM items;", [], (_, { rows }) => {
        const items = rows._array;
        setNoteList(items);
      });
    });
  };

  const removeItem = (id) => {
    db.transaction((tx) => {
      tx.executeSql("DELETE FROM items WHERE id = ?;", [id], () => {
        loadJottingList();
      });
    });
  };

  const navigateToEditScreen = (id, name) => {
    navigation.navigate("Edit", { itemId: id, itemName: name });
  };

  const viewLocationOnMap = (latitude, longitude) => {
    navigation.navigate("Map", { latitude, longitude });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableWithoutFeedback>
          <TextInput
            style={styles.input}
            placeholder="What is on your mind..."
            value={note}
            onChangeText={(text) => setNote(text)}
            multiline={true}
            numberOfLines={4}
          />
        </TouchableWithoutFeedback>
      </View>

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
        onPress={addItem}
      />

      <View style={styles.listContainer}>
        <FlatList
          data={noteList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigateToEditScreen(item.id, item.name)}
            >
              <View style={styles.listItems}>
                <View style={styles.listItem}>
                  <Text numberOfLines={1} ellipsizeMode="tail">
                    {item.name.length > maxCharactersToShow
                      ? `${item.name.substring(0, maxCharactersToShow)}...`
                      : item.name}
                  </Text>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity>
                    <Button
                      onPress={() =>
                        viewLocationOnMap(item.latitude, item.longitude)
                      }
                      icon={
                        <Icon
                          name="map-marker"
                          type="font-awesome"
                          color="#3EB489"
                        />
                      }
                      type="clear"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Button
                      onPress={() => removeItem(item.id)}
                      icon={
                        <Icon name="trash" type="font-awesome" color="red" />
                      }
                      type="clear"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
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
  inputContainer: {
    marginTop: 20,
    width: "75%",
  },
  input: {
    height: 70,
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  listItems: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  listItem: {
    marginLeft: 5,
    marginRight: 5,
  },
  listItemAmount: {
    color: "gray",
  },
  deleteButton: {
    color: "red",
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: "#3EB489",
    flexDirection: "row-reverse",
    marginTop: 10,
    width: 150,
  },
  iconStyle: {
    marginLeft: 10,
  },
  listContainer: {
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
  },
});
