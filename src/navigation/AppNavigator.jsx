import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegistroScreen from '../screens/RegistroScreen';
import Mundo1Screen from '../screens/Mundo1Screen';
import LeccionScreen from '../screens/LeccionScreen';
import ResultadoLeccionScreen from '../screens/ResultadoLeccionScreen';
import LoginScreen from "../screens/LoginScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="RegistroScreen"
            screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: {
                    backgroundColor: '#000',
                },
            }}
        >
            <Stack.Screen name="RegistroScreen" component={RegistroScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="Mundo1Screen" component={Mundo1Screen} />
            <Stack.Screen name="LeccionScreen" component={LeccionScreen} />
            <Stack.Screen
                name="ResultadoLeccionScreen"
                component={ResultadoLeccionScreen}
            />
        </Stack.Navigator>
    );
}
