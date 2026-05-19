import React, { useState, useMemo } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  FlatList,
  Alert
} from 'react-native';
import { useTheme } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import { Ionicons } from '@expo/vector-icons';

export default function LessonDetail({ route, navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { lesson, courseTitle } = route.params || {};

  const currentLesson = lesson || { id: 1, title: 'Bài 1: Giới thiệu kiến trúc React Native & Expo', duration: '15:20' };

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(12);
  const [completed, setCompleted] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  const [comments, setComments] = useState([
    { id: 1, name: 'Nguyễn Văn Học Sinh', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150', text: 'Bài giảng rất hay và trực quan, giúp em hiểu rõ kiến trúc Expo!' },
    { id: 2, name: 'Trần Thị Thu học viên', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150', text: 'Cho em hỏi slide bài giảng tải ở đâu ạ?' }
  ]);

  const handleLike = () => {
    // Call endpoint endpoints['lesson-like']
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleComplete = () => {
    // Call endpoint endpoints['lesson-complete']
    setCompleted(!completed);
    Alert.alert(
      completed ? 'Hủy hoàn thành' : 'Đã hoàn thành',
      completed 
        ? 'Bạn đã hủy đánh dấu hoàn thành bài học này.' 
        : 'Chúc mừng bạn đã hoàn thành bài học! Tiến độ của bạn đã được cập nhật.'
    );
  };

  const submitComment = () => {
    if (!newComment.trim()) return;
    
    // Call endpoint endpoints['lesson-comments']
    const commentObj = {
      id: comments.length + 1,
      name: 'Bạn (Học viên)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250',
      text: newComment
    };

    setComments([commentObj, ...comments]);
    setNewComment('');
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Simulated Video Player Container */}
      <View style={styles.videoPlayer}>
        <Ionicons name="play" size={60} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', marginTop: 8 + 4, fontSize: 14 }}>Nhấn để bắt đầu xem ({currentLesson.duration})</Text>
        
        {/* Overlay badges */}
        <View style={[styles.floatingBadge, { left: 12, right: undefined, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: theme.btnPrimaryBg, borderColor: 'transparent' }]}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>VIDEO</Text>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        {/* Course breadcrumb */}
        <Text style={[styles.small, { textTransform: 'uppercase', color: theme.btnPrimaryBg, fontWeight: 'bold' }]}>
          {courseTitle || 'Khóa học của tôi'}
        </Text>
        
        {/* Lesson Title */}
        <Text style={[styles.h1, { fontSize: 20, marginVertical: 8 }]}>{currentLesson.title}</Text>

        {/* Action Controls Bar */}
        <View style={[styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight, borderTopWidth: 1, borderTopColor: theme.borderLight, marginVertical: 12, justifyContent: 'space-around' }]}>
          {/* Like button */}
          <TouchableOpacity style={[styles.row, { padding: 8 }]} onPress={handleLike}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={22} 
              color={liked ? theme.errorText : theme.textPrimary} 
            />
            <Text style={[styles.body, { fontSize: 14, marginLeft: 6, fontWeight: liked ? 'bold' : 'normal', color: liked ? theme.errorText : theme.textPrimary }]}>
              Thích ({likesCount})
            </Text>
          </TouchableOpacity>

          {/* Mark Complete */}
          <TouchableOpacity style={[styles.row, { padding: 8 }]} onPress={handleComplete}>
            <Ionicons 
              name={completed ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={22} 
              color={completed ? theme.successText : theme.textPrimary} 
            />
            <Text style={[styles.body, { fontSize: 14, marginLeft: 6, fontWeight: completed ? 'bold' : 'normal', color: completed ? theme.successText : theme.textPrimary }]}>
              {completed ? 'Đã hoàn thành' : 'Đánh dấu xong'}
            </Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity style={[styles.row, { padding: 8 }]} onPress={() => Alert.alert('Chia sẻ', 'Liên kết bài học đã được sao chép!')}>
            <Ionicons name="share-social-outline" size={22} color={theme.textPrimary} />
            <Text style={[styles.body, { fontSize: 14, marginLeft: 6 }]}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>

        {/* Lesson detail notes */}
        <Text style={[styles.h2, { fontSize: 16, marginTop: 8 + 4 }]}>Ghi chú bài học</Text>
        <View style={styles.card}>
          <Text style={styles.body}>
            Trong bài học này, chúng ta sẽ phân tích và lập trình ứng dụng có cấu trúc. Hãy tải mã nguồn và chuẩn bị môi trường mô phỏng (Simulator) để làm theo các hướng dẫn.
          </Text>
        </View>

        {/* Comments Section */}
        <Text style={[styles.h2, { fontSize: 16, marginTop: 16 }]}>Hỏi đáp & Bình luận ({comments.length})</Text>
        
        {/* Comment input field */}
        <View style={[styles.card, { padding: 12 }]}>
          <View style={[styles.row, styles.input, { paddingVertical: 2, marginVertical: 0 }]}>
            <TextInput
              placeholder="Bạn có câu hỏi gì về bài học này?"
              placeholderTextColor={theme.textTertiary}
              value={newComment}
              onChangeText={setNewComment}
              style={{ flex: 1, color: theme.textPrimary, minHeight: 40 }}
              multiline={true}
            />
            <TouchableOpacity onPress={submitComment}>
              <Ionicons name="send" size={20} color={theme.btnPrimaryBg} style={{ padding: 6 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Feed */}
        {comments.map((comment) => (
          <View key={comment.id} style={[styles.card, styles.row, { alignItems: 'flex-start' }]}>
            <View style={[styles.avatarSmallFallback, { marginRight: 12 }]}>
              <Ionicons name="person" size={20} color={theme.textTertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.body, { fontWeight: '700', fontSize: 14, color: theme.textPrimary }]}>{comment.name}</Text>
              <Text style={[styles.body, { fontSize: 14, marginTop: 4 }]}>{comment.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
