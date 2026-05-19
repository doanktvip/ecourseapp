import React, { useState, useMemo } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentProcess({ route, navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { course } = route.params || {};

  const [method, setMethod] = useState('momo'); // 'momo' | 'zalopay' | 'stripe' | 'paypal' | 'cash'
  const [processing, setProcessing] = useState(false);

  const paymentGateways = [
    { id: 'momo', name: 'Ví điện tử MoMo', icon: 'wallet', color: '#A50064' },
    { id: 'zalopay', name: 'Ví ZaloPay', icon: 'wallet-outline', color: '#0085FF' },
    { id: 'stripe', name: 'Thẻ Quốc tế Stripe', icon: 'card', color: '#635BFF' },
    { id: 'paypal', name: 'Tài khoản PayPal', icon: 'logo-paypal', color: '#003087' },
    { id: 'cash', name: 'Tiền mặt trực tiếp', icon: 'cash', color: '#137333' }
  ];

  const handlePayment = () => {
    setProcessing(true);
    
    // Simulating backend endpoints['payment-process'](paymentId) api call
    setTimeout(() => {
      setProcessing(false);
      Alert.alert(
        'Thanh toán thành công 🎉',
        `Giao dịch đóng học phí khóa học "${course?.subject || 'Khóa học online'}" qua ${paymentGateways.find(g => g.id === method).name} đã được ghi nhận. Bạn đã mở khóa toàn bộ bài học!`,
        [
          { 
            text: 'Bắt đầu học', 
            onPress: () => navigation.navigate('MyCourses') 
          }
        ]
      );
    }, 1500);
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.h1}>Thanh toán học phí 💳</Text>
      <Text style={[styles.small, { marginBottom: theme.spacing.md }]}>
        Lựa chọn phương thức thanh toán an toàn, bảo mật thông tin tài khoản giao dịch.
      </Text>

      {/* Bill summary card */}
      <View style={styles.card}>
        <Text style={styles.small}>Thông tin hóa đơn</Text>
        <Text style={[styles.title, { fontSize: 18, marginTop: 4, marginBottom: theme.spacing.sm }]}>
          {course?.subject || 'Lập trình React Native nâng cao'}
        </Text>
        <View style={[styles.row, { justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.borderLight, paddingTop: 10 }]}>
          <Text style={styles.body}>Thành tiền:</Text>
          <Text style={[styles.h1, { color: theme.btnPrimaryBg, fontSize: 20 }]}>
            {course?.fee ? `${course.fee.toLocaleString()} VNĐ` : '499.000 VNĐ'}
          </Text>
        </View>
      </View>

      <Text style={[styles.h2, { marginTop: theme.spacing.sm + 4, marginBottom: theme.spacing.sm }]}>Chọn phương thức thanh toán</Text>

      {/* Gateway buttons */}
      {paymentGateways.map((item) => (
        <TouchableOpacity 
          key={item.id}
          style={[
            styles.card, 
            styles.row, 
            { 
              borderColor: method === item.id ? item.color : theme.borderDefault,
              borderWidth: method === item.id ? 2 : 1
            }
          ]}
          onPress={() => setMethod(item.id)}
        >
          <View style={[
            styles.squareIcon, 
            { 
              borderRadius: theme.spacing.sm, 
              backgroundColor: item.color + '15', 
              marginRight: theme.spacing.sm + 4 
            }
          ]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.body, { fontWeight: 'bold', color: theme.textPrimary }]}>{item.name}</Text>
            {item.id === 'cash' && (
              <Text style={styles.small}>Yêu cầu Giảng viên xác nhận nhận tiền mặt thủ công</Text>
            )}
          </View>
          <Ionicons 
            name={method === item.id ? "checkmark-circle" : "ellipse-outline"} 
            size={theme.iconSizes.lg} 
            color={method === item.id ? item.color : theme.textTertiary} 
          />
        </TouchableOpacity>
      ))}

      {/* Checkout Submit */}
      <TouchableOpacity 
        style={[styles.btnPrimary, { marginTop: theme.spacing.lg, height: 50 }]}
        onPress={handlePayment}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator color={theme.btnPrimaryText} />
        ) : (
          <Text style={styles.btnPrimaryText}>XÁC NHẬN THANH TOÁN</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
