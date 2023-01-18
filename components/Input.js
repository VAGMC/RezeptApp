import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import colors from "../consts/colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";

function Input() {
  // constants____________________________________________________________________

  const [modalOpen, setModalOpen] = useState(false);
  const [recipe, setRecipe] = useState("");
  const [recipeList, setRecipeList] = useState([]);
  const [recentList, setRecentList] = useState([]);
  const [lastList, setLastList] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [outputMessage, setOutputMessage] = useState("");
  const [jsonObject, setJsonObject] = useState([]);
  const maxRecentRecipes = 7;

  let numRecent;
  let randomIndexNumber;

  //Data handling________________________________________________________________

  useEffect(() => {
    if (recipe !== "" && recipe !== undefined) {
      addToList(recipe);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    readStorage("recipes");
  }, []);

  // Set list to save data
  useEffect(() => {
    if (Array.isArray(jsonObject)) {
      // console.log("write to List data", jsonObject);
      setRecipeList(jsonObject);
    }
  }, [jsonObject]);

  // Store data function
  const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      // console.log("data stored", value);
    } catch (e) {
      // saving error
      console.log("error Write");
    }
  };

  // Fetch data function
  const getData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value != null) {
        return value;
      } else {
        // console.log("no data");
      }
    } catch (e) {
      // error reading value
      console.log("error Read");
    }
  };

  // Set jsonObject to
  function readStorage() {
    getData("recipes")
      .then((result) => {
        setJsonObject(JSON.parse(result));
        // console.log("JSON Object", jsonObject);
        return () => jsonObject;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Clear all stored data
  const clearAll = async () => {
    try {
      await AsyncStorage.clear();
      // console.log("local storage cleared");
    } catch (e) {
      // clear error
    }
  };

  //
  useEffect(() => {
    storeData("recipes", recipeList);
    // console.log(1, recipeList);
  }, [recipeList]);

  // Reset function
  function clear() {
    setRecipe("");
    setRecipeList([]);
    setLastList([]);
    setRecentList([]);
    clearAll();
    clearTexts();
    // console.log("Reset");
  }

  // Reset alert
  const alert = () => {
    Alert.alert(
      "Warnung!",
      "Sollen wirklich alle Daten gelöscht werden?",
      [
        {
          text: "Alles löschen",
          onPress: () => {
            clear();
          },
        },
        {
          text: "Abbrechen",
        },
      ],
      { cancelable: true }
    );
  };

  // Input logic___________________________________________________

  // set user input to recipe variable
  function inputHandler(text) {
    setRecipe(text);
  }

  // add new recipe to list
  function addToList(text) {
    setRecipeList((currentRecipeList) => {
      return [
        ...currentRecipeList,
        { id: recipeList.length, selected: false, value: text },
      ];
    });

    // Store data locally
    storeData("recipes", recipeList);
  }

  // onPress function
  function inputClickHandler() {
    recipeList.map((item) => {
      setRecentList((previousList) => [...previousList, item.value]);
    });

    if (recipe !== "" && recentList.includes(recipe) == true) {
      clearTexts();
      setInputMessage(`${recipe} befindet sich bereits in der Liste!`);
    } else if (recipe !== "" && recentList.includes(recipe) == false) {
      addToList(recipe);
      clearTexts();
      setInputMessage(`${recipe} wurde zu den Gerichten hinzugefügt!`);
      setRecipe("");
      Keyboard.dismiss();
    } else {
      clearTexts();
      setInputMessage("Kein Gericht Angegeben!");
    }
  }

  // Output Logic________________________________________________________

  // onPress Function
  function outputClickHandler() {
    displayResult();
    Keyboard.dismiss();
  }

  // Clear text labels
  function clearTexts() {
    setOutputMessage("");
    setInputMessage("");
  }

  // Display function
  function displayResult() {
    randomIndexNumber = Math.floor(Math.random() * recipeList.length);
    numRecent = 0;

    // no recipes given
    if (recipeList.length === 0) {
      clearTexts();
      setOutputMessage("Es müssen zuerst Gerichte hinzugefügt werden.");
      return;

      // Display result
    } else {
      if (lastList.includes(recipeList[randomIndexNumber].value)) {
        numRecent++;
      }

      if (numRecent === 0) {
        clearTexts();

        setLastList((currentLastList) => [
          recipeList[randomIndexNumber].value,
          ...currentLastList,
        ]);

        setOutputMessage(
          `Wie wäre es mit ${recipeList[randomIndexNumber].value}?`
        );

        if (lastList.length >= maxRecentRecipes) {
          setLastList((lastList) => lastList.slice(0, -1));
        }
      }

      // keep recent list lenght at maxLastRecipies
      else if (numRecent != 0 && recipeList.length <= lastList.length) {
        clearTexts();
        setOutputMessage("Es sind noch zu wenig Gerichte hinzugefügt worden.");
        return;
      } else {
        // result was recent, so repeat whole function
        displayResult();
        return;
      }
    }
  }

  // Modal list handling___________________________________________________________

  // Toggle List

  function toggle() {
    if (modalOpen == false) {
      setModalOpen(true);
    } else {
      setModalOpen(false);

      // delselect on list close
      recipeList.forEach((e) => {
        e.selected = false;
      });

      // Store data in case items were deleted
      storeData("recipes", recipeList);
    }
  }

  // Toggle Select List Items

  function checkHandler(item) {
    const newArray = recipeList.map((e) => {
      if (e.selected == false && e.id == item.id) {
        return {
          ...e,
          selected: true,
        };
      } else if (e.selected == true && e.id == item.id) {
        return {
          ...e,
          selected: false,
        };
      } else {
        if (e.id == item.id) {
          return {
            ...e,
            selected: true,
          };
        } else
          return {
            ...e,
          };
      }
    });
    setRecipeList(newArray);
  }

  // onPress delete recipes

  function deleteItems() {
    const itemsToDelete = recipeList.filter(
      (recipe) => recipe.selected == false
    );

    setRecipeList(itemsToDelete);
  }

  // Display__________________________________________________________________

  return (
    <>
      <Modal visible={modalOpen} animationType="slide">
        <View style={styles.modalWrapper}>
          <FlatList
            ListHeaderComponent={
              <View>
                <Text style={styles.header2}>Rezeptliste</Text>
              </View>
            }
            style={styles.list}
            data={recipeList}
            keyExtractor={(item) => `key-${item.id}`}
            renderItem={({ item }) => (
              <Pressable
                android_disableSound={true}
                onPress={() => checkHandler(item)}
                style={[
                  styles.listEntry,
                  {
                    backgroundColor: item.selected
                      ? colors.buttonBeige
                      : colors.lightBeige,
                  },
                ]}
              >
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    value={item.selected}
                    color={
                      item.selected ? colors.mediumDarkRed : colors.lightBeige
                    }
                  ></Checkbox>
                </View>
                <Text style={styles.listText}>{item.value}</Text>
              </Pressable>
            )}
          />

          <View style={styles.modalButtonWrapper}>
            <Pressable style={styles.button} onPress={deleteItems}>
              <Text style={styles.buttonLabel}>Ausgewählte löschen</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={toggle}>
              <Text style={styles.buttonLabel}>Liste schließen</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Text style={styles.header}>Rezept Helper</Text>
      <View>
        <Text style={styles.secondHeader}>
          {"\t"}
          {"\t"}Neues Rezept eintragen
        </Text>
        <View style={styles.outerView}>
          <View style={styles.innerView}>
            <TextInput
              value={recipe}
              onChangeText={inputHandler}
              placeholder="Rezept hier eintragen"
              style={styles.userTextInput}
            ></TextInput>
            <Pressable style={styles.button} onPress={inputClickHandler}>
              <Text style={styles.buttonLabel}>Hinzufügen</Text>
            </Pressable>
          </View>

          <View style={styles.innerView}>
            <Text style={styles.textInput}>{inputMessage}</Text>
          </View>
        </View>
      </View>
      <View style={styles.outerView}>
        <View style={styles.innerView}>
          <Text style={styles.textInput}>{outputMessage}</Text>
          <Pressable style={styles.button} onPress={outputClickHandler}>
            <Text style={styles.buttonLabel}>Neues Rezept</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.buttonWrapper2}>
        <Pressable style={styles.button} onPress={toggle}>
          <Text style={styles.buttonLabel}>Liste öffnen</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={alert}>
          <Text style={styles.buttonLabel}>Reset</Text>
        </Pressable>
      </View>
    </>
  );
}

// Styles__________________________________________________________________________

const styles = StyleSheet.create({
  modalButtonWrapper: {
    flex: 1 / 8,
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 2,
    borderColor: colors.darkRed,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  modalWrapper: {
    flex: 1,
    paddingTop: 1,
    borderWidth: 2,
    borderColor: colors.darkRed,
    borderRadius: 10,
    backgroundColor: colors.lightBeige,
  },
  checkboxContainer: {
    flex: 1 / 8,
    alignItems: "center",
  },
  listText: {
    flex: 1,
    color: colors.mediumDarkRed,
    textAlign: "center",
  },
  listEntry: {
    flex: 1 / 10,
    height: 50,
    width: "98%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 7.5,
    backgroundColor: colors.buttonBeige,
    borderColor: colors.darkRed,
    margin: 2,
    marginTop: 8,
    borderWidth: 0.5,
  },
  list: {
    flex: 1,
  },
  header2: {
    width: "100%",
    textAlign: "center",
    textIndent: 35,
    fontSize: 25,
    fontStyle: "italic",
    fontWeight: "600",
    padding: 2,
    color: colors.mediumDarkRed,
    textShadowColor: colors.darkRed,
    borderTopColor: colors.mediumDarkRed,
    borderBottomWidth: 2,
    textShadowRadius: 65,
    textShadowOffset: { width: 20, height: 0 },
  },
  header: {
    width: "100%",
    textAlign: "center",
    textIndent: 35,
    fontSize: 25,
    fontStyle: "italic",
    fontWeight: "600",
    padding: 2,
    color: colors.mediumDarkRed,
    textShadowColor: colors.darkRed,
    borderTopColor: colors.mediumDarkRed,
    borderTopWidth: 1,
    textShadowRadius: 65,
    textShadowOffset: { width: 20, height: 0 },
  },
  secondHeader: {
    textAlign: "left",
    textIndentLeft: 5,
    fontSize: 18,
    color: "#520303",
    fontStyle: "italic",
    fontWeight: "bolder",
    borderTopWidth: 1,
    borderTopColor: colors.darkRed,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkRed,
  },
  outerView: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.darkRed,
    justifyContent: "center",
    minHeight: "20%",
  },
  innerView: {
    margin: 10,
    paddingRight: 10,
    paddingLeft: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userTextInput: {
    borderWidth: 1,
    borderRadius: 1,
    backgroundColor: colors.buttonBeige,
    flexShrink: 1,
    color: colors.mediumDarkRed,
    fontSize: 13,
    flex: 0.9,
    margin: 10,
    textAlign: "center",
  },
  textInput: {
    flexShrink: 1,
    color: colors.mediumDarkRed,
    fontSize: 16,
    flex: 0.9,
    margin: 10,
  },
  button: {
    borderRadius: 10,
    width: 100,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 2,
    backgroundColor: colors.buttonBeige,
    borderColor: colors.green,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonLabel: {
    color: colors.mediumDarkRed,
    fontSize: 13,
  },
  buttonWrapper: {
    width: "100%",
    boderwidth: 1,
    borderColor: colors.darkRed,
    alignItems: "center",
    paddingTop: 50,
    justifyContent: "flex-start",
  },
  buttonWrapper2: {
    width: "100%",
    boderwidth: 1,
    borderColor: colors.darkRed,
    alignItems: "center",
    paddingTop: 50,
    justifyContent: "space-evenly",
    flexDirection: "row",
  },
  alert: {
    color: colors.darkRed,
    backgroundColor: colors.green,
    fontSize: 11,
  },
});

export default Input;
