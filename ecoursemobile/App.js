import { View } from "react-native"
import Styles from "./styles/Styles";
import Header from "./components/Header";
import Home from "./screens/Home/Home";

const App = () => {
  return (
    <View style={Styles.container}>
        <Header />
        <Home />

    </View>
  );
}
export default App;
