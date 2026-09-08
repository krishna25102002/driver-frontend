import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '../screens/Auth/Login';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import UploadDocumentsScreen from '../screens/Auth/UploadDocumentsScreen';
import PendingApprovalScreen from '../screens/Auth/PendingApprovalScreen';
import HomeTabs from '../screens/Home/HomeTabs';
import EditProfileScreen from '../components/EditProfileScreen';
import BankDetailsScreen from '../components/BankDetailsScreen';
import MyDocumentsScreen from '../components/MyDocumentsScreen';
import HelpSupportScreen from '../components/HelpSupportScreen';
import TripOtpScreen from '../components/TripOtpScreen';


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="UploadDocuments" component={UploadDocumentsScreen} />
        <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />   
        <Stack.Screen name="EditProfile" component={EditProfileScreen} /> 
        <Stack.Screen name="BankDetails" component={BankDetailsScreen} /> 
        <Stack.Screen name="MyDocuments" component={MyDocumentsScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="TripOtp" component={TripOtpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;