Este código es el punto de entrada principal de una aplicación React Native. A continuación, se explica cada parte del código:

### Importaciones

```javascript
import { StatusBar } from 'expo-status-bar';
import Auth from './Auth';
```

- `StatusBar`: Componente de Expo que permite controlar la barra de estado en la parte superior de la pantalla del dispositivo.
- `Auth`: Componente personalizado que maneja la autenticación de usuarios, importado desde el archivo `./Auth`.

### Función Principal `App`

```javascript
export default function App() {
  return (
    <>
      <Auth />
      <StatusBar style="auto" />
    </>
  );
}
```

- `App`: Función que define el componente principal de la aplicación.
- `return`: Retorna el JSX que define la estructura de la interfaz de usuario.
## App.js
### Estructura del JSX

```javascript
<>
  <Auth />
  <StatusBar style="auto" />
</>
```

- `<>` y `</>`: Fragmentos, que permiten agrupar varios elementos hijos sin necesidad de añadir un elemento contenedor adicional en el DOM.
- `<Auth />`: Renderiza el componente `Auth`, que contiene la lógica y la interfaz de usuario para la autenticación de usuarios.
- `<StatusBar style="auto" />`: Configura la barra de estado para que se adapte automáticamente al estilo del sistema.

### Exportación del Componente Principal

```javascript
export default App;
```

- Exporta el componente `App` como el componente principal de la aplicación, que será utilizado por el punto de entrada de la aplicación (generalmente `index.js` o `App.js` en el directorio raíz).



## Auth.js

Este código de React Native implementa una pantalla de autenticación que permite a los usuarios registrarse o iniciar sesión en una aplicación. A continuación, te explico los elementos principales:

### Importaciones

```javascript
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
```

- `React`, `useState`, `useEffect`: Importaciones necesarias para crear componentes funcionales en React y manejar estados y efectos secundarios.
- `AsyncStorage`: Biblioteca para almacenar datos de forma persistente en el dispositivo.
- `axios`: Cliente HTTP para hacer solicitudes al servidor.
- Componentes de React Native como `View`, `Text`, `TextInput`, `Button`, `StyleSheet`, `TouchableOpacity`, `Alert`.

### Estado Inicial

```javascript
const initialState = {
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
}
```

- `initialState`: Objeto que define el estado inicial del formulario de autenticación.

### Componente `Auth`

```javascript
const Auth = () => {
    const [form, setForm] = useState(initialState);
    const [isSignup, setIsSignup] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
```

- `form`: Estado que almacena los valores del formulario.
- `isSignup`: Estado que indica si el modo actual es registro (`true`) o inicio de sesión (`false`).
- `error`: Estado que almacena mensajes de error globales.
- `errors`: Estado que almacena errores específicos de los campos del formulario.

### Efecto Secundario

```javascript
useEffect(() => {
    setError(null);
}, [form]);
```

- Limpia el estado `error` cada vez que el formulario cambia.

### Manejo de Cambios en el Formulario

```javascript
const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
}
```

- Actualiza el estado del formulario cuando un campo cambia.

### Validación del Formulario

```javascript
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
```

- Valida los campos del formulario y actualiza el estado `errors`.

### Manejo de Envío del Formulario

```javascript
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
            errorMessage = error.response.data.message || 'Server error';
        } else if (error.request) {
            errorMessage = 'No response from server. Please check your network connection.';
        } else {
            errorMessage = 'Error setting up request. Please try again.';
        }

        setError(errorMessage);
    }       
}
```

- Envía los datos del formulario al servidor para registro o inicio de sesión.
- Almacena los datos de autenticación en `AsyncStorage`.
- Maneja errores y muestra alertas al usuario.

### Cambio de Modo

```javascript
const switchMode = () => {
    setIsSignup((prevIsSignup) => !prevIsSignup);
}
```

- Cambia entre el modo de registro y el modo de inicio de sesión.

### Renderizado del Componente

```javascript
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
```

- Renderiza los campos del formulario y botones para enviar y cambiar de modo.
- Muestra mensajes de error si existen.

### Estilos

```javascript
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
```

- Define los estilos para los componentes visuales.

### Exportación del Componente

```javascript
export default Auth;
```

- Exporta el componente `Auth` para ser utilizado en otras partes de la aplicación.



## backend/server.js

Este código es una implementación de un servidor de autenticación básico usando Express en Node.js. El servidor permite a los usuarios registrarse e iniciar sesión, generando un token JWT (JSON Web Token) para la autenticación. A continuación, te explico los componentes principales del código:

1. **Importación de módulos**:
    ```javascript
    const express = require('express');
    const bodyParser = require('body-parser');
    const cors = require('cors');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    ```
    - `express`: Framework para crear aplicaciones web en Node.js.
    - `bodyParser`: Middleware para analizar el cuerpo de las solicitudes HTTP.
    - `cors`: Middleware para habilitar CORS (Cross-Origin Resource Sharing).
    - `bcrypt`: Biblioteca para hashear y comparar contraseñas.
    - `jwt`: Biblioteca para generar y verificar tokens JWT (JSON Web Tokens).

2. **Inicialización de la aplicación**:
    ```javascript
    const app = express();
    const PORT = process.env.PORT || 5000;
    ```
    - `app`: Instancia de la aplicación Express.
    - `PORT`: Puerto en el que la aplicación escuchará, utilizando el valor de `process.env.PORT` si está definido, o 5000 por defecto.

3. **Configuración de middlewares**:
    ```javascript
    app.use(cors());
    app.use(bodyParser.json());
    ```
    - `cors()`: Habilita CORS para todas las rutas.
    - `bodyParser.json()`: Analiza el cuerpo de las solicitudes HTTP con formato JSON.

4. **Simulación de base de datos**:
    ```javascript
    const users = [];
    ```
    - `users`: Array que simula una base de datos de usuarios.

5. **Funciones auxiliares**:
    ```javascript
    const generateToken = (user) => {
        return jwt.sign({ userId: user.id, username: user.username }, 'secret_key', { expiresIn: '1h' });
    };

    const findUserByUsername = (username) => {
        return users.find(user => user.username === username);
    };
    ```
    - `generateToken(user)`: Genera un token JWT para el usuario proporcionado.
    - `findUserByUsername(username)`: Busca un usuario por nombre de usuario en el array `users`.

6. **Rutas**:
    - **Ruta raíz**:
        ```javascript
        app.get('/', (req, res) => {
            res.send('Hello, World!');
        });
        ```
        - Responde con "Hello, World!" cuando se accede a la ruta raíz (`/`).

    - **Ruta de registro (`/auth/signup`)**:
        ```javascript
        app.post('/auth/signup', async (req, res) => {
            const { fullName, username, password, confirmPassword, email } = req.body;

            if (findUserByUsername(username)) {
                return res.status(400).json({ message: 'El nombre de usuario ya existe' });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'Las contraseñas no coinciden' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = {
                id: users.length + 1,
                fullName,
                username,
                password: hashedPassword,
                email,
            };

            users.push(user);

            const token = generateToken(user);
            res.status(201).json({ token, userId: user.id, hashedPassword, fullName });
        });
        ```
        - Registra un nuevo usuario si el nombre de usuario no existe y las contraseñas coinciden.
        - Hashea la contraseña antes de almacenarla.
        - Genera y devuelve un token JWT.

    - **Ruta de inicio de sesión (`/auth/login`)**:
        ```javascript
        app.post('/auth/login', async (req, res) => {
            const { username, password } = req.body;

            const user = findUserByUsername(username);
            if (!user) {
                return res.status(400).json({ message: 'Nombre de usuario o contraseña no válidos' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Nombre de usuario o contraseña no válidos' });
            }

            const token = generateToken(user);
            res.status(200).json({ token, userId: user.id, hashedPassword: user.password, fullName: user.fullName });
        });
        ```
        - Inicia sesión si el nombre de usuario existe y la contraseña es válida.
        - Genera y devuelve un token JWT.

7. **Inicio del servidor**:
    ```javascript
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    ```
    - Inicia el servidor y lo hace escuchar en el puerto especificado.

Este código proporciona una base para una aplicación web con funcionalidades básicas de autenticación y manejo de usuarios, utilizando tecnologías populares en el ecosistema de Node.js.
