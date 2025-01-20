import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { Audio } from "expo-av";
import { Picker } from "@react-native-picker/picker";

export default function TimerWithMusic() {
  const [totalSeconds, setTotalSeconds] = useState(30);
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [seconds, setSeconds] = useState("30");
  const [isRunning, setIsRunning] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const hoursArray = Array.from({ length: 12 }, (_, i) => i.toString());
  console.log(hoursArray);
  const minutesArray = Array.from({ length: 60 }, (_, i) => i.toString());
  const secondsArray = Array.from({ length: 60 }, (_, i) => i.toString());

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => prev - 1);
      }, 1000);
    } else if (totalSeconds === 0) {
      setIsRunning(false);
      stopMusic();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, totalSeconds]);

  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error("Error setting audio mode:", error);
      }
    };

    initAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    const totalSecs =
      parseInt(hours, 10) * 3600 +
      parseInt(minutes, 10) * 60 +
      parseInt(seconds, 10);

    if (totalSecs > 0) {
      setTotalSeconds(totalSecs);
      setIsRunning(true);
      playMusic();
    } else {
      alert("Please set a time greater than 0");
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setHours("0");
    setMinutes("0");
    setSeconds("30");
    setTotalSeconds(30);
    stopMusic();
  };

  const playMusic = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../assets/sample.mp3"),
        { isLooping: true, shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error("Error loading or playing sound:", error);
    }
  };

  const stopMusic = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
    } catch (error) {
      console.error("Error stopping sound:", error);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <Text className="text-5xl font-bold mb-5">
        {formatTime(totalSeconds)}
      </Text>

      {!isRunning && (
        <View className="flex-row justify-center items-center mb-5">
          <View className="items-center mx-2.5">
            <Text className="text-base mb-1">Hours</Text>
            <Picker
              style={{ width: 100, height: 150 }}
              selectedValue={hours}
              onValueChange={setHours}
              selectionColor="#fcba03"
            >
              {hoursArray.map((value) => (
                <Picker.Item key={value} label={value} value={value} />
              ))}
            </Picker>
          </View>

          <View className="items-center mx-2.5">
            <Text className="text-base mb-1">Minutes</Text>
            <Picker
              style={{ width: 100, height: 150 }}
              selectedValue={minutes}
              onValueChange={setMinutes}
            >
              {minutesArray.map((value) => (
                <Picker.Item key={value} label={value} value={value} />
              ))}
            </Picker>
          </View>

          <View className="items-center mx-2.5">
            <Text className="text-base mb-1">Seconds</Text>
            <Picker
              style={{ width: 100, height: 150 }}
              selectedValue={seconds}
              onValueChange={setSeconds}
            >
              {secondsArray.map((value) => (
                <Picker.Item key={value} label={value} value={value} />
              ))}
            </Picker>
          </View>
        </View>
      )}

      <View className="mt-5">
        {!isRunning ? (
          <Button title="Start Timer" onPress={startTimer} />
        ) : (
          <Button title="Reset Timer" onPress={resetTimer} />
        )}
      </View>
    </View>
  );
}
