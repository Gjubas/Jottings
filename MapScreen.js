import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { FontAwesome } from "@expo/vector-icons";
import { Button } from "react-native-elements";

const MapScreen = ({ route }) => {
  const { latitude, longitude } = route.params;

  const [searchText, setSearchText] = React.useState("");
  const [mapRegion, setMapRegion] = React.useState({
    latitude,
    longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleZoomIn = () => {
    setMapRegion({
      ...mapRegion,
      latitudeDelta: mapRegion.latitudeDelta / 2,
      longitudeDelta: mapRegion.longitudeDelta / 2,
    });
  };

  const handleZoomOut = () => {
    setMapRegion({
      ...mapRegion,
      latitudeDelta: mapRegion.latitudeDelta * 2,
      longitudeDelta: mapRegion.longitudeDelta * 2,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} region={mapRegion} onRegionChange={setMapRegion}>
        <Marker coordinate={{ latitude, longitude }} title="Marker Title" />
      </MapView>
      <View style={styles.zoomContainer}>
        <Button
          buttonStyle={styles.zoomButton}
          icon={<FontAwesome name="search-plus" size={25} color="#3EB489" />}
          onPress={handleZoomIn}
        />
        <Button
          buttonStyle={styles.zoomButton}
          icon={<FontAwesome name="search-minus" size={25} color="#3EB489" />}
          onPress={handleZoomOut}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  zoomContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "column",
  },
  zoomButton: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 8,
    marginVertical: 5,
  },
});

export default MapScreen;
