import React, { useState, useMemo } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { useTheme } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import { Ionicons } from '@expo/vector-icons';

export default function ChatRoom({ route, navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { recipient } = route.params || { recipient: { name: 'ThS. Nguyễn Văn Giảng Viên' } };

  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: '1', text: 'Chào em, thầy có thể giúp gì cho em?', isSender: false, time: '14:20' },
    { id: '2', text: 'Dạ thầy ơi, phần bài tập lớn dùng React Navigation 7, em gặp lỗi khi truyền params ạ.', isSender: true, time: '14:22' },
    { id: '3', text: 'Chào em, câu hỏi của em rất hay. Để thầy gửi slide bài giảng chương 3 và demo mẫu cho em xem nhé.', isSender: false, time: '14:24' },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMsg = {
      id: (chatHistory.length + 1).toString(),
      text: message,
      isSender: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory([...chatHistory, newMsg]);
    setMessage('');
  };

  const renderItem = ({ item }) => {
    const isSender = item.isSender;
    return (
      <View style={{ 
        flexDirection: 'row',
        justifyContent: isSender ? 'flex-end' : 'flex-start',
        marginVertical: 6,
        paddingHorizontal: 8
      }}>
        {!isSender && (
          <View style={[styles.avatarSmallFallback, { marginRight: 8, alignSelf: 'flex-end' }]}>
            <Ionicons name="person" size={16} color={theme.textTertiary} />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          { 
            backgroundColor: isSender ? theme.btnPrimaryBg : theme.surfacePrimary,
            borderWidth: isSender ? 0 : 1,
            borderColor: theme.borderDefault,
          }
        ]}>
          <Text style={{ 
            color: isSender ? theme.btnPrimaryText : theme.textPrimary,
            fontSize: 15,
            lineHeight: 20
          }}>
            {item.text}
          </Text>
          <Text style={{ 
            color: isSender ? 'rgba(255,255,255,0.7)' : theme.textTertiary,
            fontSize: 10,
            alignSelf: 'flex-end',
            marginTop: 4
          }}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Recipient Custom Header */}
      <View style={[styles.row, { 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: theme.borderLight,
        backgroundColor: theme.bgSecondary
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <Image 
          source={{ uri: recipient.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250' }}
          style={[styles.avatarSmall, { marginRight: 10 }]}
        />
        
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { fontSize: 16 }]} numberOfLines={1}>{recipient.name}</Text>
          <View style={styles.row}>
            <View style={styles.activeBadge} />
            <Text style={[styles.small, { color: theme.successText, fontWeight: '600' }]}>Trực tuyến</Text>
          </View>
        </View>

        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="call-outline" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Message List */}
      <FlatList
        data={chatHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Message input composer */}
      <View style={[styles.row, { 
        paddingHorizontal: 12, 
        paddingVertical: 8, 
        borderTopWidth: 1, 
        borderTopColor: theme.borderLight,
        backgroundColor: theme.bgSecondary
      }]}>
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="add" size={24} color={theme.textTertiary} />
        </TouchableOpacity>
        
        <TextInput
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={theme.textTertiary}
          value={message}
          onChangeText={setMessage}
          style={{ 
            flex: 1, 
            backgroundColor: theme.bgPrimary, 
            color: theme.textPrimary,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            maxHeight: 100,
            fontSize: 15,
            borderWidth: 1,
            borderColor: theme.borderDefault
          }}
          multiline={true}
        />

        <TouchableOpacity onPress={sendMessage} style={{ 
          backgroundColor: message.trim() ? theme.btnPrimaryBg : 'transparent',
          borderRadius: 20,
          padding: 8,
          marginLeft: 8
        }}>
          <Ionicons 
            name="send" 
            size={20} 
            color={message.trim() ? theme.btnPrimaryText : theme.textTertiary} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
