<div align="center">

<!-- Banner Atas: Elevasi Maksimal -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=3843FF&height=320&section=header&text=ROUTINER&fontSize=95&fontAlignY=38&fontColor=ffffff&animation=twinkling" width="100%"/>

<br/>

<!-- Hero Image: Ultra Scale Logo dengan Efek Kedalaman -->
<p align="center">
  <img src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/favicon.png" width="240" style="filter: drop-shadow(0 30px 60px rgba(56, 67, 255, 0.5));" />
</p>

<!-- Typing SVG: Kalimat yang lebih kuat -->
<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=800&size=34&pause=1000&color=3843FF&center=true&vCenter=true&width=600&lines=Evolve+Your+Routine.;Real-time+Cloud+Ecosystem.;Minimalist+Complexity.;Designed+for+the+1%25." alt="Typing SVG" />

<p align="center">
  <font size="4" color="#64748B">Arsitektur pelacak kebiasaan berbasis <b>Cloud-Native</b> yang dirancang untuk memberikan feedback instan tanpa hambatan visual.</font>
</p>

<br/>

<!-- Badges Terorganisir -->
<p align="center">
  <img src="https://img.shields.io/badge/Real--time-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=0F172A" />
  <img src="https://img.shields.io/badge/Logic-Strict_TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/UI-Aesthetic_Luxury-3843FF?style=for-the-badge&logo=framer&logoColor=white" />
</p>

</div>

---

## 🌌 Filosofi: "The Power of Less"
**Routiner** menghilangkan kebisingan fungsional. Kami hanya menyisakan apa yang benar-benar Anda butuhkan untuk membangun disiplin baja. 

- **Cloud-Driven:** Setiap perubahan disinkronkan secara atomik ke Firebase dalam milidetik.
- **Micro-Interactions:** Respon visual yang halus pada setiap geseran jari untuk menciptakan kepuasan psikologis.
- **Victory Analytics:** Menggunakan mesin render Victory untuk menyajikan data seakurat mungkin.

---

## 🎬 Cinematic Showcase
Eksplorasi antarmuka yang menggabungkan transparansi *Glassmorphism* dengan navigasi *Native Stack*.

<div align="center">
  <br/>
  <img 
    src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/RoutinerShowcase.gif" 
    width="400" 
    style="border-radius: 60px; border: 1px solid #E2E8F0; filter: drop-shadow(0 50px 100px rgba(56, 67, 255, 0.15));"
  />
  <br/><br/>
  <p><i>"Desain bukan hanya tentang apa yang Anda lihat, tapi bagaimana Anda merasa berdaya karenanya."</i></p>
</div>

---

## 🚀 Fitur Inti Cloud

| Kapabilitas | Penjelasan Teknikal |
| :--- | :--- |
| **Instant Polling** | Sistem verifikasi email otomatis yang mendeteksi status user tanpa perlu memuat ulang halaman. |
| **Global Leaderboard** | Agregasi data poin antar pengguna secara real-time melalui Firestore Listener. |
| **Adaptive Habit Cards** | Kartu dinamis dengan sistem gestur (Swipeable) untuk efisiensi eksekusi harian. |
| **Emotion Analysis** | Tracking korelasi *Mood-to-Habit* untuk pemahaman mendalam tentang produktivitas personal. |

---

## 🛠️ High-Performance Stack
Ekosistem pengembangan yang menjamin kecepatan dan keandalan data.

<div align="center">

| Core Framework | Cloud Provider | Animation & UI |
| :---: | :---: | :---: |
| **React Native / Expo** | **Firebase Cloud Service** | **Moti / Reanimated 3** |
| **TypeScript 5.x** | **Firestore Real-time DB** | **Lucide & Feather Icons** |

</div>

---

## 🏗️ Cuplikan Arsitektur: Real-time Listener
Aplikasi ini menggunakan pola **Reactive Programming** untuk menjaga UI tetap sinkron dengan server secara permanen.

```typescript
// Implementasi Real-time Sync tanpa Delay
const monitorHabits = (userId: string) => {
  return firestore()
    .collection('users')
    .doc(userId)
    .collection('habits')
    .onSnapshot(snapshot => {
      const liveData = snapshot.docs.map(doc => doc.data());
      updateUIState(liveData); // UI Terupdate Secara Instan
    });
};
```
