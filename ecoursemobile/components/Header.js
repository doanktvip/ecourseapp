import { Text } from "react-native"
import Styles from "../styles/Styles";

// Component Header dùng chung cho ứng dụng
const Header = () => {
    return (
        <Text style={[Styles.content_header, Styles.header]}>eCourse</Text>
    );
}
export default Header;
