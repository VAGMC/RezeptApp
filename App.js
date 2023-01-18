import { StatusBar } from "expo-status-bar";
import { StyleSheet, SafeAreaView, Image } from "react-native";
import Input from "./components/Input";
import colors from "./consts/colors";
import React from "react";

export default class Home extends React.Component {
  render() {
    return (
      <>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" backgroundColor={colors.darkRed} />
          <Image
            style={styles.image}
            source={require("./assets/img/pizza.jpg")}
          />
          <Input></Input>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBeige,
    flexWrap: "nowrap",
    borderBottomWidth: 1,
  },
  image: {
    overlayColor: colors.darkRed,
    resizeMode: "cover",
    flexDirection: "row",
    width: "100%",
    height: "30%",
    borderRadius: 15,
  },
});
