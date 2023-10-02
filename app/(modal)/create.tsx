import {
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TextInput } from "react-native-gesture-handler";

const create = () => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("");

  const router = useRouter();
  const StartNewChat = useMutation(api.dbFunctions.create);

  const onCreate = async () => {
    await StartNewChat({
      name,
      description: desc,
      icon_url: icon,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.textInput}
        value={name}
        onChangeText={setName}
      ></TextInput>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textInput}
        value={desc}
        onChangeText={setDesc}
      ></TextInput>

      <Text style={styles.label}>Icon URL</Text>
      <TextInput
        style={styles.textInput}
        value={icon}
        onChangeText={setIcon}
      ></TextInput>

      <TouchableOpacity style={styles.button} onPress={onCreate}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  label: {
    marginVertical: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    paddingHorizontal: 10,
    minHeight: 40,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2768F5",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default create;
