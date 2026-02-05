<div align="center">

<!-- Animated Premium Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=3843FF&height=320&section=header&text=ROUTINER&fontSize=95&fontAlignY=38&fontColor=ffffff&animation=twinkling" width="100%"/>

<br/>

<!-- Ultra Scale Glowing Logo -->
<p align="center">
  <img src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/favicon.png" width="240" style="filter: drop-shadow(0 25px 50px rgba(56, 67, 255, 0.4));" />
</p>

<!-- Dynamic Innovation Typing SVG -->
<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=800&size=34&pause=1000&color=3843FF&center=true&vCenter=true&width=600&lines=Cloud-Native+Habit+Ecosystem.;Instant+Real-time+Sync.;Minimalist+Premium+UX.;Data+Driven+Consistency." alt="Typing SVG" />

<p align="center">
  <font size="4" color="#64748B">Evolusi pelacak rutinitas berbasis <b>Cloud-Native</b>. Dibangun untuk presisi, didesain untuk kenyamanan.</font>
</p>

<br/>

<!-- Modern Tech Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/Sync-Firebase_Real--time-FFCA28?style=for-the-badge&logo=firebase&logoColor=0F172A" />
  <img src="https://img.shields.io/badge/Logic-Strict_TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Motion-Reanimated_3-3843FF?style=for-the-badge&logo=framer&logoColor=white" />
</p>

</div>

---

## 💎 Filosofi: "Simplicity in Motion"
**Routiner** membuang semua kerumitan teknis. Kami menghadirkan antarmuka yang bernapas, di mana setiap transisi adalah informasi, dan setiap data adalah motivasi. 

- **Full Cloud Integration:** Tanpa jeda, tanpa muat ulang. Data Anda hidup di awan dan sinkron secara atomik.
- **Gesture-First Design:** Interaksi haptik yang intuitif, memungkinkan Anda fokus pada rutinitas, bukan pada aplikasi.
- **Victory Visualizer:** Analisis mendalam yang disajikan secara artistik melalui mesin grafik Victory.

---

## 🎬 Immersive Showcase
Antarmuka yang menggabungkan keanggunan visual dengan kecepatan akses data Firestore.

<div align="center">
  <br/>
  <img 
    src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/RoutinerShowcase.gif" 
    width="420" 
    style="border-radius: 65px; border: 12px solid #0F172A; filter: drop-shadow(0 60px 100px rgba(56, 67, 255, 0.2));"
  />
  <br/><br/>
  <p><i>"Setiap piksel memiliki tujuan, setiap gerakan memiliki makna."</i></p>
</div>

---

## 🚀 Fitur Inovatif & Cloud Intelligence

| Inovasi | Deskripsi Arsitektur |
| :--- | :--- |
| **⚡ Instant Auth Flow** | Sistem verifikasi email otomatis dengan *Real-time Polling* tanpa interaksi manual. |
| **🏆 Live Leaderboard** | Agregasi poin prestasi pengguna secara instan melalui sistem *Firestore Watcher*. |
| **👆 Swipe-to-Track** | Mekanisme *Gesture Handler* premium untuk eksekusi habit (Done, Fail, Skip) yang memuaskan. |
| **📈 Mood-Habit Link** | Visualisasi korelasi antara kondisi emosional dengan tingkat kedisiplinan harian. |

---

## 🛠️ The Elite Stack
Ekosistem pengembangan yang menjamin performa tinggi dan skalabilitas sistem.

<div align="center">

| Core Framework | Cloud Infrastructure | UI & Motion |
| :---: | :---: | :---: |
| `React Native` `Expo 50+` | `Firebase Authentication` | `Moti` `Reanimated v3` |
| `TypeScript 5` `ESLint` | `Cloud Firestore DB` | `Lucide` `Feather Icons` |

</div>

---

## 🏗️ Kode Bersih: Reactive Real-time Sync
Routiner menggunakan pola **On-Snapshot Listener** untuk memastikan UI selalu mencerminkan status database terbaru tanpa *delay*.

```typescript
// Implementasi Live Listener untuk Sinkronisasi Tanpa Batas
const syncHabitStream = (uid: string) => {
  return firestore()
    .doc(`users/${uid}`)
    .collection('habits')
    .onSnapshot((liveDocs) => {
       const updatedHabits = liveDocs.docs.map(h => h.data());
       dispatchToUI(updatedHabits); // UI Ter-update secara Instan
    });
};
```

---

## 📥 Panduan Instalasi
Mulai pengalaman premium Routiner dalam hitungan menit.

```Bash
# 1. Duplikasi Repositori
git clone https://github.com/Ranggis/routiner.git

# 2. Instalasi Dependensi Eksklusif
npm install

# 3. Jalankan Engine
npx expo start
```

---

## 👤 The Architect
<div align="center"> <!-- Card Wrapper Clean & Single Border --> <div style=" width: 100%; max-width: 520px; background: #ffffff; border-radius: 16px; padding: 28px; margin-top: 25px; border: 1px solid #d1d5db; box-shadow: 0 4px 18px rgba(0,0,0,0.10); font-family: 'Inter', sans-serif; text-align: left; "> <!-- Header Accent Line --> <div style=" height: 6px; width: 60px; background: #3843FF; border-radius: 10px; margin-bottom: 25px; "></div> <table border="0" cellspacing="0" cellpadding="0" width="100%"> <tr> <!-- IMAGE --> <td width="150" align="center"> <img src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/ranggisss.jpg" width="130" style="border-radius: 22px; filter: grayscale(100%) contrast(110%); border: 3px solid #3843FF;" /> </td>

  <!-- TEXT CONTENT -->
  <td style="padding-left: 25px;">
    <div style="font-size: 26px; font-weight: 700; color: #1E293B;">
      M. Ranggis Refaldi
    </div>

    <div style="font-size: 15px; font-weight: 600; color: #3843FF; margin-top: 3px;">
      Lead Product Engineer & Designer
    </div>

    <div style="font-size: 13px; color: #94A3B8; margin-top: 5px;">
      Universitas Nusa Putra • Sukabumi
    </div>

    <!-- Badges -->
    <div style="margin-top: 14px;">
      <a href="https://github.com/Ranggis">
        <img src="https://img.shields.io/badge/REPO-000?style=for-the-badge&logo=github&logoColor=white" />
      </a>

      <a href="https://instagram.com/ranggiss" style="margin-left: 6px;">
        <img src="https://img.shields.io/badge/SOCIAL-E4405F?style=for-the-badge&logo=instagram&logoColor=white" />
      </a>
    </div>
  </td>
</tr>

</table> </div> <!-- Footer --> <br/> <img src="https://capsule-render.vercel.app/api?type=waving&color=3843FF&height=100&section=footer" width="100%"/> <p><i>"Code with passion, build with purpose, live with routine."</i></p> </div>
