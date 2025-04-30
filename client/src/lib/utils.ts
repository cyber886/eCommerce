import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getDiscountPercentage(originalPrice: number | undefined | null, currentPrice: number): number | null {
  if (!originalPrice || originalPrice <= currentPrice) return null;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

// Generate delivery dates for next 7 days
export function getDeliveryDates(startDaysFromNow = 1, daysCount = 7) {
  return Array.from({ length: daysCount }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + startDaysFromNow + i);
    return date;
  });
}

// Format date to display day name and date
export function formatDeliveryDate(date: Date): { dayName: string; dayNumber: number; month: string; fullDate: string } {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = dayNames[date.getDay()];
  const dayNumber = date.getDate();
  const month = monthNames[date.getMonth()];
  const fullDate = `${month} ${dayNumber}, ${date.getFullYear()}`;
  
  return { dayName, dayNumber, month, fullDate };
}

// Delivery time slots
export const timeSlots = [
  { id: 1, time: "9:00 - 12:00" },
  { id: 2, time: "12:00 - 15:00" },
  { id: 3, time: "15:00 - 18:00" },
  { id: 4, time: "18:00 - 21:00" },
];
