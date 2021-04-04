import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs'


const SCREEN_WIDTH = Dimensions.get('window').width
const CAMERA_WIDTH = SCREEN_WIDTH
const CAMERA_HEIGHT = CAMERA_WIDTH

const TensorCamera = cameraWithTensors(Camera);

function handleCameraStream(images, updatePreview, gl) {
  const loop = async () => {
    const nextImageTensor = images.next().value

    //
    // do something with tensor here
    //

    // if autorender is false you need the following two lines.
    // updatePreview();
    // gl.endFrameEXP();

    requestAnimationFrame(loop);
  }
  loop();
}

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  // const [model, setModel] = useState(null);

  useEffect(() => {
    (async () => {
      await tf.ready()
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <TensorCamera
       style={styles.camera}
       type={Camera.Constants.Type.front}

       resizeHeight={CAMERA_HEIGHT}
       resizeWidth={CAMERA_WIDTH}
       resizeDepth={3}
       onReady={handleCameraStream}
       autorender={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    width: CAMERA_WIDTH,
    height: CAMERA_HEIGHT,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});