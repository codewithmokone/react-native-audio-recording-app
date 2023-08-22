import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

function HomeScreen() {

    const [name, setName] = useState("");
    const [recording, setRecording] = useState();
    const [recordings, setRecordings] = useState([]);
    const [message, setMessage] = useState("");

   async function startRecoding() {
        try {

            const permission = await Audio.requestPermissionsAsync();
            // await Audio.requestPermissionsAsync();
            // await Audio.setAudioModeAsync({
            //     allowsRecordingIOS: true,
            //     playsInSilentModeIOS: true
            // });

            // const { recording } = await Audio.Recording.createAsync(
            //     Audio.RECORDING_OPTIONS_PRESENT_HIGH_QUALITY
            // );

            // setRecording(recording);

            if(permission.status === "granted") {
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
        } catch (err){
            console.log("Failed to start recording", err)
        }
    }

    async function stopRecording(){
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
            duration: getDurationFormatted(status.durationMillies),
            file: recording.getURI()
        });

        setRecordings(updatedRecordings);
    }

    function getDurationFormatted(millis){
        const minutes = millis / 1000 / 60;
        const minutesDisplay = Math.round(minutes);
        const seconds = Math.round((minutes - minutesDisplay) * 60);
        const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
        return `${minutesDisplay}:${secondsDisplay}`;
    }

    function getRecordingLines() {
        return recordings.map((recordingLine, index) => {
            return (
                <View key={index} style={styles.row}>
                    <Text style={styles.fill}>Recording {index + 1} - {recordingLine.duration}</Text>
                    <Button 
                        style={styles.button} 
                        onPress={() => recordingLine.sound.replayAsync()}
                        title='Play'>
                    </Button>
                </View>
            );
        });
    }

    return (
        <View style={StyleSheet.container}>
            <Text>Press start to record your message.</Text>
            <Text>{message}</Text>
            <Button
                title={recording ? 'Stop Recording' : 'Start Recording'}
                onPress={recording ? stopRecording : startRecoding}
            />
            {getRecordingLines()}
        </View>
    )
}

const styles = StyleSheet.create({
    row:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    fill: {
        flex: 1,
        margin: 16,
    },

    button: {
        margin: 16,
    }
})

export default HomeScreen