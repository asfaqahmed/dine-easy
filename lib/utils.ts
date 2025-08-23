import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPhoneNumber(phone: string): string {
  // Format Sri Lankan phone numbers to +94XXXXXXXXX format
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('94')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+94${cleaned.substring(1)}`;
  } else if (cleaned.length === 9) {
    return `+94${cleaned}`;
  }
  
  return phone;
}

export function validateSriLankanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it starts with 94 and has correct length
  if (cleaned.startsWith('94') && cleaned.length === 11) {
    return true;
  }
  
  // Check if it starts with 0 and has correct length
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return true;
  }
  
  // Check if it's 9 digits (without country code or leading 0)
  if (cleaned.length === 9) {
    return true;
  }
  
  return false;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

export function generateQRCode(url: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
}

export function calculateTax(subtotal: number, taxRate: number = 0.1): number {
  return Math.round(subtotal * taxRate * 100) / 100;
}

export function calculateTotal(subtotal: number, taxAmount: number = 0): number {
  return subtotal + taxAmount;
}

export function estimateReadyTime(items: any[], baseMinutes: number = 5): Date {
  const totalPrepTime = items.reduce((total, item) => {
    return total + (item.preparation_time || 15) * item.quantity;
  }, baseMinutes);
  
  const readyTime = new Date();
  readyTime.setMinutes(readyTime.getMinutes() + totalPrepTime);
  return readyTime;
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-LK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}