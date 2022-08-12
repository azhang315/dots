import { Dimensions, StyleSheet } from "react-native";

const { width: winWidth, height: winHeight } = Dimensions.get('window');
const aspectRatio = 9 / 16

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 0
    },
    camera: {
        flex: 1,
        backgroundColor: 'black',

        width: winWidth,
        height: winWidth / aspectRatio,
    },
    bottomBarContainer: {
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        marginBottom: 30,
    },
    recordButtonContainer: {
        flex: 1,
        marginHorizontal: 30,
    },
    recordButton: {
        borderWidth: 3,
        borderColor: '#EDE4E4',
        backgroundColor: '#ff4040',
        borderRadius: 100,
        height: 60,
        width: 60,
        alignSelf: 'center'
    },
    recordButtonPressed: {
        borderWidth: 3,
        borderColor: '#EDE4E4',
        backgroundColor: '#FF404024',
        borderRadius: 100,
        height: 60,
        width: 60,
        alignSelf: 'center'
    },
    disabledRecordButton: {
        borderWidth: 3,
        borderColor: '#8B81815C',
        backgroundColor: '#403A3A24',
        borderRadius: 100,
        height: 60,
        width: 60,
        alignSelf: 'center'
    },
    galleryButton: {
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        width: 50,
        height: 50,
    },
    galleryButtonImage: {
        width: 50,
        height: 50,
    },
    sideBarContainer: {
        top: 60,
        right: 0,
        marginHorizontal: 20,
        position: 'absolute'
    },
    iconText: {
        color: 'white',
        fontSize: 12,
        marginTop: 5
    },
    sideBarButton: {
        alignItems: 'center',
        marginBottom: 25
    },

});

export default styles;