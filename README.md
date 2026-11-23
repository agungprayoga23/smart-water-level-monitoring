# HYDRO-FLOW // Smart Water Level & Pump SCADA Dashboard

Dashboard monitoring level air dan kontrol pompa berbasis IoT dengan desain industri SCADA (Google Stitch UI). Terintegrasi secara real-time dengan **ESP32 (Simulasi Wokwi)** melalui **Firebase Realtime Database**.

---

## 🛠️ Teknologi yang Digunakan

* **Frontend Framework:** React 18 + Vite 5
* **Styling:** Tailwind CSS (Dark Navy SCADA Theme)
* **IoT Hardware / Simulator:** ESP32 (Wokwi Simulator) + Sensor Ultrasonik HC-SR04
* **Backend Cloud Database:** Firebase Realtime Database
* **Icons & Fonts:** Material Symbols, Google Fonts (*Space Grotesk*, *Inter*, *JetBrains Mono*)

---

## 🚀 Fitur Utama

1. **Pemantauan Level Air Real-Time (`/level_air/value`)**:
   * Menampilkan ketinggian air dalam satuan **cm**.
   * Animasi tangki kaca 3D (*glassmorphism*) dengan simulasi gelombang cairan dinamis.
2. **Kondisi Air (`/Level_sensor/condition`)**:
   * Deteksi otomatis status kondisi: **Rendah**, **Sedang**, atau **Tinggi**.
   * Evaluasi otomasi logika tangga PLC (*Ladder Rule*).
3. **Status Pompa P-01 (`/historyData`)**:
   * Membaca status riwayat pompa: **MENYALA (ON)** atau **STANDBY (OFF)**.
   * Animasi putaran rotor mekanis saat pompa aktif.
4. **Grafik Tren Sensor (Sparkline)**:
   * Menggambar kurva fluktuasi sensor berdasarkan deret data historis aktual.
5. **Tabel Riwayat Aktivitas & Event Log**:
   * Log data real-time dengan filter kategori (*Semua*, *Pompa*, *Alarm*).
6. **Desain Responsif**:
   * Tampilan optimal untuk Desktop SCADA console dan Mobile Smartphone (dengan bilah navigasi inspeksi bawah).

---

## 💻 Cara Menjalankan Proyek Secara Lokal

### Prasyarat
* [Node.js](https://nodejs.org/) (versi 18 ke atas)

### Langkah Menjalankan:
1. Clone repositori ini atau download source code:
   ```bash
   git clone https://github.com/USERNAME/REPO-NAME.git
   cd REPO-NAME
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembang:
   ```bash
   npm run dev
   ```
4. Buka peramban di `http://localhost:3000/`.

---

## 📡 Konfigurasi Firebase

Konfigurasi koneksi Firebase berada pada berkas `src/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "project-monitoring-pompa.firebaseapp.com",
  databaseURL: "https://project-monitoring-pompa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "project-monitoring-pompa",
  storageBucket: "project-monitoring-pompa.firebasestorage.app",
  messagingSenderId: "362022908243",
  appId: "..."
};
```
