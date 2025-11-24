export type Word = { en: string; th: string; example?: string };
export type Deck = {
  slug: string;
  title: string;
  icon: string;
  bg: string;
  words: Word[];
};

const GREEN_BG = "#E8F4C8";
const BEIGE_BG = "#EDE6D6";
const PURPLE_BG = "#D9D4F6";
const GRAY_BG = "#EFEFEF";
const BLUE_BG = "#D4E6F6";
const PINK_BG = "#F6D4D4";

export const DEFAULT_DECKS: Deck[] = [
  {
    slug: "essentials",
    title: "Essentials",
    icon: "👋",
    bg: BEIGE_BG,
    words: [
      { en: "Hello", th: "สวัสดี", example: "Sawasdee krub/ka" },
      { en: "Thank you", th: "ขอบคุณ", example: "Khop khun krub/ka" },
      { en: "Yes", th: "ใช่", example: "Chai krub/ka" },
      { en: "No", th: "ไม่", example: "Mai chai" },
      { en: "Excuse me", th: "ขอโทษ", example: "Kor tod krub/ka" },
      { en: "Water", th: "น้ำ", example: "Kor nam plao" },
      { en: "Toilet", th: "ห้องน้ำ", example: "Hong nam yoo tee nai?" },
      { en: "Help", th: "ช่วยด้วย", example: "Chuay duay!" },
      { en: "How much?", th: "เท่าไหร่", example: "Raka tao rai?" },
      { en: "Delicious", th: "อร่อย", example: "Aroi mak" },
      { en: "Sorry", th: "ขอโทษ", example: "Kor tod" },
      { en: "Goodbye", th: "ลาก่อน", example: "La gon" },
      { en: "I don't understand", th: "ไม่เข้าใจ", example: "Mai kao jai" },
      { en: "Can you speak English?", th: "พูดภาษาอังกฤษได้ไหม", example: "Pood pasa angkrit dai mai?" },
    ],
  },
  {
    slug: "food-dining",
    title: "Food & Dining",
    icon: "🍽️",
    bg: PURPLE_BG,
    words: [
      { en: "Menu", th: "เมนู", example: "Kor menu noi" },
      { en: "Spicy", th: "เผ็ด", example: "Phed mak" },
      { en: "Not spicy", th: "ไม่เผ็ด", example: "Mai phed" },
      { en: "No sugar", th: "ไม่ใส่น้ำตาล", example: "Mai sai nam tan" },
      { en: "Chicken", th: "ไก่", example: "Gai" },
      { en: "Pork", th: "หมู", example: "Moo" },
      { en: "Beef", th: "เนื้อ", example: "Nuea" },
      { en: "Rice", th: "ข้าว", example: "Khao" },
      { en: "Noodles", th: "ก๋วยเตี๋ยว", example: "Kuay tiew" },
      { en: "Water", th: "น้ำเปล่า", example: "Nam plao" },
      { en: "Ice", th: "น้ำแข็ง", example: "Nam khaeng" },
      { en: "Bill please", th: "เช็คบิล", example: "Check bin duay" },
      { en: "Delicious", th: "อร่อย", example: "Aroi" },
      { en: "Vegetarian", th: "มังสวิรัติ", example: "Kin jay" },
    ],
  },
  {
    slug: "travel-transport",
    title: "Travel & Transport",
    icon: "🚕",
    bg: BLUE_BG,
    words: [
      { en: "Taxi", th: "แท็กซี่", example: "Riek taxi hai noi" },
      { en: "Go to...", th: "ไปที่...", example: "Pai tee Siam Paragon" },
      { en: "Turn left", th: "เลี้ยวซ้าย", example: "Lieaw sai" },
      { en: "Turn right", th: "เลี้ยวขวา", example: "Lieaw kwa" },
      { en: "Straight", th: "ตรงไป", example: "Trong pai" },
      { en: "Stop here", th: "จอดที่นี่", example: "Jod tee nee" },
      { en: "Airport", th: "สนามบิน", example: "Pai sanam bin" },
      { en: "Hotel", th: "โรงแรม", example: "Rong raem" },
      { en: "Train station", th: "สถานีรถไฟ", example: "Sathani rot fai" },
      { en: "Ticket", th: "ตั๋ว", example: "Sue tua" },
      { en: "Near", th: "ใกล้", example: "Klai" },
      { en: "Far", th: "ไกล", example: "Klai" },
    ],
  },
  {
    slug: "shopping",
    title: "Shopping",
    icon: "🛍️",
    bg: PINK_BG,
    words: [
      { en: "How much?", th: "เท่าไหร่", example: "Tao rai?" },
      { en: "Expensive", th: "แพง", example: "Paeng mak" },
      { en: "Cheap", th: "ถูก", example: "Took" },
      { en: "Discount", th: "ลดราคา", example: "Lod raka dai mai?" },
      { en: "Size", th: "ขนาด", example: "Mee size yai mai?" },
      { en: "Color", th: "สี", example: "Chob see nee" },
      { en: "Bag", th: "ถุง", example: "Ao tung" },
      { en: "Cash", th: "เงินสด", example: "Jai ngern sod" },
      { en: "Credit card", th: "บัตรเครดิต", example: "Rub credit card mai?" },
      { en: "Change (money)", th: "เงินทอน", example: "Ngern torn" },
      { en: "Market", th: "ตลาด", example: "Pai talad" },
      { en: "Mall", th: "ห้าง", example: "Pai hang" },
    ],
  },
  {
    slug: "social-fun",
    title: "Social & Fun",
    icon: "🎉",
    bg: GREEN_BG,
    words: [
      { en: "Name", th: "ชื่อ", example: "Khun chue arai?" },
      { en: "Nice to meet you", th: "ยินดีที่ได้รู้จัก", example: "Yin dee tee dai roo jak" },
      { en: "Fun", th: "สนุก", example: "Sanook mak" },
      { en: "Cute", th: "น่ารัก", example: "Narak" },
      { en: "Beautiful", th: "สวย", example: "Suay" },
      { en: "Handsome", th: "หล่อ", example: "Lor" },
      { en: "Friend", th: "เพื่อน", example: "Puean" },
      { en: "Line ID", th: "ไลน์ไอดี", example: "Kor Line ID noi" },
      { en: "Phone number", th: "เบอร์โทร", example: "Kor ber tor noi" },
      { en: "Where are you from?", th: "คุณมาจากไหน", example: "Khun ma jak nai?" },
      { en: "I am from...", th: "ฉันมาจาก...", example: "Chan ma jak..." },
      { en: "Good luck", th: "โชคดี", example: "Chok dee" },
    ],
  },
  {
    slug: "emergencies",
    title: "Emergencies",
    icon: "🚨",
    bg: GRAY_BG,
    words: [
      { en: "Help!", th: "ช่วยด้วย!", example: "Chuay duay!" },
      { en: "Hospital", th: "โรงพยาบาล", example: "Rong payaban" },
      { en: "Doctor", th: "หมอ", example: "Tong karn mor" },
      { en: "Police", th: "ตำรวจ", example: "Riek tum ruat" },
      { en: "Lost", th: "หลงทาง", example: "Chan long tang" },
      { en: "Sick", th: "ป่วย", example: "Mai sabai" },
      { en: "Pain", th: "เจ็บ", example: "Jeb" },
      { en: "Medicine", th: "ยา", example: "Ran khai ya" },
      { en: "Ambulance", th: "รถพยาบาล", example: "Riek rot payaban" },
      { en: "Embassy", th: "สถานทูต", example: "Sathan toot" },
      { en: "Passport", th: "พาสปอร์ต", example: "Passport hai" },
      { en: "Danger", th: "อันตราย", example: "Antarai" },
    ],
  },
];

export function getDeckBySlug(slug: string): Deck | undefined {
  return DEFAULT_DECKS.find((d) => d.slug === slug);
}