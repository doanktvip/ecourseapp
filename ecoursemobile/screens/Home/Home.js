import { ScrollView, View,TextInput,Text, Image, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import Styles from "../../styles/Styles";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { use, useEffect, useState } from "react";
import Apis, { endpoints } from "../../configs/Apis";
import {Card} from "react-native-paper";



const Home = () => {
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);


    const loadCategories = async () => {
        let res= await Apis.get(endpoints['categories']);
        setCategories(res.data);
    }

    const loadCourses = async () => {
        try {
            setLoading(true);
            let url=`${endpoints['courses']}`;
            let res= await Apis.get(url);
            setCourses(res.data.results || res.data);

        } catch (ex) {
            console.error(ex);
        } finally
        {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadCourses();
    }, []);

    return (
        <ScrollView style={Styles.container}>
            <View style={Styles.profile_home}>
                <View style={Styles.profile_info}>
                    
                    <Image 
                        source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
                        style={Styles.avatar} 
                    />
                    <View>
                        <Text style={Styles.greeting}>Chào mừng quay lại, </Text>
                        <Text style={Styles.userName}>Chào bạn !</Text>
                    </View>
                </View>

            </View>
            <View style={Styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={Styles.searchIcon} />
                <TextInput 
                    style={Styles.searchInput} 
                    placeholder="Tìm kiếm khóa học, giảng viên,..." 
                />
            </View>
            <LinearGradient 
                    colors={['#56CCF2', '#a1c1eb']} 
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 0 }}
                    style={Styles.bannerContainer}>
                    <Text style={Styles.bannerTitle}>Khuyến mãi cực sốc!</Text>
                    <Text style={Styles.bannerSubtitle}>Giảm liền 50% cho khóa học đầu tiên của bạn</Text>
            </LinearGradient>
            <View style={Styles.sectionContainer}>
                    <Text style={Styles.sectionTitle}>Danh mục nổi bật</Text>
                    <FlatList
                        data={categories}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={Styles.categoryItem}>
                                <Text style={Styles.categoryText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}/>
            </View>
            <View style={Styles.sectionContainer}>
                {courses?.map(course => (<Card 
                    key={course.id} 
                    style={Styles.cardContainer}>
                    <Card.Cover source={{ uri: course.image }} />
                    <Card.Content style={Styles.cardContent}>
                        <Text style={Styles.courseTitle} numberOfLines={2}>
                            {course.subject}
                        </Text>
                    </Card.Content>
                </Card>
                ))}
                {loading && <ActivityIndicator />}
            </View>
        </ScrollView>
    );
}
export default Home;