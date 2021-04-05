import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { fetch, decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { Camera } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs'
import * as cocossd from '@tensorflow-models/coco-ssd'


const SCREEN_WIDTH = Dimensions.get('window').width
const multiple = 4.0
const CAMERA_WIDTH = multiple * Math.ceil(SCREEN_WIDTH/multiple)
const CAMERA_HEIGHT = CAMERA_WIDTH

const TensorCamera = cameraWithTensors(Camera);

let textureDims;
if (Platform.OS === 'ios') {
 textureDims = {
   height: 1920,
   width: 1080,
 };
} else {
 textureDims = {
   height: 1200,
   width: 1600,
 };
}

const tensorDims = {width: 152, height: 200}

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  // const [type, setType] = useState(Camera.Constants.Type.back);
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState({
    score: null,
    class: null
  });

  useEffect(() => {
    (async () => {
      await tf.ready()
      const model = await cocossd.load()
      setModel(model)
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  function handleCameraStream(images, updatePreview, gl) {
    const loop = async () => {
      const nextImageTensor = images.next().value
      await getPrediction(nextImageTensor)
      tf.dispose(nextImageTensor)
      requestAnimationFrame(loop);
    }
    loop();
  }

  const getPrediction = async (tensor) => {
    if (!tensor) return
    const prediction = await model.detect(tensor)
    if (!prediction || prediction.length === 0) return
    const topPrediction = prediction[0]
    if (topPrediction.score > 0.2) {
      setPrediction(topPrediction)
    }
  }

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
       cameraTextureHeight={textureDims.height}
       cameraTextureWidth={textureDims.width}
       resizeHeight={tensorDims.height}
       resizeWidth={tensorDims.width}
       resizeDepth={3}
       onReady={handleCameraStream}
       autorender={true}
      />
      <Text>Score: {prediction.score}</Text>
      <Text>Class: {prediction.class}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
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