import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ListRenderItem,
  FlatList,
  Keyboard,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useConvex, useMutation, useQuery } from "convex/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { TextInput } from "react-native-gesture-handler";

const chatid = () => {
  const { chatid } = useLocalSearchParams();
  const [user, setUser] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const convex = useConvex();
  const navigation = useNavigation();

  const listRef = useRef<FlatList>(null);
  const addMessage = useMutation(api.messagesFunction.sendMessage);
  const messages =
    useQuery(api.messagesFunction.get, { chatId: chatid as Id<"groups"> }) ||
    [];

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadContact = async () => {
      const contactInfo = await convex.query(api.dbFunctions.getGroup, {
        id: chatid as Id<"groups">,
      });
      navigation.setOptions({ headerTitle: contactInfo?.name });
    };
    loadContact();
  }, [chatid]);

  // Load user from async storage
  useEffect(() => {
    const loadUser = async () => {
      const user = await AsyncStorage.getItem("user");
      setUser(user);
    };

    loadUser();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 300);
  }, [messages]);

  const handleSendMessage = async () => {
    Keyboard.dismiss();

    // Image Uploading Code Block
    if (selectedImage) {
      setUploading(true);
      const url = `${
        process.env.EXPO_PUBLIC_CONVEX_SITE
      }/sendImage?user=${encodeURIComponent(
        user!
      )}&group_id=${chatid}&content=${encodeURIComponent(newMessage)}`;

      const response = await fetch(selectedImage);
      const blob = await response.blob();

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": blob!.type },
        body: blob,
      })
        .then(() => {
          setSelectedImage(null);
          setNewMessage("");
        })
        .catch((err) => console.log(err))
        .finally(() => setUploading(false));
    } else {
      addMessage({
        group_id: chatid as Id<"groups">,
        content: newMessage,
        user: user || "Anon",
      });
    }

    setNewMessage("");
  };

  const renderMessage: ListRenderItem<Doc<"messages">> = ({ item }) => {
    const isUserMessage = item.user === user;
    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage
            ? styles.userMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {item.content !== "" && (
          <Text
            style={[
              styles.messageText,
              isUserMessage ? styles.userMessageText : null,
            ]}
          >
            {item.content}
          </Text>
        )}
        {item.file && (
          <Image
            source={{ uri: item.file }}
            style={{ width: 200, height: 200, margin: 10 }}
          />
        )}
        <Text style={styles.timestamp}>
          {new Date(item._creationTime).toLocaleTimeString()} - {item.user}
        </Text>
      </View>
    );
  };

  const captureImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id.toString()}
        ></FlatList>

        {/* Send */}

        <View style={styles.inputContainer}>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: 200, height: 200, margin: 10 }}
            />
          )}
          <View style={{ flexDirection: "row" }}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Write away your worries..."
              multiline={true}
            />
            <TouchableOpacity style={styles.sendButton} onPress={captureImage}>
              <Ionicons
                name="add-outline"
                style={styles.sendButtonText}
              ></Ionicons>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={newMessage === ""}
            >
              <Ionicons
                name="send-outline"
                style={styles.sendButtonText}
              ></Ionicons>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      {uploading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    paddingHorizontal: 10,
    minHeight: 40,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  sendButton: {
    backgroundColor: "#2768F5",
    borderRadius: 5,
    padding: 10,
    marginLeft: 10,
    alignSelf: "flex-end",
  },
  sendButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },

  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    marginHorizontal: 10,
    maxWidth: "80%",
  },
  userMessageContainer: {
    backgroundColor: "#739fe6",
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },
  messageText: {
    fontSize: 16,
    flexWrap: "wrap",
  },
  userMessageText: {
    color: "#fff",
  },
  timestamp: {
    fontSize: 12,
    color: "#c7c7c7",
  },
});

export default chatid;
