import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Avatar, Searchbar, SegmentedButtons } from 'react-native-paper';
import { useUser } from '../../configs/Contexts';
import { database } from '../../configs/Firebase';
import { ref, onValue } from 'firebase/database';
import APIs, { endpoints, authApis } from '../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import UserStyles from '../User/Styles';
import MyStyles from './Styles';
import moment from 'moment';
import theme from '../../styles/theme';

// Màn hình danh sách cuộc trò chuyện và danh bạ liên hệ
const ChatListMain = ({ navigation }) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const roomsRef = ref(database, 'rooms');
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomList = Object.values(data)
          .filter(room => String(room.studentId) === String(user.id) || String(room.instructorId) === String(user.id))
          .sort((a, b) => b.updatedAt - a.updatedAt);
        setRooms(roomList);
      } else {
        setRooms([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Lỗi đọc Firebase RTDB: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      try {
        const token = await AsyncStorage.getItem('token');
        const api = authApis(token);

        if (user.role?.toUpperCase() === 'STUDENT') {
          const res = await api.get(endpoints['my-enrolls']);
          const instructorsMap = {};
          res.data.forEach(enroll => {
            const inst = enroll.course?.instructor;
            if (inst) instructorsMap[inst.id] = inst;
          });
          setContacts(Object.values(instructorsMap));
        } else if (user.role?.toUpperCase() === 'INSTRUCTOR') {
          const coursesRes = await api.get(endpoints['my-courses']);
          const studentsMap = {};

          for (const course of coursesRes.data) {
            try {
              const studentsRes = await api.get(endpoints['course-students'](course.id));
              studentsRes.data.forEach(enroll => {
                const stud = enroll.student;
                if (stud) studentsMap[stud.id] = stud;
              });
            } catch (err) {
              console.log(`Lỗi lấy học viên cho khóa ${course.id}:`, err);
            }
          }
          setContacts(Object.values(studentsMap));
        }
      } catch (error) {
        console.error("Lỗi lấy danh bạ:", error);
      }
    };

    if (activeTab === 'contacts') {
      fetchContacts();
    }
  }, [activeTab, user]);

  if (!user) {
    return (
      <View style={UserStyles.centerContainer}>
        <View style={UserStyles.iconWrapper}>
          <Ionicons name="chatbubbles-outline" size={120} color="#adb5bd" />
        </View>
        <Text style={UserStyles.unauthTitle}>Hộp thư hỗ trợ</Text>
        <Text style={UserStyles.unauthSubtitle}>
          Đăng nhập ngay để liên hệ trực tiếp với Giảng viên, giải đáp các thắc mắc và nhận hỗ trợ học tập thời gian thực.
        </Text>

        <TouchableOpacity style={UserStyles.btnPrimary}
          onPress={() => navigation.navigate('Login')}>
          <Text style={UserStyles.btnPrimaryText}>Đăng nhập ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={UserStyles.btnSecondary}
          onPress={() => navigation.navigate('Register')}>
          <Text style={UserStyles.btnSecondaryText}>Đăng ký tài khoản</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleStartChat = (contact) => {
    let roomId, receiverName, receiverAvatar, studentId, instructorId;

    if (user.role?.toUpperCase() === 'STUDENT') {
      studentId = user.id;
      instructorId = contact.id;
      receiverName = `${contact.last_name} ${contact.first_name}`;
      receiverAvatar = contact.avatar;
    } else {
      studentId = contact.id;
      instructorId = user.id;
      receiverName = `${contact.last_name} ${contact.first_name}`;
      receiverAvatar = contact.avatar;
    }

    roomId = `room_${studentId}_${instructorId}`;

    navigation.navigate('ChatRoom', {
      roomId,
      receiverId: contact.id,
      receiverName,
      receiverAvatar,
      studentId,
      instructorId,
    });
  };

  const filteredRooms = rooms.filter(room => {
    const isStudent = String(user.id) === String(room.studentId);
    const partnerName = isStudent ? room.instructorName : room.studentName;
    return partnerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredContacts = contacts.filter(contact => {
    const name = `${contact.last_name} ${contact.first_name}`;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderRoomItem = ({ item }) => {
    const isStudent = String(user.id) === String(item.studentId);
    const partnerName = isStudent ? item.instructorName : item.studentName;
    const partnerAvatar = isStudent ? item.instructorAvatar : item.studentAvatar;

    return (
      <TouchableOpacity
        style={MyStyles.chatItem}
        onPress={() => navigation.navigate('ChatRoom', {
          roomId: item.roomId,
          receiverId: isStudent ? item.instructorId : item.studentId,
          receiverName: partnerName,
          receiverAvatar: partnerAvatar,
          studentId: item.studentId,
          instructorId: item.instructorId
        })}
      >
        <Avatar.Image size={50} source={{ uri: partnerAvatar || 'https://res.cloudinary.com/db4bjqp4f/image/upload/v1765436438/shtnr60mecp057e2uctk.jpg' }} />
        <View style={MyStyles.chatInfo}>
          <View style={MyStyles.chatHeader}>
            <Text style={MyStyles.chatPartnerName} numberOfLines={1}>{partnerName}</Text>
            <Text style={MyStyles.chatTime}>{moment(item.updatedAt).format('HH:mm')}</Text>
          </View>
          <Text style={MyStyles.chatLastMessage} numberOfLines={1}>
            {String(item.lastSenderId) === String(user.id) ? 'Bạn: ' : ''}{item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContactItem = ({ item }) => {
    const fullName = `${item.last_name} ${item.first_name}`;
    return (
      <TouchableOpacity style={MyStyles.chatItem} onPress={() => handleStartChat(item)}>
        <Avatar.Image size={50} source={{ uri: item.avatar || 'https://res.cloudinary.com/db4bjqp4f/image/upload/v1765436438/shtnr60mecp057e2uctk.jpg' }} />
        <View style={MyStyles.chatInfo}>
          <Text style={MyStyles.chatPartnerName}>{fullName}</Text>
          <Text style={MyStyles.chatRoleLabel}>{item.role === 'INSTRUCTOR' ? 'Giảng viên môn học' : 'Học viên khóa học'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={MyStyles.chatContainer}>
      <Searchbar
        placeholder="Tìm kiếm cuộc trò chuyện..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={MyStyles.chatSearchBar}
      />

      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          { value: 'chats', label: `Hộp thư (${rooms.length})` },
          { value: 'contacts', label: 'Danh bạ mới' },
        ]}
        style={MyStyles.chatSegmentedButtons}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} size="large" />
      ) : (
        <FlatList
          data={activeTab === 'chats' ? filteredRooms : filteredContacts}
          keyExtractor={(item) => item.id?.toString() || item.roomId || item.username}
          renderItem={activeTab === 'chats' ? renderRoomItem : renderContactItem}
          ListEmptyComponent={
            <View style={MyStyles.chatEmptyContainer}>
              <Text style={MyStyles.chatEmptyText}>
                {activeTab === 'chats' ? 'Không có cuộc trò chuyện nào gần đây' : 'Không tìm thấy liên hệ nào thích hợp'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default ChatListMain;