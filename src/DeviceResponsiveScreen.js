// src/DeviceResponsiveScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

const DeviceResponsiveScreen = () => {
  const [orientation, setOrientation] = useState('PORTRAIT');
  const [deviceType, setDeviceType] = useState('PHONE');
  const [deviceName, setDeviceName] = useState('');

  // 画面サイズ・向きを監視
  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'LANDSCAPE' : 'PORTRAIT');
    };

    Dimensions.addEventListener('change', updateOrientation);
    updateOrientation();

    return () => {
      Dimensions.removeEventListener('change', updateOrientation);
    };
  }, []);

  // デバイス情報を取得
  useEffect(() => {
    const fetchDeviceInfo = async () => {
      const name = await DeviceInfo.getDeviceName();
      const isTablet = DeviceInfo.isTablet();
      setDeviceName(name);
      setDeviceType(isTablet ? 'TABLET' : 'PHONE');
    };

    fetchDeviceInfo();
  }, []);

  // OSごとのスタイル
  const platformStyle = Platform.OS === 'ios' ? styles.ios : styles.android;

  return (
    <SafeAreaView style={[styles.container, platformStyle]}>
      <Text style={styles.title}>デバイス対応サンプル</Text>
      <Text>OS: {Platform.OS}</Text>
      <Text>端末: {deviceName}</Text>
      <Text>タイプ: {deviceType}</Text>
      <Text>画面向き: {orientation}</Text>

      {deviceType === 'TABLET' && (
        <View style={styles.tabletBox}>
          <Text>タブレット専用UI</Text>
        </View>
      )}

      {deviceType === 'PHONE' && orientation === 'LANDSCAPE' && (
        <View style={styles.landscapeBox}>
          <Text>スマホ横向きUI</Text>
        </View>
      )}

      {deviceType === 'PHONE' && orientation === 'PORTRAIT' && (
        <View style={styles.portraitBox}>
          <Text>スマホ縦向きUI</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  ios: {
    backgroundColor: '#f0f8ff',
  },
  android: {
    backgroundColor: '#ffe4e1',
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
  },
  tabletBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#aaf0d1',
    borderRadius: 10,
  },
  landscapeBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#ffd700',
    borderRadius: 10,
  },
  portraitBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#87ceeb',
    borderRadius: 10,
  },
});

export default DeviceResponsiveScreen;
