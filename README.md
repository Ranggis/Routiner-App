<div align="center">

<!-- Banner Atas: Animasi Ombak Elegan -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=3843FF&height=300&section=header&text=ROUTINER&fontSize=90&fontAlignY=38&fontColor=ffffff&animation=fadeIn" width="100%"/>

<br/>

<!-- Logo Utama: Diperbesar & Bayangan Halus -->
<p align="center">
  <img src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/favicon.png" width="200" style="filter: drop-shadow(0 15px 30px rgba(56, 67, 255, 0.3));" />
</p>

<!-- Typing Animation: Fokus pada Value -->
<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=28&pause=1500&color=3843FF&center=true&vCenter=true&width=500&lines=The+Elite+Habit+Ecosystem;Consistency+Redefined;Built+for+Performance" alt="Typing SVG" />

<p align="center">
  <b>Aplikasi pelacak rutinitas premium yang menggabungkan kesederhanaan visual dengan kekuatan teknologi cloud.</b>
</p>

<!-- Badges Minimalis -->
<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0--Beta-3843FF?style=flat-square" />
  <img src="https://img.shields.io/badge/Platform-iOS_%7C_Android-0F172A?style=flat-square" />
  <img src="https://img.shields.io/badge/Engine-React_Native-61DAFB?style=flat-square&logo=react" />
</p>

</div>

---

## 💎 Filosofi Desain
**Routiner** lahir dari kebutuhan akan alat produktivitas yang tidak mengganggu fokus pengguna. Setiap elemen diletakkan dengan presisi untuk menciptakan harmoni antara fungsionalitas dan estetika. 

- **Clean Interface:** Mengurangi beban kognitif dengan navigasi yang intuitif.
- **Fluid Motion:** Animasi transisi yang memberikan feedback instan dan memuaskan.
- **Data Clarity:** Visualisasi statistik yang mudah dipahami dalam sekali lirik.

---

## ✨ Pengalaman Pengguna (GIF)
Antarmuka yang responsif didukung oleh *Reanimated* dan *Gesture Handler* untuk interaksi kelas atas.

<div align="center">
  <img 
    src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/RoutinerShowcase.gif" 
    width="340" 
    style="border-radius: 50px; border: 1px solid #E2E8F0; box-shadow: 0 30px 60px rgba(0,0,0,0.12);"
  />
</div>

---

## 🛠️ Arsitektur Teknologi
Sistem cerdas yang menjaga data Anda tetap aman dan dapat diakses kapan saja.

#### **Hybrid Data Management**
| Core System | Integration |
| :--- | :--- |
| **Cloud Service** | Firebase Firestore (Real-time) |
| **Local Storage** | SQLite (Offline-First Capability) |
| **Navigation** | Expo Router v3 (Strict Typing) |
| **Visualization** | Victory Native (Industrial Charts) |

---

## 🚀 Fitur Utama

- **Otomatisasi Sinkronisasi:** Logika cerdas yang menyatukan data SQLite lokal ke Cloud secara instan saat terhubung internet.
- **Interaksi Berbasis Gestur:** Kartu habit yang dapat digeser untuk efisiensi eksekusi harian.
- **Analisis Mendalam:** Grafik mingguan yang memantau perkembangan kebiasaan secara akurat.
- **Sistem Prestasi:** Akumulasi poin yang mendorong motivasi melalui Leaderboard global.

---

## 🏗️ Implementasi Kode (Clean Logic)
Contoh penanganan sinkronisasi data yang efisien:

```typescript
// Core Sync Handler
const synchronizeData = async (localData) => {
  const connection = await checkConnectivity();
  if (connection.isOnline) {
    return await firebase.sync(localData); // Push to cloud
  }
  return await sqlite.queue(localData); // Store in local queue
};
