import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { useUser } from '../../configs/Contexts';
import { database } from '../../configs/Firebase';
import { ref, push, onValue, set, serverTimestamp } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MyStyles from './Styles';
import moment from 'moment';
import theme from '../../styles/theme';

const ChatRoom = ({ route, navigation }) => {
  const { roomId, receiverId, receiverName, receiverAvatar, studentId, instructorId } = route.params;
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    const messagesRef = ref(database, `messages/${roomId}`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        list.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(list);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const messageData = {
      senderId: user.id,
      senderName: `${user.last_name} ${user.first_name}`,
      text: inputText.trim(),
      timestamp: serverTimestamp()
    };

    const messagesRef = ref(database, `messages/${roomId}`);
    push(messagesRef, messageData);

    const isStudent = String(user.id) === String(studentId);

    const roomRef = ref(database, `rooms/${roomId}`);
    set(roomRef, {
      roomId,
      studentId,
      studentName: isStudent ? `${user.last_name} ${user.first_name}` : receiverName,
      studentAvatar: isStudent ? user.avatar : receiverAvatar,
      instructorId,
      instructorName: !isStudent ? `${user.last_name} ${user.first_name}` : receiverName,
      instructorAvatar: !isStudent ? user.avatar : receiverAvatar,
      lastMessage: inputText.trim(),
      lastSenderId: user.id,
      updatedAt: Date.now()
    });

    setInputText('');
  };

  const renderMessageItem = ({ item }) => {
    const isMe = user && String(item.senderId) === String(user.id);
    return (
      <View style={[MyStyles.chatMessageContainer, isMe ? MyStyles.chatMyMessageContainer : MyStyles.chatPartnerMessageContainer]}>
        {!isMe && (
          <Avatar.Image
            size={32}
            source={{ uri: receiverAvatar || 'https://res.cloudinary.com/db4bjqp4f/image/upload/v1765436438/shtnr60mecp057e2uctk.jpg' }}
            style={MyStyles.chatAvatar}
          />
        )}
        <View style={[MyStyles.chatBubble, isMe ? MyStyles.chatMyBubble : MyStyles.chatPartnerBubble]}>
          <Text style={[MyStyles.chatMessageText, isMe ? MyStyles.chatMyMessageText : MyStyles.chatPartnerMessageText]}>
            {item.text}
          </Text>
          <Text style={[MyStyles.chatTimestamp, isMe ? MyStyles.chatMyTimestamp : MyStyles.chatPartnerTimestamp]}>
            {item.timestamp ? moment(item.timestamp).format('HH:mm') : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={MyStyles.chatContainer}>
      <View style={MyStyles.chatRoomHeader}>
        <TouchableOpacity style={MyStyles.chatRoomBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Avatar.Image size={40} source={{ uri: receiverAvatar || 'https://res.cloudinary.com/db4bjqp4f/image/upload/v1765436438/shtnr60mecp057e2uctk.jpg' }} />
        <View style={MyStyles.chatRoomHeaderTitleContainer}>
          <Text style={MyStyles.chatRoomHeaderTitle} numberOfLines={1}>{receiverName}</Text>
          <Text style={MyStyles.chatRoomHeaderSubtitle}>Đang trực tuyến</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='padding'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          style={{ flex: 1 }}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={MyStyles.chatMessageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={{ backgroundColor: theme.colors.white }}>
          <View style={MyStyles.chatInputContainer}>
            <TextInput
              placeholder="Nhập tin nhắn..."
              value={inputText}
              onChangeText={setInputText}
              style={MyStyles.chatInput}
              multiline
            />
            <TouchableOpacity
              style={[MyStyles.chatSendButton, !inputText.trim() && { backgroundColor: '#e4e6eb' }]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoom;