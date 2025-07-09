import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../components/Config';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // install expo-linear-gradient

export default function PengirimanPaketScreen() {
  const [kodeTransaksi, setKodeTransaksi] = useState('');
  const [namaPengirim, setNamaPengirim] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const res = await axios.get(`${BASE_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(res.data.id);
      } catch (error) {
        Alert.alert('Gagal memuat user', error.message);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    if (!kodeTransaksi || !namaPengirim || !nomorHp || !alamat) {
      Alert.alert('Peringatan', 'Semua field wajib diisi.');
      return;
    }

    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    try {
      await axios.post(
        `${BASE_URL}/api/simpan-paket-masuk`,
        {
          userid: userId,
          kode_transaksi: kodeTransaksi,
          nama_pengirim: namaPengirim,
          nomor_hp: nomorHp,
          alamat_pengiriman: alamat,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Sukses', 'Data pengiriman berhasil disimpan');
      setKodeTransaksi('');
      setNamaPengirim('');
      setNomorHp('');
      setAlamat('');
    } catch (err) {
      console.log(err.response?.data);
      Alert.alert('Gagal', err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#e0f7fa', '#b2ebf2']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Form Pengiriman Paket</Text>

        <View style={styles.inputGroup}>
          <Ionicons name="receipt-outline" size={20} color="#20B2AA" />
          <TextInput
            style={styles.input}
            placeholder="Kode Transaksi / Resi"
            value={kodeTransaksi}
            onChangeText={setKodeTransaksi}
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="person-outline" size={20} color="#20B2AA" />
          <TextInput
            style={styles.input}
            placeholder="Nama Pengirim"
            value={namaPengirim}
            onChangeText={setNamaPengirim}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="call-outline" size={20} color="#20B2AA" />
          <TextInput
            style={styles.input}
            placeholder="Nomor HP"
            value={nomorHp}
            onChangeText={setNomorHp}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="location-outline" size={20} color="#20B2AA" />
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Alamat Lengkap"
            value={alamat}
            onChangeText={setAlamat}
            multiline
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.buttonText}>Kirim Paket</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#00796B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});
