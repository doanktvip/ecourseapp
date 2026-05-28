import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import { Text, View, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVideoPlayer, VideoView } from 'expo-video';
import Apis, { BASE_URL, authApis, endpoints } from '../../configs/Apis';
import Styles from './Styles';
import { MyUserContext } from '../../configs/Contexts';
import TagsModal from './Modal/TagsModal';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/vi';
import theme from '../../styles/theme';

moment.locale('vi');

const formatCommentDate = (dateStr) => {
  if (!dateStr) return 'Vừa xong';
  const tzRegex = /(Z|[+-]\d{2}:\d{2}|[+-]\d{4})$/;
  if (!tzRegex.test(dateStr)) {
    return moment(dateStr + '+07:00').fromNow();
  }
  return moment(dateStr).fromNow();
};

const LessonDetail = ({ route, navigation }) => {
  const { lesson, courseTitle, courseInstructorEmail } = route.params || {};
  const [user] = useContext(MyUserContext);

  const isOwner = useMemo(() => {
    return user && (user.role === 'ADMIN' || (user.role === 'INSTRUCTOR' && user.email === courseInstructorEmail));
  }, [user, courseInstructorEmail]);

  const isFocused = useIsFocused();
  const [lessonDetail, setLessonDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [nextCommentsUrl, setNextCommentsUrl] = useState(null);
  const [totalComments, setTotalComments] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const commentInputRef = useRef(null);

  const rootComments = comments;

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const [tagsModalVisible, setTagsModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const lastSyncedTime = useRef(0);
  const currentSecondsRef = useRef(0);
  const hasSought = useRef(false);
  const [loadingComplete, setLoadingComplete] = useState(false);

  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const base = BASE_URL ? (BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL) : '';
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  };

  const rawVideo = lessonDetail?.video || lesson?.video;
  const rawImage = lessonDetail?.image || lesson?.image;

  const videoUrl = getAbsoluteUrl(rawVideo);
  const imageUrl = getAbsoluteUrl(rawImage) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600';

  const player = useVideoPlayer(videoUrl || '', (playerInstance) => {
    playerInstance.timeUpdateEventInterval = 1;
    playerInstance.loop = false;
  });

  useEffect(() => {
    if (player && videoUrl) {
      player.replaceAsync({ uri: videoUrl });
    }
  }, [videoUrl, player]);

  useEffect(() => {
    if (!player) return;

    const timeUpdateSub = player.addListener('timeUpdate', (payload) => {
      const currentSeconds = Math.floor(payload.currentTime);
      currentSecondsRef.current = currentSeconds;

      if (!hasSought.current && lessonDetail && lessonDetail.watched_seconds > 0) {
        hasSought.current = true;
        player.currentTime = lessonDetail.watched_seconds;
        lastSyncedTime.current = lessonDetail.watched_seconds;
        return;
      }

      if (currentSeconds - lastSyncedTime.current >= 10 && user) {
        lastSyncedTime.current = currentSeconds;
        syncProgress(currentSeconds);
      }
    });

    const playToEndSub = player.addListener('playToEnd', () => {
      if (user) {
        syncProgress(currentSecondsRef.current, true);
      }
    });

    return () => {
      timeUpdateSub.remove();
      playToEndSub.remove();
    };
  }, [player, lessonDetail, user]);

  const stripHtmlTags = (str) => {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '').trim();
  };

  const loadLessonDetail = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      let res;
      if (token && user) {
        res = await authApis(token).get(endpoints['lesson-details'](lesson.id));
      } else {
        res = await Apis.get(endpoints['lesson-details'](lesson.id));
      }

      const data = res.data;
      setLessonDetail(data);
      setIsLiked(!!data.liked);
      setLikesCount(data.likes_count || 0);
      setIsCompleted(!!data.completed);
    } catch (err) {
      console.error("Lỗi tải chi tiết bài học:", err);
      Alert.alert("Lỗi tải dữ liệu", "Không thể tải chi tiết bài học lúc này.");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const token = await AsyncStorage.getItem('token');
      let res;
      if (token && user) {
        res = await authApis(token).get(endpoints['lesson-comments'](lesson.id));
      } else {
        res = await Apis.get(endpoints['lesson-comments'](lesson.id));
      }
      const data = res.data;
      if (data && data.results !== undefined) {
        const uniqueComments = data.results.filter((item, index, self) =>
          self.findIndex(t => t.id === item.id) === index
        );
        setComments(uniqueComments);
        setNextCommentsUrl(data.next || null);
        setTotalComments(data.count || 0);
      } else {
        setComments(data || []);
        setNextCommentsUrl(null);
        setTotalComments(data ? data.length : 0);
      }
    } catch (err) {
      console.error("Lỗi tải bình luận:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const loadMoreComments = async () => {
    if (!nextCommentsUrl || loadingComments) return;
    try {
      setLoadingComments(true);
      const token = await AsyncStorage.getItem('token');
      let url = nextCommentsUrl;
      if (url.includes('/lessons/')) {
        url = url.substring(url.indexOf('/lessons/'));
      }

      let res;
      if (token && user) {
        res = await authApis(token).get(url);
      } else {
        res = await Apis.get(url);
      }

      const data = res.data;
      if (data && data.results !== undefined) {
        setComments(prev => {
          const combined = [...prev, ...data.results];
          return combined.filter((item, index, self) =>
            self.findIndex(t => t.id === item.id) === index
          );
        });
        setNextCommentsUrl(data.next || null);
      }
    } catch (err) {
      console.error("Lỗi tải thêm bình luận:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const syncProgress = async (seconds, isFinished = false) => {
    if (!user || user.role === 'ADMIN' || user.role === 'INSTRUCTOR') return;
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await authApis(token).post(endpoints['lesson-update-progress'](lesson.id), {
          watched_seconds: seconds
        });
        if (res.data.status === 'COMPLETED' || isFinished) {
          setIsCompleted(true);
        }
      }
    } catch (err) {
      console.error("Lỗi đồng bộ tiến độ tự động:", err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert("Đăng nhập", "Vui lòng đăng nhập để thích bài học.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await authApis(token).post(endpoints['lesson-like'](lesson.id));
        setIsLiked(res.data.liked);
        setLikesCount(res.data.likes_count || 0);
      }
    } catch (err) {
      console.error("Łỗi khi thích bài học:", err);
    }
  };


  const handleComplete = async () => {
    if (!user) {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để đánh dấu hoàn thành bài học.");
      return;
    }
    try {
      setLoadingComplete(true);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await authApis(token).post(endpoints['lesson-complete'](lesson.id));
        setIsCompleted(true);
        Alert.alert("Hoàn thành bài học", "Tuyệt vời! Bạn đã hoàn thành bài học này.");
      }
    } catch (err) {
      console.error("Lỗi đánh dấu hoàn thành:", err);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái bài học.");
    } finally {
      setLoadingComplete(false);
    }
  };

  const handleDeleteLesson = () => {
    Alert.alert(
      'Xác nhận xóa bài học',
      'Bạn có chắc chắn muốn xóa bài học này không? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa bài học',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleteLoading(true);
              const token = await AsyncStorage.getItem('token');
              if (token) {
                await authApis(token).delete(endpoints['lesson-details'](lesson.id));
                Alert.alert('Thành công', 'Bài học đã được xóa thành công!', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              }
            } catch (err) {
              console.error("Lỗi khi xóa bài học:", err);
              Alert.alert('Thất bại', 'Không thể xóa bài học lúc này.');
            } finally {
              setDeleteLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để viết bình luận.");
      return;
    }
    try {
      setSendingComment(true);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const payload = { content: commentText };
        if (replyTo) {
          payload.parent = replyTo.id;
        }
        const res = await authApis(token).post(endpoints['lesson-comments'](lesson.id), payload);
        if (replyTo) {
          setComments(prev => prev.map(c => {
            if (c.id === replyTo.id) {
              const combinedReplies = [res.data, ...(c.replies || [])];
              const uniqueReplies = combinedReplies.filter((item, index, self) =>
                self.findIndex(t => t.id === item.id) === index
              );
              return {
                ...c,
                replies: uniqueReplies
              };
            }
            return c;
          }));
        } else {
          setComments(prev => {
            const combined = [res.data, ...prev];
            return combined.filter((item, index, self) =>
              self.findIndex(t => t.id === item.id) === index
            );
          });
        }
        setTotalComments(prev => prev + 1);
        setCommentText('');
        setReplyTo(null);
      }
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err);
      Alert.alert("Lỗi", "Gửi bình luận không thành công.");
    } finally {
      setSendingComment(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: lesson.subject || 'Chi tiết bài học' });

    return () => {
      if (currentSecondsRef.current > 0 && user && user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
        AsyncStorage.getItem('token').then(token => {
          if (token) {
            authApis(token).post(endpoints['lesson-update-progress'](lesson.id), {
              watched_seconds: currentSecondsRef.current
            }).catch(err => console.error("Lỗi đồng bộ tiến độ khi thoát màn hình:", err));
          }
        });
      }
    };
  }, [lesson.id]);

  useEffect(() => {
    if (isFocused) {
      loadLessonDetail();
      loadComments();
    }
  }, [lesson.id, isFocused]);

  useEffect(() => {
    if (lessonDetail) {
      navigation.setOptions({ title: lessonDetail.subject || 'Chi tiết bài học' });
    }
  }, [lessonDetail, navigation]);

  const renderCommentItem = ({ item: comment }) => {
    const avatarUrl = comment.user?.avatar || 'https://via.placeholder.com/150';
    const commentUserFullName = comment.user
      ? `${comment.user.last_name || ''} ${comment.user.first_name || ''}`.trim() || 'Học viên'
      : 'Học viên';
    const formattedDate = formatCommentDate(comment.created_date);
    const replies = comment.replies || [];

    return (
      <View style={{ marginBottom: 12, paddingHorizontal: 16 }}>
        <View style={Styles.commentItem}>
          <Image source={{ uri: avatarUrl }} style={Styles.commentAvatar} />
          <View style={Styles.commentContentContainer}>
            <View style={Styles.commentUserRow}>
              <Text style={Styles.commentUserName}>{commentUserFullName}</Text>
              <Text style={Styles.commentDate}>{formattedDate}</Text>
            </View>
            <Text style={Styles.commentText}>{comment.content}</Text>

            {user && (
              <TouchableOpacity
                style={[Styles.row, { marginTop: 6 }]}
                onPress={() => {
                  setReplyTo(comment);
                  if (commentInputRef.current) {
                    commentInputRef.current.focus();
                  }
                }}
              >
                <Ionicons name="arrow-undo-outline" size={14} color={theme.colors.primary} />
                <Text style={Styles.commentReplyBtnText}> Trả lời</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {replies.map((reply) => {
          const replyAvatarUrl = reply.user?.avatar || 'https://via.placeholder.com/150';
          const replyUserFullName = reply.user
            ? `${reply.user.last_name || ''} ${reply.user.first_name || ''}`.trim() || 'Học viên'
            : 'Học viên';
          const replyFormattedDate = formatCommentDate(reply.created_date);

          return (
            <View key={reply.id} style={Styles.replyCommentItem}>
              <Image source={{ uri: replyAvatarUrl }} style={[Styles.commentAvatar, { width: 30, height: 30, borderRadius: 15 }]} />
              <View style={Styles.commentContentContainer}>
                <View style={Styles.commentUserRow}>
                  <Text style={[Styles.commentUserName, { fontSize: 13 }]}>{replyUserFullName}</Text>
                  <Text style={Styles.commentDate}>{replyFormattedDate}</Text>
                </View>
                <Text style={[Styles.commentText, { fontSize: 13 }]}>{reply.content}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View>
        {/* Trình phát Video bài học hiện đại từ expo-video */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <View style={Styles.lessonVideoContainer}>
            {videoUrl ? (
              <VideoView
                style={Styles.lessonVideo}
                player={player}
                fullscreenOptions={{}}
                allowsPictureInPicture
              />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.border }}>
                <Image
                  source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600' }}
                  style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.6 }}
                />
                <Ionicons name="play-circle" size={64} color={theme.colors.primary} style={{ zIndex: 1 }} />
                <Text style={[Styles.title, { color: theme.colors.white, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8, zIndex: 1 }]}>
                  Bài học lý thuyết / Không có video
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Phần thông tin chi tiết */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[Styles.small, { color: '#888888', fontWeight: 'bold' }]}>
            {courseTitle ? courseTitle.toUpperCase() : 'KHÓA HỌC TRỰC TUYẾN'}
          </Text>
          <View style={[Styles.row, { justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 }]}>
            <Text style={[Styles.h1, { fontSize: 20, lineHeight: 26, flex: 1, marginRight: 8 }]}>
              {lessonDetail?.subject || lesson?.subject}
            </Text>
            {isOwner && (
              <View style={[Styles.row, { gap: 8 }]}>
                <TouchableOpacity
                  style={[Styles.row, { backgroundColor: '#e8f0fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }]}
                  onPress={() => navigation.navigate('LessonForm', {
                    lesson: lessonDetail || lesson,
                    courseId: lesson.course
                  })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 13, marginLeft: 4 }}>Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[Styles.row, { backgroundColor: '#ffebee', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }]}
                  onPress={handleDeleteLesson}
                  activeOpacity={0.8}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.danger} />
                  ) : (
                    <>
                      <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                      <Text style={{ color: theme.colors.danger, fontWeight: 'bold', fontSize: 13, marginLeft: 4 }}>Xóa</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Dòng metadata (Tags & Like) */}
          <View style={Styles.lessonMetaRow}>
            <View style={[Styles.lessonTagContainer, { flex: 1 }]}>
              {lessonDetail?.tags && lessonDetail.tags.length > 0 && (
                lessonDetail.tags.map((tag) => (
                  <View key={tag.id} style={Styles.lessonTagPill}>
                    <Text style={Styles.lessonTagText}>#{tag.name}</Text>
                  </View>
                ))
              )}
              {/* Nút chỉnh sửa Tags - chỉ hiển thị cho Admin hoặc Giảng viên */}
              {user && (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') && (
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 16,
                    backgroundColor: '#f0f7ff',
                    borderWidth: 1,
                    borderColor: '#c8d8f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => setTagsModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pricetag-outline" size={13} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600', marginLeft: 3 }}>
                    Gán nhãn
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Nút Thích bài học */}
            <TouchableOpacity
              style={[Styles.lessonLikeBtn, isLiked && Styles.lessonLikeBtnActive]}
              onPress={handleLike}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? theme.colors.danger : "#65676b"}
              />
              <Text style={[Styles.lessonLikeText, isLiked && Styles.lessonLikeTextActive]}>
                {isLiked ? 'Đã thích' : 'Thích'} ({likesCount})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={Styles.divider} />

          {/* Nội dung bài học */}
          <Text style={[Styles.h2, { marginBottom: 8 }]}>Tóm tắt bài học</Text>
          <View style={Styles.card}>
            <Text style={Styles.body}>
              {lessonDetail?.content ? stripHtmlTags(lessonDetail.content) : "Không có nội dung tóm tắt cho bài học này."}
            </Text>
          </View>

          {/* Nút Đánh dấu hoàn thành bài học */}
          {user && user.role === 'STUDENT' && (
            <View style={{ marginBottom: 16 }}>
              {isCompleted ? (
                <View style={[Styles.btnCompleteLesson, Styles.btnCompleteLessonActive]}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                  <Text style={[Styles.btnCompleteLessonText, Styles.btnCompleteLessonTextActive]}>
                    Đã hoàn thành bài học
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={Styles.btnCompleteLesson}
                  onPress={handleComplete}
                  disabled={loadingComplete}
                  activeOpacity={0.8}
                >
                  {loadingComplete ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.white} />
                      <Text style={Styles.btnCompleteLessonText}>Đánh dấu hoàn thành</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Phần Bình luận */}
          <Text style={[Styles.commentSectionTitle, { paddingHorizontal: 0, marginTop: 10, marginBottom: 12 }]}>Bình luận ({totalComments})</Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (loadingComments && comments.length > 0) {
      return <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 15 }} />;
    }
    return <View style={{ height: 20 }} />;
  };

  const renderEmpty = () => {
    if (loadingComments) {
      return <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />;
    }
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center', paddingHorizontal: 16 }}>
        <Ionicons name="chatbubble-ellipses-outline" size={48} color="#adb5bd" />
        <Text style={[Styles.small, { marginTop: 8 }]}>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.white }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[Styles.small, { marginTop: 10 }]}>Đang tải bài học...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.white }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='padding'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
      >
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 30 }}
          data={rootComments}
          renderItem={renderCommentItem}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMoreComments}
          onEndReachedThreshold={0.2}
        />

        {/* Thanh viết bình luận cố định ở cuối màn hình */}
        <View style={{ backgroundColor: theme.colors.white }}>
          {replyTo && (
            <View style={Styles.replyingBar}>
              <Text style={Styles.replyingText}>
                Đang trả lời {replyTo.user ? `${replyTo.user.last_name || ''} ${replyTo.user.first_name || ''}`.trim() : 'Học viên'}
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Ionicons name="close-circle" size={18} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          )}

          <View style={Styles.commentBarContainer}>
            <TextInput
              ref={commentInputRef}
              style={Styles.commentBarInput}
              placeholder={user ? (replyTo ? "Nhập phản hồi..." : "Viết bình luận...") : "Đăng nhập để bình luận"}
              value={commentText}
              onChangeText={setCommentText}
              editable={!!user && !sendingComment}
              multiline
            />
            <TouchableOpacity
              style={[Styles.commentBarSendBtn, (!commentText.trim() || sendingComment || !user) && Styles.commentBarSendBtnDisabled]}
              onPress={handleSendComment}
              disabled={!commentText.trim() || sendingComment || !user}
              activeOpacity={0.8}
            >
              {sendingComment ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Ionicons name="send" size={16} color={theme.colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>

      <TagsModal
        visible={tagsModalVisible}
        onClose={() => setTagsModalVisible(false)}
        lessonId={lessonDetail?.id || lesson?.id}
        currentTags={lessonDetail?.tags || []}
        user={user}
        onSaved={loadLessonDetail}
      />

    </SafeAreaView>
  );
};

export default LessonDetail;