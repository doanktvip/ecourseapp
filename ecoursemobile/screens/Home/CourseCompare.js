import React, { useMemo, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Apis, { endpoints } from '../../configs/Apis';
import Styles from './Styles';

const CourseCompare = ({ route, navigation }) => {
  const {courseA}= route.params || {};
  
  const formatVideoDuration = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return 'Chưa cập nhật';
    
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };
  const defaultCourseA = {
    ...courseA,
    subject: courseA?.subject || 'Đang tải...',
    fee: parseFloat(courseA?.fee || 0),
    rating: courseA?.average_rating || 0,
    lessons_count: courseA?.lessons_count || 0,
    instructor_name: courseA?.instructor_name || 'Đang cập nhật',
    students_count: courseA?.total_students || 0,
    video_duration: formatVideoDuration(courseA?.total_duration_video)
  };

  const [courseOptions, setCourseOptions] = useState([]);
  const [courseB, setCourseB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // Hàm xử lý khi chọn khóa học B để so sánh
  const selectCourseB = (course) => {
    setCourseB(course);
    if (course?.id) {
      fetchCourseCompare(course.id);
    }
  };

  const fetchCourseCompare = async (courseBId) => {
    try {
      setLoadingCompare(true);
      let url = `${endpoints['course-compare']}?ids=${defaultCourseA.id},${courseBId}`;
      
      let res = await Apis.get(url);
      
    } catch (ex) {
      console.error("Lỗi khi gọi API compare: ", ex);
    } finally {
      setLoadingCompare(false);
    }
  };

  const loadCourseCompare = async () => {
    try {
      setLoading(true);
      //Lấy danh sách tất cả các khóa học để lựa chọn
      let url = endpoints['courses']; 
      let res = await Apis.get(url);
      let results = res.data.results || res.data;

      // Sau khi chọn tránh trùng khóa học hiện tại
      let filteredCourses = results.filter(c => c.id !== defaultCourseA.id);
      // Định dạng lại dữ liệu khóa học để dễ hiển thị
      let formattedOptions = filteredCourses.map(c => ({
        ...c,
        fee: parseFloat(c.fee || 0),
        rating: c.average_rating || c.rating || 0,
        lessons_count: c.lesson_count || c.lessons_count || 0,
        instructor_name: c.instructor_name || (c.instructor ? `${c.instructor.last_name} ${c.instructor.first_name}` : 'Đang cập nhật'),
        students_count: c.total_students|| 0,
        video_duration: formatVideoDuration(c.total_duration_video)
      }));
      // Cập nhật danh sách khóa học để lựa chọn
      setCourseOptions(formattedOptions);

      // Mặc định chọn khóa học đầu tiên trong danh sách làm course B và kích hoạt gọi API compare
      if (formattedOptions.length > 0) {
        setCourseB(formattedOptions[0]); 
        fetchCourseCompare(formattedOptions[0].id); // Gọi so sánh cặp đầu tiên ngay khi vào trang
      }
    } catch (ex) {
      console.error("Lỗi khi tải danh sách khóa học:", ex); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseCompare();
  }, []);

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}>
        <Text style={Styles.h1}>So sánh khóa học</Text>
        <Text style={[Styles.small, { marginBottom: 16, marginTop: 5 }]}>
          Tìm kiếm khóa học phù hợp nhất bằng cách so sánh chi tiết các chỉ số trực quan dưới đây.
        </Text>
        {/* Bảng so sánh */}
        {loading ? (<ActivityIndicator size="large" color="#1877F2" style={{ marginVertical: 30 }} />) : !courseB ? (
        <Text style={[Styles.body, { textAlign: 'center', color: '#888', marginTop: 20 }]}>
          Không có khóa học nào khác để so sánh.
        </Text>) : (
        <View style={Styles.card}>
          {/* Header Bảng So Sánh */}
          <View style={[Styles.row, { borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[Styles.small, { fontWeight: 'bold' }]}>Đặc tính</Text>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 4 }}>
              <Text style={[Styles.body, { fontSize: 13, fontWeight: '700', color: '#1877F2' }]} numberOfLines={2}>
                {defaultCourseA.subject}
              </Text>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 4 }}>
              <Text style={[Styles.body, { fontSize: 13, fontWeight: '700', color: '#137333' }]} numberOfLines={2}>
                {courseB.subject}
              </Text>
            </View>
          </View>
          {/* Dòng 1: Học phí */}
          <View style={[Styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }]}>
            <Text style={[Styles.small, { flex: 1 }]}>Học phí</Text>
            <Text style={[Styles.body, { flex: 1, fontSize: 14, fontWeight: 'bold' }]}>
              {defaultCourseA.fee === 0 ? 'Miễn phí' : `${defaultCourseA.fee.toLocaleString()} đ`}
            </Text>
            <Text style={[Styles.body, { flex: 1, fontSize: 14, fontWeight: 'bold' }]}>
              {courseB.fee === 0 ? 'Miễn phí' : `${courseB.fee.toLocaleString()} VNĐ`}
            </Text>
          </View>

          {/* Dòng 2: Số bài học */}
          <View style={[Styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }]}>
            <Text style={[Styles.small, { flex: 1 }]}>Số bài học</Text>
            <Text style={[Styles.body, { flex: 1, fontSize: 14 }]}>
              {defaultCourseA.lessons_count} bài
            </Text>
            <Text style={[Styles.body, { flex: 1, fontSize: 14 }]}>
              {courseB.lessons_count} bài
            </Text>
          </View>
          {/* Dòng 3: Số học viên */}
          <View style={[Styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }]}>
            <Text style={[Styles.small, { flex: 1 }]}>Tổng học viên</Text>
            <Text style={[Styles.body, { flex: 1, fontSize: 14 }]}>
              {defaultCourseA.students_count.toLocaleString()} người
            </Text>
            <Text style={[Styles.body, { flex: 1, fontSize: 14 }]}>
              {courseB.students_count.toLocaleString()} người
            </Text>
          </View>

          {/* Dòng 4: Thời lượng video */}
          <View style={[Styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }]}>
            <Text style={[Styles.small, { flex: 1 }]}>Thời lượng video</Text>
            <Text style={[Styles.body, { flex: 1, fontSize: 14, color: '#555' }]}>
              {defaultCourseA.video_duration}
            </Text>
            <Text style={[Styles.body, { flex: 1, fontSize: 14, color: '#555' }]}>
              {courseB.video_duration}
            </Text>
          </View>
          {/* Dòng 5: Đánh giá */}
          <View style={[Styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }]}>
            <Text style={[Styles.small, { flex: 1 }]}>Đánh giá</Text>
            <View style={[Styles.row, { flex: 1 }]}>
              <Ionicons name="star" size={14} color="gold" style={{ marginRight: 4 }} />
              <Text style={[Styles.body, { fontSize: 14, fontWeight: 'bold' }]}>{defaultCourseA.rating}</Text>
            </View>
            <View style={[Styles.row, { flex: 1 }]}>
              <Ionicons name="star" size={14} color="gold" style={{ marginRight: 4 }} />
              <Text style={[Styles.body, { fontSize: 14, fontWeight: 'bold' }]}>{courseB.rating}</Text>
            </View>
          </View>

          {/* Dòng 6: Giảng viên */}
          <View style={[Styles.row, { paddingVertical: 12 }]}>
            <Text style={[Styles.small, { flex: 1 }]}>Giảng viên</Text>
            <Text style={[Styles.body, { flex: 1, fontSize: 13 }]} numberOfLines={2}>
              {defaultCourseA.instructor_name}
            </Text>
            <Text style={[Styles.body, { flex: 1, fontSize: 13 }]} numberOfLines={2}>
              {courseB.instructor_name}
            </Text>
          </View>
          {/* DANH SÁCH CÁC KHÓA HỌC KHÁC ĐỂ CHỌN */}
          {!loading && courseOptions.length > 0 && (
        <>
          <Text style={[Styles.h2, { marginTop: 12, marginBottom: 12 }]}>Chọn khóa học đối chiếu</Text>
          {courseOptions.map((course) => (
            <TouchableOpacity 
              key={course.id} 
              style={[Styles.card, Styles.row, { borderColor: courseB?.id === course.id ? '#1877F2' : '#eee', borderWidth: courseB?.id === course.id ? 2 : 1, padding: 12, marginBottom: 10}]}
              onPress={() => setCourseB(course)}>
              <Ionicons 
                name={courseB?.id === course.id ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={courseB?.id === course.id ? '#1877F2' : '#ccc'} 
                style={{ marginRight: 12 }} 
              />
              <View style={{ flex: 1 }}>
                <Text style={[Styles.body, { fontWeight: 'bold' }]}>{course.subject}</Text>
                <Text style={Styles.small}>Giảng viên: {course.instructor_name}</Text>
                <Text style={[Styles.small, { color: '#137333', marginTop: 2 }]}>
                  Học phí: {course.fee === 0 ? 'Miễn phí' : `${course.fee.toLocaleString()} VNĐ`}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
        </View>)}
    </ScrollView>
  );
};

export default CourseCompare;