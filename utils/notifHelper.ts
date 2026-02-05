import { db } from "../firebase/config"; // Sesuaikan path config firebase kamu
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Fungsi Helper untuk mengirim notifikasi ke dalam aplikasi (Firestore)
 * @param userId - ID User yang akan menerima notifikasi
 * @param title - Judul notifikasi
 * @param body - Isi pesan notifikasi
 * @param type - Tipe notifikasi ('streak' | 'challenge' | 'info')
 */
export const sendInAppNotif = async (
  userId: string, 
  title: string, 
  body: string, 
  type: 'streak' | 'challenge' | 'info' = 'info'
) => {
  if (!userId) return;

  try {
    // Merujuk ke koleksi: users > [userId] > notifications
    const notifRef = collection(db, "users", userId, "notifications");

    await addDoc(notifRef, {
      title: title,
      body: body,
      type: type,
      isRead: false,
      createdAt: serverTimestamp(), // Menggunakan waktu server agar akurat
    });

    console.log("Notifikasi berhasil dikirim ke Firestore");
  } catch (error) {
    console.error("Gagal mengirim notifikasi helper:", error);
  }
};