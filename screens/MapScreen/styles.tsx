import { StyleSheet } from "react-native";
const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingTop: 0,
        backgroundColor: 'red'
    },
    formContainer: {
        flexDirection: 'row',
    },
    mapContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    mapWrapper: {
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: 'green',
    },
});

export default styles;