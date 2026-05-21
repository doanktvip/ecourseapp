import React, { useMemo, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Apis, { endpoints } from '../../configs/Apis';
import Styles from "../../styles/Styles";

const CourseDetail = ({route,navigation}) => {
    const { course } = route.params || {};
    const currentCourse = course || {};
    const [lessons, setLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(false);

    const loadLessons= async() => {
      if (!currentCourse.id) return;
        try {
          setLoadingLessons(true);
          // Gọi API lấy danh sách bài học theo Id khóa học
            let url = `${endpoints['courses']}${currentCourse.id}/lessons/`;
            let res = await Apis.get(url);
            setLessons(res.data.results || res.data);
            
          } catch (ex) {
            console.error("Lỗi khi tải danh sách bài học:", ex);
          } finally {
            setLoadingLessons(false);
          }
    };
    useEffect(() => {
      loadLessons();
    }, [currentCourse.id]);

    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }} contentContainerStyle={{ paddingBottom: 40 }}showsVerticalScrollIndicator={false}>
          <Image source={{ uri: currentCourse.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250'}}  style={Styles.detailBannerImage} />
          <View style={{ padding: 16 }}>
            {/* Tổng quan */}
            <View style={Styles.card}>
              <Text style={[Styles.h1, { fontSize: 22, lineHeight: 28 }]}>
                {currentCourse.subject}
              </Text>
              
              <View style={[Styles.row, { marginVertical: 8 }]}>
                <Ionicons name="star" size={18} color="gold" style={{ marginRight: 4 }} />
                <Text style={[Styles.body, { fontSize: 14, fontWeight: '700' }]}>
                  {currentCourse.rating || "0.0"} ({currentCourse.reviews_count || 0} đánh giá)
                </Text>
                <Text style={[Styles.small, { marginHorizontal: 8 }]}>•</Text>
                <Text style={[Styles.small, { fontSize: 14 }]}>
                  {lessons.length|| 0} Bài học
                </Text>
              </View>

              <Text style={[Styles.h1, { color: '#1877F2', fontSize: 24, marginVertical: 4 }]}>
                {currentCourse.fee && parseFloat(currentCourse.fee) > 0 
                  ? `${parseFloat(currentCourse.fee).toLocaleString()} VNĐ` 
                  : 'Miễn phí'}
              </Text>
            </View>
            {/* Giảng viên phụ trách */}
            <View style={[Styles.card, Styles.row]}>
              <Image 
                source={{ uri: currentCourse.instructor_avatar }} 
                style={[Styles.avatar, { width: 48, height: 48, borderRadius: 24, marginRight: 12 }]} 
              />
              <View style={{ flex: 1 }}>
                <Text style={Styles.small}>Giảng viên phụ trách</Text>
                <Text style={[Styles.title, { fontSize: 16 }]}>{currentCourse.instructor_name}</Text>
              </View>
            </View>
          </View>
          {/* 4. Giới thiệu khóa học */}
          <Text style={[Styles.h2, { marginTop: 16, marginBottom: 10 ,marginLeft: 20,marginRight:20}]}>Giới thiệu khóa học</Text>
          <View style={[Styles.card, {marginLeft: 20,marginRight:20}]}>
            <Text style={Styles.body}>
              {currentCourse.description || "Chưa có mô tả chi tiết cho khóa học này."}
            </Text>
          </View>
          {/* Danh sách các bài học của khóa học */}
          <Text style={[Styles.h2,  { marginTop: 16, marginBottom: 10 ,marginLeft: 20,marginRight:20}]}>
          Nội dung bài học ({lessons.length})
          </Text>
          <View style={[Styles.card, {marginLeft: 20,marginRight:20}]} >
              {lessons.map((lesson, idx) => {
              // Quy ước bài học đầu tiên (order === 1) cho phép học thử
              const isFreeLesson = lesson.order === 1;

              return (
                <TouchableOpacity 
                  key={lesson.id} 
                  style={[Styles.row, { paddingVertical: 12, borderBottomWidth: idx === lessons.length - 1 ? 0 : 1, borderBottomColor: '#eee' }]}
                  onPress={() => {
                    if (isFreeLesson || user) {
                      navigation.navigate('LessonDetail', { lesson: lesson, courseTitle: currentCourse.subject });
                    } else {
                      Alert.alert('Nội dung bị khóa', 'Vui lòng đăng nhập và đăng ký khóa học để mở khóa bài học này.');
                    }
                  }}
                >
                  <Ionicons 
                    name={isFreeLesson ? "play-circle" : "lock-closed"} 
                    size={24} 
                    color={isFreeLesson ? "#28a745" : "#999"} 
                    style={{ marginRight: 12 }} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[Styles.body, { fontSize: 15 }]}>
                      {lesson.subject}
                    </Text>
                    <Text style={Styles.small}>
                      Bài {lesson.order} {lesson.video_seconds ? `• ${Math.floor(lesson.video_seconds / 60)} phút` : ''} {isFreeLesson && '• Học thử miễn phí'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
              );
            })}
          </View>

      </ScrollView>
    );

}
export default CourseDetail;