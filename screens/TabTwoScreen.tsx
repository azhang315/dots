import React, { useEffect } from "react";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";

export default function TabTwoScreen() {
  const [toggle, setToggle] = useState(true);
  console.log(`Toggle=${toggle}`)
  useEffect(() => {

  }, [])
  function helloWorld() {
      console.log("hello world")
      setToggle(!toggle);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Landing</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
            <TouchableOpacity 
      onPress={helloWorld}
      ><Text>Hello World</Text>
      </TouchableOpacity>
      {toggle && <Text>Toggle Text</Text>}
      <View>
        <Text>Hell o Text</Text>
        </View><Text>Hello Text</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
