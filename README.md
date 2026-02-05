<div align="center">

<!-- Animated Header Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=3843FF&height=300&section=header&text=ROUTINER&fontSize=90&fontAlignY=38&fontColor=ffffff&animation=fadeIn" width="100%"/>

<br/>

<!-- Hero Image: Ultra Large Logo with Soft Glow -->
<p align="center">
  <img src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/favicon.png" width="220" style="filter: drop-shadow(0 20px 40px rgba(56, 67, 255, 0.4));" />
</p>

<!-- Premium Typing Effect -->
<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=32&pause=1000&color=3843FF&center=true&vCenter=true&width=600&lines=Master+Your+Day.;Build+Elite+Habits.;Experience+Premium+Sync.;Track+with+Precision." alt="Typing SVG" />

<p align="center">
  <b>Arsitektur pelacak rutinitas masa depan. Menyeimbangkan estetika minimalis dengan performa <i>high-end</i>.</b>
</p>

<!-- High-End Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/Build-Stable-success?style=for-the-badge&logo=github&labelColor=0F172A&color=3843FF" />
  <img src="https://img.shields.io/badge/UX-Premium-FFD700?style=for-the-badge&logo=framer&labelColor=0F172A&color=3843FF" />
  <img src="https://img.shields.io/badge/Sync-Hybrid_Edge-3843FF?style=for-the-badge&logo=firebase&labelColor=0F172A&color=3843FF" />
</p>

</div>

---

## 💎 The Golden Triangle
Routiner dibangun di atas tiga pilar utama yang memastikan pengalaman pengguna berada di level tertinggi.

| **Intuitive Gesture** | **Hybrid Intelligence** | **Data Visualization** |
| :--- | :--- | :--- |
| Interaksi berbasis gerakan (swipe) yang memberikan respon haptik instan untuk efisiensi waktu. | Penggabungan SQLite & Firebase untuk akses data tanpa hambatan, baik online maupun offline. | Transformasi angka mentah menjadi grafik Victory yang artistik dan informatif. |

---

## ✨ Immersive Interface
Visualisasi antarmuka yang dirancang dengan presisi piksel untuk menjaga fokus dan motivasi Anda.

<div align="center">
  <img 
    src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/RoutinerShowcase.gif" 
    width="380" 
    style="border-radius: 60px; border: 12px solid #0F172A; box-shadow: 0 40px 80px rgba(0,0,0,0.2);"
  />
  <br/>
  <p><i>"Setiap elemen dirancang untuk meminimalisir hambatan antara niat dan aksi."</i></p>
</div>

---

## 🛠️ Engineered Ecosystem
Stack teknologi yang dipilih khusus untuk skalabilitas dan kecepatan eksekusi.

<div align="center">

| Area | Technologies |
| :--- | :--- |
| **Frontend Core** | `React Native` `Expo SDK 50+` `TypeScript` |
| **Animation Engine** | `Reanimated v3` `Moti` |
| **Data Layer** | `Firebase Firestore` `SQLite` `NetInfo` |
| **Navigation** | `Expo Router v3 (Typed)` |
| **Analytics** | `Victory Native` |

</div>

---

## 🚀 Fitur Inovatif

- **Zero-Latency Logging:** Dengan SQLite, pencatatan habit terjadi dalam milidetik tanpa menunggu respon server.
- **Smart Adaptive Charts:** Grafik yang menyesuaikan skala secara otomatis berdasarkan kemajuan habit mingguan Anda.
- **Mood Correlation:** Algoritma yang menghubungkan tingkat keberhasilan habit dengan kondisi emosional harian.
- **Elite Leaderboard:** Sistem kompetisi global yang adil berbasis poin prestasi terverifikasi.

---

## 🏗️ Technical Preview: The Sync Logic
Bagaimana kami menangani sinkronisasi data secara elegan tanpa merusak performa UI:

```typescript
// Optimized Background Sync Handler
async function pushToCloud(localData: Habit[]) {
  const isOnline = await checkInternet();
  if (!isOnline) return queueForLater(localData);

  try {
    await firestore().batchUpdate(localData);
    await sqlite().markAsSynced(localData.ids);
  } catch (syncError) {
    handleConflictGracefully(syncError);
  }
}
```
