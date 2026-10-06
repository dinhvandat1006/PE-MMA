
import React from 'react';
import { Platform, StyleSheet,Text, View} from 'react-native';

 const PlatformScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Curreent Platform : {Platform.OS} </Text>
            <Text>IOS is cool</Text>
            </View>
        
    );
 };

 const styles = StyleSheet.create({
    container: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                backgroundColor: 'red',
            },
            android: {
                backgroundColor: 'blue',
            },
            default: { // for web or other platform
                backgroundColor: 'green',
            },
        }),
    },
 });

 export default PlatformScreen;