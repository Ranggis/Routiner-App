// utils/dateHelpers.ts

// Fungsi standar agar format YYYY-MM-DD selalu sama di semua file
export const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getNext7Days = () => {
  const days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < 7; i++) {
    const tempDate = new Date();
    tempDate.setDate(tempDate.getDate() + i);

    days.push({
      dayName: dayNames[tempDate.getDay()],
      dayNumber: tempDate.getDate().toString(),
      fullDate: formatDateLocal(tempDate), // Gunakan fungsi format di atas
    });
  }
  return days;
};