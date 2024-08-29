import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const initialState = {
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
}

const Auth = () => {
    const [form, setForm] = useState(initialState);
    const [isSignup, setIsSignup] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setError(null);
    }, [form]);

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
    }

    const validateForm = () => {
        const errors = {};
        if (!form.username) {
            errors.username = 'El nombre de usuario es obligatorio';
        }
        if (!form.password) {
            errors.password = 'Se requiere contraseña';
        }
        if (isSignup) {
            if (!form.fullName) {
                errors.fullName = 'Se requiere nombre completo';
            }
            if (!form.email) {
                errors.email = 'Se requiere correo electrónico';
            } else if (!/\S+@\S+\.\S+/.test(form.email)) {
                errors.email = 'La dirección de correo electrónico no es válida';
            }
            if (!form.confirmPassword) {
                errors.confirmPassword = 'Se requiere confirmar contraseña';
            } else if (form.password !== form.confirmPassword) {
                errors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        const { username, password, confirmPassword, email } = form;
        const URL = 'http://10.0.2.2:5000/auth';
        
        if (!validateForm()) {
            return;
        }

        try {
            const { data } = await axios.post(`${URL}/${isSignup ? 'signup' : 'login'}`, {
                username, password, confirmPassword, fullName, email,
            });
    
            const { token, userId, hashedPassword, fullName } = data;
    
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('username', username);
            await AsyncStorage.setItem('fullName', fullName);
            await AsyncStorage.setItem('userId', String(userId));
    
            if(isSignup) {
                await AsyncStorage.setItem('email', email);
                await AsyncStorage.setItem('hashedPassword', hashedPassword);
            }

            Alert.alert('Éxito', 'Usuario creado exitosamente: ');
        } catch (error) {
            console.error('Error during authentication:', error);
            let errorMessage = 'An error occurred';

            if (error.response) {
                // El servidor respondió con un estado fuera del rango 2xx
                errorMessage = error.response.data.message || 'Server error';
            } else if (error.request) {
                // La solicitud fue hecha pero no se recibió respuesta
                errorMessage = 'No response from server. Please check your network connection.';
            } else {
                // Algo sucedió en la configuración de la solicitud que provocó un error
                errorMessage = 'Error setting up request. Please try again.';
            }

            setError(errorMessage);
        }       
    }

    const switchMode = () => {
        setIsSignup((prevIsSignup) => !prevIsSignup);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isSignup ? 'Crea una cuenta' : 'Iniciar sesión'}</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {isSignup && (
                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre completo"
                        onChangeText={(value) => handleChange('fullName', value)}
                        value={form.fullName}
                    />
                    {errors.fullName && <Text style={styles.errorTextInput}>{errors.fullName}</Text>}
                </View>
            )}
            <View>
                <TextInput
                    style={styles.input}
                    placeholder="Nombre de usuario"
                    onChangeText={(value) => handleChange('username', value)}
                    value={form.username}
                />
                {errors.username && <Text style={styles.errorTextInput}>{errors.username}</Text>}
            </View>
            {isSignup && (
                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        value={form.email}
                        onChangeText={(value) => handleChange('email', value)}
                        keyboardType="email-address"
                    />
                    {errors.email && <Text style={styles.errorTextInput}>{errors.email}</Text>}
                </View>
            )}
            <View>
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    secureTextEntry
                    onChangeText={(value) => handleChange('password', value)}
                    value={form.password}
                />
                {errors.password && <Text style={styles.errorTextInput}>{errors.password}</Text>}
            </View>
            {isSignup && (
                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="Confirmar Contraseña"
                        secureTextEntry
                        onChangeText={(value) => handleChange('confirmPassword', value)}
                        value={form.confirmPassword}
                    />
                    {errors.confirmPassword && <Text style={styles.errorTextInput}>{errors.confirmPassword}</Text>}
                </View>
            )}
            <Button title={isSignup ? "Crear cuenta" : "Entrar"} onPress={handleSubmit}/>
            
            <View style={styles.row}>
                <Text style={styles.question}>¿Ya tienes una cuenta? </Text>
                <TouchableOpacity onPress={switchMode}>
                    <Text style={styles.link}>
                        {isSignup
                            ? "Iniciar sesión"
                            : "Regístrate"
                        }
                    </Text>
                </TouchableOpacity>
            </View>        
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    errorText: {
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 10,
    },
    errorTextInput: {
        color: '#FF3B30',
        marginTop: -10,
        marginBottom: 10,
        marginLeft: 10,
    },
    link: {
        color: '#007AFF',
        textAlign: 'center',
        fontSize: 16,
    },
    question: {
        textAlign: 'center',
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
});

export default Auth;