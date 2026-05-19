import React, { useMemo } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert
} from 'react-native';
import { useTheme, useUser } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import { Ionicons } from '@expo/vector-icons';

export default function ChatList({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { user } = useUser();

  const mockChats = [
    {
      id: 1,
      name: 'ThS. Nguyễn Văn Giảng Viên',
      lastMessage: 'Chào em, câu hỏi của em rất hay. Để thầy gửi slide...',
      time: '14:24',
      unread: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250',
    },
    {
      id: 2,
      name: 'Nguyễn Văn Học Sinh (Học viên)',
      lastMessage: 'Cảm ơn thầy ạ. Em đã nộp bài tập của bài 3 rồi.',
      time: 'Hôm qua',
      unread: false,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
    }
  ];

  // Filter based on role (Instructors see student chats, students see instructor chats)
  const displayChats = user?.role === 'instructor' ? [mockChats[1]] : [mockChats[0]];

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="chatbubbles-outline" size={80} color={theme.textTertiary} />
        <Text style={[styles.title, { marginTop: 16, marginBottom: 8 }]}>Trò chuyện trực tuyến</Text>
        <Text style={[styles.body, { textAlign: 'center', marginBottom: 24, fontSize: 14 }]}>
          Vui lòng đăng nhập để trao đổi trực tiếp, giải đáp thắc mắc cùng Giảng viên và bạn học qua Firebase Realtime Database.
        </Text>
        <TouchableOpacity 
          style={[styles.btnPrimary, { width: '80%' }]} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.btnPrimaryText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.h1}>Tin nhắn 💬</Text>
      <Text style={[styles.small, { marginBottom: 16 }]}>
        Trao đổi trực tiếp, giải đáp bài tập cùng Giảng viên hoặc thảo luận cùng sinh viên cùng khóa học.
      </Text>

      {/* Chat List Items */}
      {displayChats.map((chat) => (
        <TouchableOpacity 
          key={chat.id} 
          style={[styles.card, styles.row, { paddingVertical: 12 }]}
          onPress={() => navigation.navigate('ChatRoom', { recipient: chat })}
        >
          <Image 
            source={{ uri: chat.avatar }} 
            style={[styles.avatarMedium, { marginRight: 12 }]} 
          />
          <View style={{ flex: 1 }}>
            <View style={styles.spaceBetween}>
              <Text style={[styles.title, { fontSize: 15, fontWeight: chat.unread ? 'bold' : '600' }]} numberOfLines={1}>
                {chat.name}
              </Text>
              <Text style={[styles.small, { color: chat.unread ? theme.btnPrimaryBg : theme.textTertiary }]}>{chat.time}</Text>
            </View>
            <Text 
              style={[styles.body, { 
                fontSize: 13, 
                marginTop: 4, 
                color: chat.unread ? theme.textPrimary : theme.textSecondary,
                fontWeight: chat.unread ? '600' : 'normal' 
              }]} 
              numberOfLines={1}
            >
              {chat.lastMessage}
            </Text>
          </View>
          
          {chat.unread && (
            <View style={[styles.unreadDot, { marginLeft: 10 }]} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
