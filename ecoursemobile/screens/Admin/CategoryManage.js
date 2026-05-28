import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Styles from './Styles';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import theme from '../../styles/theme';

// Màn hình quản lý danh mục khóa học (dành cho Admin)
const CategoryManage = ({ navigation }) => {
    const [categoryName, setCategoryName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const scrollViewRef = useRef(null);
    const formPositionY = useRef(0);

    const loadCategories = async () => {
        try {
            const res = await Apis.get(endpoints['categories']);
            setCategories(res.data || []);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
            Alert.alert("Lỗi", "Không thể tải danh mục lúc này. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreateCategory = async () => {
        if (!categoryName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
            return;
        }
        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await authApis(token).post(endpoints['categories'], {
                    name: categoryName.trim()
                });

                Alert.alert("Thành công", `Danh mục "${response.data.name || categoryName}" đã được tạo!`, [
                    {
                        text: "OK", onPress: () => {
                            setCategoryName('');
                            loadCategories();
                        }
                    }
                ]);
            } else {
                Alert.alert("Lỗi xác thực", "Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
            }
        } catch (error) {
            console.error("Lỗi tạo danh mục:", error);

            let errMsg = 'Không thể tạo danh mục lúc này. Vui lòng thử lại.';
            if (error.response && error.response.data) {
                const data = error.response.data;
                if (data.name) {
                    errMsg = `Tên danh mục: ${data.name[0]}`;
                } else if (data.detail) {
                    errMsg = data.detail;
                }
            }
            Alert.alert('Tạo thất bại', errMsg);
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#f4f6f9' }}
            behavior='padding'
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 120}
        >
            <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={Styles.card}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={Styles.h2}>Danh sách danh mục</Text>
                        <Ionicons name="list-outline" size={24} color={theme.colors.primary} />
                    </View>

                    {loading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ paddingVertical: 20 }} />
                    ) : categories.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', marginVertical: 10 }}>
                            Chưa có danh mục nào trên hệ thống.
                        </Text>
                    ) : (
                        categories.map((cat, index) => (
                            <View
                                key={cat.id || index}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 12,
                                    borderBottomWidth: index === categories.length - 1 ? 0 : 1,
                                    borderBottomColor: theme.colors.border
                                }}
                            >
                                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#e7f0fd', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                    <Ionicons name="pricetag" size={16} color={theme.colors.primary} />
                                </View>
                                <Text style={{ fontSize: 16, color: theme.colors.text, flex: 1 }}>{cat.name}</Text>
                            </View>
                        ))
                    )}
                </View>

                <View style={Styles.card}
                    onLayout={(event) => {
                        formPositionY.current = event.nativeEvent.layout.y;
                    }}>
                    <Text style={[Styles.h2, { marginBottom: 16 }]}>Tạo danh mục mới</Text>

                    <Text style={Styles.formLabel}>
                        Tên danh mục <Text style={Styles.requiredStar}>*</Text>
                    </Text>

                    <TextInput
                        style={Styles.customInput}
                        placeholder="Ví dụ: Lập trình, Thiết kế..."
                        placeholderTextColor="#adb5bd"
                        value={categoryName}
                        onChangeText={setCategoryName}
                        editable={!submitting}
                        onFocus={() => {
                            setTimeout(() => {
                                scrollViewRef.current?.scrollTo({
                                    y: formPositionY.current,
                                    animated: true
                                });
                            }, 200);
                        }}
                    />

                    <TouchableOpacity
                        style={[Styles.btnPrimary, { marginTop: 24, opacity: submitting ? 0.7 : 1 }]}
                        onPress={handleCreateCategory}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <Text style={Styles.btnPrimaryText}>TẠO DANH MỤC</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
export default CategoryManage;
