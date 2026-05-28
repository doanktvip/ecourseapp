import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import Styles from './Styles';
import theme from '../../styles/theme';

// Màn hình chọn phương thức thanh toán và xử lý thanh toán khóa học
const PaymentProcess = ({ route, navigation }) => {
  const { course, payment } = route.params || {};
  const currentCourse = course || {};
  const currentPayment = payment || {};

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    {
      id: 'MOMO',
      name: 'Ví MoMo',
      logo: 'https://res.cloudinary.com/db4bjqp4f/image/upload/v1779680333/MOMO_aovm96.png',
      color: theme.colors.brand.momo,
      bgTint: '#FAF0F6',
      desc: 'Thanh toán nhanh qua ứng dụng MoMo'
    },
    {
      id: 'ZALOPAY',
      name: 'Ví ZaloPay',
      logo: 'https://res.cloudinary.com/db4bjqp4f/image/upload/v1779680333/Logo-ZaloPay_vfltc8.webp',
      color: theme.colors.brand.zalopay,
      bgTint: '#F0F8FF',
      desc: 'Thanh toán qua ví điện tử ZaloPay'
    },
    {
      id: 'STRIPE',
      name: 'Ví Stripe (Thẻ Quốc Tế)',
      logo: 'https://res.cloudinary.com/db4bjqp4f/image/upload/v1779680332/stripe_zyju45.png',
      color: theme.colors.brand.stripe,
      bgTint: '#F5F4FF',
      desc: 'Hỗ trợ thẻ Visa, Mastercard, JCB'
    },
    {
      id: 'PAYPAL',
      name: 'Ví PayPal',
      logo: 'https://res.cloudinary.com/db4bjqp4f/image/upload/v1779680332/paypal_n8nmmw.png',
      color: theme.colors.brand.paypal,
      bgTint: '#F0F4FA',
      desc: 'Thanh toán quốc tế bảo mật cao'
    },
    {
      id: 'CASH',
      name: 'Tiền mặt & Chuyển khoản',
      logo: 'https://res.cloudinary.com/db4bjqp4f/image/upload/v1779680302/cash_drrmg6.png',
      color: theme.colors.success,
      bgTint: '#F0F9F4',
      desc: 'Chuyển khoản ngân hàng hoặc nộp trực tiếp'
    },
  ];

  // Xử lý tạo phiên thanh toán thông qua API
  const handleProcessPayment = async () => {
    if (!selectedMethod) {
      Alert.alert("Thông báo", "Vui lòng chọn một phương thức thanh toán trước khi tiếp tục.");
      return;
    }

    if (!currentPayment.id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin hóa đơn thanh toán hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Lỗi xác thực", "Vui lòng đăng nhập lại để thực hiện thanh toán.");
        return;
      }

      const url = endpoints['payment-process'](currentPayment.id);
      const res = await authApis(token).post(url, {
        payment_method: selectedMethod
      });

      const paymentInfo = res.data || {};

      if (selectedMethod === 'CASH') {
        Alert.alert(
          "Đăng ký thanh toán tiền mặt",
          paymentInfo.message || `Đăng ký thanh toán tiền mặt thành công.\n\nHọc phí: ${parseFloat(currentPayment.amount || currentCourse.fee).toLocaleString()} VNĐ.\n\nMã giao dịch: ${paymentInfo.transaction_id || 'CASH_TEMP'}.\n\nVui lòng liên hệ giảng viên hoặc ban quản trị để hoàn tất xác nhận thanh toán.`,
          [{
            text: "Đã hiểu",
            onPress: () => navigation.goBack()
          }]
        );
      } else {
        const payUrl = paymentInfo.payment_url;
        if (payUrl) {
          Alert.alert(
            "Chuyển hướng thanh toán",
            "Hệ thống sẽ chuyển hướng bạn đến cổng thanh toán trực tuyến an toàn để hoàn tất giao dịch.",
            [
              {
                text: "Hủy bỏ",
                style: "cancel"
              },
              {
                text: "Tiếp tục",
                onPress: async () => {
                  const supported = await Linking.canOpenURL(payUrl);
                  if (supported) {
                    await Linking.openURL(payUrl);
                    navigation.goBack();
                  } else {
                    Alert.alert("Lỗi", "Không thể mở trang liên kết thanh toán: " + payUrl);
                  }
                }
              }
            ]
          );
        } else {
          Alert.alert("Lỗi hệ thống", "Không nhận được liên kết thanh toán từ máy chủ. Vui lòng thử lại sau.");
        }
      }

    } catch (err) {
      console.error("Lỗi khi thanh toán:", err);
      let errMsg = "Đã xảy ra lỗi trong quá trình xử lý thanh toán. Vui lòng thử lại.";
      if (err.response && err.response.data && err.response.data.detail) {
        errMsg = err.response.data.detail;
      }
      Alert.alert("Thanh toán thất bại", errMsg);
    } finally {
      setLoading(false);
    }
  };

  const selectedMethodObj = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <ScrollView style={Styles.paymentContainer} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={Styles.paymentBillingCard}>
        <Text style={Styles.paymentCardTitle}>CHI TIẾT HÓA ĐƠN</Text>

        <View style={Styles.paymentCourseRow}>
          <Image
            source={{ uri: currentCourse.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250' }}
            style={Styles.paymentCourseImage}
          />
          <View style={Styles.paymentCourseDetails}>
            <Text style={Styles.paymentCourseSubject} numberOfLines={2}>{currentCourse.subject}</Text>
            <Text style={Styles.paymentCourseInstructor}>Giảng viên: {currentCourse.instructor_name || 'Hệ thống eCourse'}</Text>
          </View>
        </View>

        <View style={Styles.paymentDivider} />

        <View style={Styles.paymentPriceRow}>
          <Text style={Styles.paymentPriceLabel}>Học phí thanh toán:</Text>
          <Text style={Styles.paymentPriceValue}>
            {parseFloat(currentPayment.amount || currentCourse.fee || 0).toLocaleString('vi-VN')} VNĐ
          </Text>
        </View>
      </View>

      {/* 2. Danh sách cổng thanh toán */}
      <View style={Styles.paymentSectionContainer}>
        <Text style={Styles.paymentSectionTitle}>CHỌN PHƯƠNG THỨC THANH TOÁN</Text>

        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              activeOpacity={0.8}
              style={[
                Styles.paymentMethodItem,
                isSelected && {
                  borderColor: method.color,
                  backgroundColor: method.bgTint,
                  borderWidth: 2
                }
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={[Styles.paymentIconContainer, { backgroundColor: isSelected ? theme.colors.white : '#f1f3f5' }]}>
                <Image source={{ uri: method.logo }} style={Styles.paymentMethodLogo} />
              </View>

              <View style={Styles.paymentMethodDetails}>
                <Text style={[Styles.paymentMethodName, isSelected && { color: method.color, fontWeight: 'bold' }]}>
                  {method.name}
                </Text>
                <Text style={Styles.paymentMethodDesc}>{method.desc}</Text>
              </View>

              <View style={Styles.paymentRadioOuter}>
                {isSelected && <View style={[Styles.paymentRadioInner, { backgroundColor: method.color }]} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Nút Xác Nhận Thanh Toán */}
      <View style={Styles.paymentActionContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={loading || !selectedMethod}
          style={[
            Styles.paymentBtnConfirm,
            {
              backgroundColor: selectedMethodObj ? selectedMethodObj.color : '#adb5bd',
              shadowColor: selectedMethodObj ? selectedMethodObj.color : '#adb5bd'
            },
            loading && { opacity: 0.8 }
          ]}
          onPress={handleProcessPayment}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={Styles.paymentBtnConfirmText}>XÁC NHẬN THANH TOÁN</Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.white} style={{ marginLeft: 8 }} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PaymentProcess;