import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import Contacts from 'react-native-contacts';
import Permissions from 'react-native-permissions';

const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [permissionStatus, setPermissionStatus] = useState('');

    useEffect(() => {
        checkPermission();
    }, []);

    const checkPermission = async () => {
        const status = await Permissions.check('contacts');
        setPermissionStatus(status);

        if (status === 'authorized') {
            loadContacts();
        } else if (status === 'denied') {
            requestPermission();
        }
    };

    const requestPermission = async () => {
        const status = await Permissions.request('contacts');
        setPermissionStatus(status);

        if (status === 'authorized') {
            loadContacts();
        }
    };

    const loadContacts = () => {
        Contacts.getAll((err, contacts) => {
            if (err) {
                console.error(err);
                return;
            }
            setContacts(contacts);
        });
    };

    const renderContact = ({ item }) => (
        <View style={styles.contactContainer}>
            <Text style={styles.contactName}>{item.givenName} {item.familyName}</Text>
            {item.phoneNumbers.map((phone, index) => (
                <Text key={index} style={styles.contactPhone}>{phone.number}</Text>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text>Contact List</Text>
            {permissionStatus === 'authorized' ? (
                <FlatList
                    data={contacts}
                    renderItem={renderContact}
                    keyExtractor={(item) => item.recordID}
                />
            ) : (
                <View>
                    <Text>Permission to access contacts is required.</Text>
                    <Button title="Request Permission" onPress={requestPermission} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    contactContainer: {
        marginBottom: 20,
    },
    contactName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    contactPhone: {
        fontSize: 16,
    },
});

export default ContactList;