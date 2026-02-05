<div align="center">

<!-- Hero Banner Premium -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=3843FF&height=280&section=header&text=ROUTINER&fontSize=80&fontAlignY=35&fontColor=ffffff" width="100%"/>

<!-- Typing Animation -->
<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=35&pause=1000&color=3843FF&center=true&vCenter=true&width=600&lines=Master+Your+Consistency;Premium+Habit+Tracker;Seamless+Cloud+Sync;Aesthetic+Data+Visualization" alt="Typing SVG" />

<p align="center">
  <img src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/routiner-logo.png" width="120" style="filter: drop-shadow(0 0 20px rgba(56, 67, 255, 0.4)); border-radius: 30px;" />
</p>

# Routiner: Elite Habit Ecosystem
**Transformasi Kebiasaan Menjadi Prestasi dengan UI/UX Berstandar Dunia**

---

<p align="center">
  <a href="#-fitur-utama">
    <img src="https://img.shields.io/badge/EXPLORE_FEATURES-0F172A?style=for-the-badge&logo=rocket&logoColor=ffffff&labelColor=3843FF&color=0F172A" />
  </a>
  <a href="https://github.com/Ranggis/routiner/stargazers">
    <img src="https://img.shields.io/github/stars/Ranggis/routiner?style=for-the-badge&color=3843FF&labelColor=0F172A&logo=github" />
  </a>
</p>

<img src="https://img.shields.io/badge/React_Native-v0.7x-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Firebase-Integrated-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
<img src="https://img.shields.io/badge/SQLite-Offline_First-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-v5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />

</div>

## 📌 Visi Proyek
**Routiner** bukan sekadar pelacak kebiasaan biasa. Ini adalah asisten produktivitas premium yang menggabungkan **Psikologi Kebiasaan** dengan **Teknologi Modern**. Dibangun di atas fondasi React Native, Routiner menawarkan antarmuka yang sangat responsif, sistem poin yang kompetitif, dan arsitektur data yang cerdas untuk memastikan setiap kemajuan Anda tercatat, baik saat online maupun offline.

---

## 📸 Antarmuka Eksklusif
Setiap piksel dirancang untuk memotivasi. Transisi antar layar dioptimalkan menggunakan *Reanimated* untuk pengalaman yang benar-benar *seamless*.

<div align="center">
  <br/>
  <p align="center">
    <img 
      src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/RoutinerShowcase.gif" 
      width="320" 
      style="border-radius: 45px; border: 10px solid #0F172A; filter: drop-shadow(0 25px 60px rgba(56, 67, 255, 0.4));"
    />
  </p>
  <br/>
  <kbd><b>Verified Premium Experience v1.0.0</b></kbd>
</div>

---

## 🚀 Fitur Unggulan

| Fitur | Deskripsi | Status |
| :--- | :--- | :--- |
| 🔄 **Hybrid Sync Engine** | Sinkronisasi dua arah antara **SQLite (Lokal)** dan **Firebase (Cloud)**. | `Stabil` |
| 👆 **Gesture-Driven Cards** | Swipe ke kanan untuk *Done*, ke kiri untuk *Fail/Skip* dengan feedback haptik. | `Stabil` |
| 📊 **Victory Analytics** | Visualisasi progres mingguan dan bulanan yang elegan. | `Stabil` |
| 🏆 **Global Leaderboard** | Bersaing dengan user lain melalui akumulasi poin prestasi. | `Stabil` |
| 🌗 **Dynamic Mood Tracker** | Pantau korelasi antara kebiasaan harian dan kondisi emosional Anda. | `Stabil` |

---

## 🛠️ Tech Stack & Architecture

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,ts,firebase,sqlite,vscode,git,github,figma" />
</div>

- **Core:** React Native (SDK 50+) dengan TypeScript
- **Database:** Firebase Firestore (Real-time Cloud) & SQLite (Local Storage)
- **Navigation:** Expo Router (File-based routing)
- **Charts:** Victory Native (Classic Engine)
- **Gestures:** React Native Gesture Handler (Swipeable Components)
- **Animation:** Reanimated v3

---

## 🏗️ Arsitektur Data: Sync Engine Logic
Routiner mengimplementasikan arsitektur **Offline-First**. Data disimpan secara instan ke SQLite lokal sebelum di-antrekan ke Firebase untuk memastikan aplikasi tetap responsif meskipun koneksi internet tidak stabil.

```typescript
// Konsep Logic Sinkronisasi
if (isOnline) {
  const localUnsynced = await db.getUnsyncedHabits(); // Ambil data dari SQLite
  await firebase.batchUpdate(localUnsynced);         // Push ke Cloud
  await db.markAsSynced();                           // Tandai di Lokal
} else {
  await db.saveLocally();                            // Simpan di Lokal (sync_status: 0)
}
