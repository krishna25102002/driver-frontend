import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '../screens/Auth/Login';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
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
          animation: 'slide_from_right',
          animationDuration: 350,
          animationMatchesGesture: true,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
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