import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  cardWrapper: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  card: {
    backgroundColor: "transparent",
    width: "95%",
    height: "80%",
    borderRadius: 5,
  },
  mapContainer: {
    width: "100%",
    height: "80%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
  },
  mapWrapper: {
    width: "100%",
    height: "100%",
  },
});

export default styles;
