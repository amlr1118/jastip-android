import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../components/Config';
import { MaterialIcons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

export default function PengambilanPaketScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [paketList, setPaketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paketDetail, setPaketDetail] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchPaket = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/paket-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPaketList(response.data.data);
      //console.log(response.data.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Gagal mengambil data dari server');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailPaket = async (kodeTrans) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/detail-paket-user/${kodeTrans}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // const paket = response.data.data[0];

      const detail = response.data.data[0];
      if (detail) {
        setPaketDetail(detail);
        setModalVisible(true);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Gagal mengambil data dari server');
    }
  };

  const filteredPaketList = paketList.filter((item) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'sent') return item.dikirim === 1;
    if (filterStatus === 'pending') return item.dikirim === 0;
    if (filterStatus === 'arrived') return item.tiba === 1;
  });

  useEffect(() => {
    fetchPaket();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="local-shipping" size={26} color="#20B2AA" />
        <Text style={styles.headerText}>{item.kode_transaksi}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Pengirim:</Text>
          <Text style={styles.value}>{item.nama_pengirim}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>No HP:</Text>
          <Text style={styles.value}>{item.nomor_hp}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Alamat:</Text>
          <Text style={styles.value}>{item.alamat_pengiriman}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tgl Kirim:</Text>
          <Text style={styles.value}>{item.created_at}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text
            style={[
              styles.statusText,
              { backgroundColor: item.status === 1 ? '#2ecc71' : '#f39c12' },
            ]}>
            {item.status === 1 ? 'Sampai ke Jastip' : 'Belum Sampai'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => fetchDetailPaket(item.kode_transaksi)}
          disabled={item.dikirim !== 1}
          style={[
            styles.detailButton,
            { backgroundColor: item.dikirim === 1 ? '#20B2AA' : '#ccc' },
          ]}>
          <Text style={styles.detailButtonText}>
            {item.dikirim === 1 ? 'Lihat Detail' : 'Belum Dikirim'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>📦 Riwayat Paket Anda</Text>

      <ScrollView horizontal contentContainerStyle={styles.filterScroll}>
        {[
          { label: 'Semua', key: 'all', icon: 'list' },
          { label: 'Terkirim', key: 'sent', icon: 'check-circle' },
          { label: 'On Proses', key: 'pending', icon: 'pending-actions' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterButton,
              filterStatus === f.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(f.key)}>
            <MaterialIcons name={f.icon} size={18} color="#fff" />
            <Text style={styles.filterButtonText}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredPaketList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          {paketDetail ? (
            <>
              <Text style={styles.modalTitle}>📄 Detail Paket</Text>
              <Text style={styles.modalItem}>
                Kode: {paketDetail.kode_trans}
              </Text>
              <Text style={styles.modalItem}>
                Pengirim: {paketDetail.nama_pengirim}
              </Text>
              <Text style={styles.modalItem}>
                Berat: {paketDetail.berat} Kg
              </Text>
              <Text style={styles.modalItem}>
                Ongkir: Rp {paketDetail.ongkir}
              </Text>
              <Text style={styles.modalItem}>
                Kapal: {paketDetail.nama_kapal}
              </Text>
              <Text style={styles.modalItem}>
                Tgl Kirim: {paketDetail.created_at}
              </Text>
              <Text style={styles.modalItem}>
                Estimasi Tiba: {paketDetail.estimasi_tiba}
              </Text>
              <Text style={styles.modalItem}>
                Diterima: {paketDetail.tanggal_diambil || '-'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Tutup</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ActivityIndicator size="large" color="#00BFFF" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#20B2AA',
    textAlign: 'center',
    marginBottom: 16,
  },
  filterScroll: {
    paddingBottom: 10,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    backgroundColor: '#ccc',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    alignItems: 'center',
    height: 40, // 👈 pastikan fixed height
    minWidth: 100, // 👈 biar ukuran tidak berubah drastis
    justifyContent: 'center', // 👈 pastikan isi di tengah
  },
  filterButtonActive: {
    backgroundColor: '#20B2AA',
    // ⚠️ Jangan ubah fontSize, padding, height, dsb yang bikin beda dari default
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#20B2AA',
  },
  cardBody: {
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    color: '#555',
    width: 120,
  },
  value: {
    color: '#333',
    flex: 1,
  },
  statusText: {
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    fontWeight: 'bold',
    fontSize: 12,
  },
  detailButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#20B2AA',
  },
  modalItem: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#20B2AA',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
