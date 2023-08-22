import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

function HomeScreen() {

    const [name, setName] = useState("");
    const [recording, setRecording] = useState();
    const [recordings, setRecordings] = useState([]);
    const [message, setMessage] = useState("");
    const [editingIndex, setEditingIndex] = useState(-1);

    useEffect(() => {
        // Load saved recordings when the components mount
        loadRecordings();
    }, [])

    // Handles the recording function
    async function startRecoding() {
        try {

            const permission = await Audio.requestPermissionsAsync();

            if (permission.status === "granted") {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });

                const { recording } = await Audio.Recording.createAsync(
                    Audio.RECORDING_OPTIONS_PRESENT_HIGH_QUALITY
                );

                setRecording(recording);
            } else {
                setMessage("Please grant permission to app to access microphone");
            }
        } catch (err) {
            console.log("Failed to start recording", err)
        }
    }

    // Handles the stop recording function
    async function stopRecording() {
        setRecording(undefined);
        // await recording.stopRecordingAsync();
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync(
            {
                allowsRecordingIOS: false,
            }
        )

        let updatedRecordings = [...recordings];
        const { sound, status } = await recording.createNewLoadedSoundAsync();
        updatedRecordings.push({
            sound: sound,
            duration: getDurationFormatted(status.durationMillis),
            file: recording.getURI(),
            name: name
        });

        setRecordings(updatedRecordings);
        setRecording(null);
        setName('')

        // Save recordings to AsyncStorage
        await saveRecordings([...recordings, {
            sound: recording.getURI(),
            duration: getDurationFormatted(status.durationMillis),
            file: recording.getURI(),
        }]);
    }

    // Handles the recording duration
    function getDurationFormatted(millis) {
        const minutes = millis / 1000 / 60;
        const minutesDisplay = Math.round(minutes);
        const seconds = Math.round((minutes - minutesDisplay) * 60);
        const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
        return `${minutesDisplay}:${secondsDisplay}`;
    }

    // Handles the delete recording function
    async function deleteRecording(index) {
        const updatedRecordings = recordings.filter((_, i) => i !== index);
        setRecordings(updatedRecordings);

        // Save updated recordings to AsyncStorage
        await saveRecordings(updatedRecordings);
    }

    // Handles the stored recordings view
    function getRecordingLines() {
        return recordings.map((recordingLine, index) => {
            return (
                <View key={index} style={styles.row}>
                    <Text style={styles.fill}>{recordingLine.name} - {recordingLine.duration}</Text>
                    <Button
                        style={styles.button}
                        onPress={() => recordingLine.sound.replayAsync()}
                        title='Play'
                    />
                    {
                        editingIndex === index ? (
                            <View>
                                <Button
                                    style={styles.button}
                                    title='Save'
                                    onPress={() => updateRecording(index)}
                                />
                            </View>
                        ) : (
                            <View>
                                <Button
                                    style={styles.button}
                                    title='Edit'
                                    onPress={() => editRecordingName(index)}
                                />
                            </View>
                        )
                    }
                    <Button
                        style={styles.button}
                        onPress={() => deleteRecording(index)}
                        title='Delete'
                    />
                </View>
            );
        });
    }

    // Handles the edit functionality
    function editRecordingName(index) {
        setEditingIndex(index);
        setName(recordings[index].name);
    }

    // Handles the update functionality
    async function updateRecording(index) {
        const updatedRecordings = [...recordings];
        updatedRecordings[index].name = name;
        setRecordings(updatedRecordings);
        setEditingIndex(-1);

        // Save updated recordings to AsyncStorage
        await saveRecordings(updatedRecordings);
    }

    // Saving the recording to AsyncStorage
    async function saveRecordings(recordings) {
        try {
            await AsyncStorage.setItem('recordings', JSON.stringify(recordings));
        } catch (err) {
            console.log('Error saving recordings', err)
        }
    }

    // Loading the recording from AsyncStorage
    async function loadRecordings() {
        try {
            const storedRecordings = await AsyncStorage.getItem('recordings');
            if (storedRecordings) {
                setRecordings(JSON.parse(storedRecordings));
            }
        } catch (err) {
            console.log('Error loading recordings', err)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer} >
                <Text>Audio Recording App</Text>
            </View>
            <View style={styles.headingContainer}>
                <Text>Press start to record your message.</Text>

                <Text>{message}</Text>

                <Text style={styles.recordingTitle}>Recording title:</Text>
                <TextInput
                    style={styles.input}
                    placeholder=' Recording Name'
                    value={name}
                    onChangeText={setName}
                />
                <Button
                    title={recording ? 'Stop Recording' : 'Start Recording'}
                    onPress={recording ? stopRecording : startRecoding}
                />
            </View>
            <View style={styles.inputSection}>

            </View>
            <View >
                {getRecordingLines()}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoContainer: {
        width: 390,
        height: 40,
        backgroundColor: 'black',
        alignItems: 'center',
    },

    headingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30
    },

    recordingTitle: {
        margin: 10,
        fontWeight: 'bold'
    },

    input: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'ivory',
        width: 200,
        height: 30,
        marginBottom: 10
    },

    row: {
        backgroundColor: 'ivory',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 350,
        margin: 5,
        borderRadius: 5
    },

    fill: {
        flex: 1,
        margin: 16,
    },

    button: {
        width: 10,
        margin: 16,
    },

    inputSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
})

export default HomeScreen