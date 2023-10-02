import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MonoText } from "../components/StyledText";
import Dialog from "react-native-dialog";

const Page = () => {
  const contacts = useQuery(api.dbFunctions.get) || [];
  const greetingActions = useAction(api.greeting.getGreeting);

  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);
  const [greeting, setGreeting] = useState("How may we help you?");

  useEffect(() => {
    AsyncStorage.clear();
    const loadUser = async () => {
      const user = await AsyncStorage.getItem("user");
      if (!user) {
        setTimeout(() => {
          setVisible(true);
        }, 100);
      } else {
        setName(user);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!name) return;
    const loadGreeting = async () => {
      const greetings = await greetingActions({ name });
      setGreeting(greetings);
    };
    loadGreeting();
  }, [name]);

  const setUser = async () => {
    const username = `${name}`;
    await AsyncStorage.setItem("user", username);
    setName(username);
    setVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* <Image
          source={require("../assets/images/abstract_doodles_background.jpg")}
          style={styles.backgroundImage}
        /> */}
        {contacts.map((contact) => (
          <Link
            href={{
              pathname: "/(chat)/[chatid]",
              params: { chatid: contact._id },
            }}
            key={contact._id.toString()}
            asChild
          >
            <TouchableOpacity style={styles.contact}>
              <Image
                source={{ uri: contact.icon_url }}
                style={{ width: 50, height: 50, borderRadius: 35 }}
              />
              <View style={{ flex: 1 }}>
                <MonoText>{contact.name}</MonoText>
                <Text style={{ color: "#888" }}>{contact.description}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
        <Text style={{ textAlign: "center", margin: 10 }}>{greeting}</Text>
        <Dialog.Container></Dialog.Container>
      </ScrollView>
      <Dialog.Container visible={visible}>
        <Dialog.Title>Username required</Dialog.Title>
        <Dialog.Description>
          Please insert a name to start chatting.
        </Dialog.Description>
        <Dialog.Input onChangeText={setName} />
        <Dialog.Button label="Set Name" onPress={setUser} />
      </Dialog.Container>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  // backgroundImage: {
  //   position: "absolute",
  //   resizeMode: "repeat",
  //   width: "100%",
  // },

  contact: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
});

export default Page;
