export type Word = { en: string; th: string };
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

export const DEFAULT_DECKS: Deck[] = [
  {
    slug: "airport",
    title: "At the airport",
    icon: "flight",
    bg: BEIGE_BG,
    words: [
      { en: "Check-in counter", th: "เคาน์เตอร์เช็คอิน" },
      { en: "Boarding pass", th: "บัตรขึ้นเครื่อง" },
      { en: "Gate", th: "ประตูทางออกขึ้นเครื่อง" },
      { en: "Departure", th: "การออกเดินทาง" },
      { en: "Arrival", th: "การเดินทางมาถึง" },
      { en: "Security check", th: "ตรวจความปลอดภัย" },
      { en: "Carry-on", th: "กระเป๋าถือขึ้นเครื่อง" },
      { en: "Checked baggage", th: "กระเป๋าฝากใต้ท้องเครื่อง" },
      { en: "Customs", th: "ศุลกากร" },
      { en: "Immigration", th: "ตรวจคนเข้าเมือง" },
      { en: "Delayed flight", th: "เที่ยวบินล่าช้า" },
      { en: "On time", th: "ตรงเวลา" },
    ],
  },
  {
    slug: "job-interview",
    title: "Job interview",
    icon: "work",
    bg: GRAY_BG,
    words: [
      { en: "Strengths", th: "จุดแข็ง" },
      { en: "Weaknesses", th: "จุดอ่อน" },
      { en: "Experience", th: "ประสบการณ์" },
      { en: "Qualifications", th: "คุณสมบัติ" },
      { en: "Responsibilities", th: "ความรับผิดชอบ" },
      { en: "Teamwork", th: "การทำงานเป็นทีม" },
      { en: "Problem solving", th: "การแก้ปัญหา" },
      { en: "Deadline", th: "กำหนดเวลา" },
      { en: "Salary expectation", th: "คาดหวังเงินเดือน" },
      { en: "Availability", th: "ความพร้อมในการเริ่มงาน" },
      { en: "Reference", th: "ผู้รับรอง" },
      { en: "Position", th: "ตำแหน่งงาน" },
    ],
  },
  {
    slug: "restaurant",
    title: "Restaurant ordering",
    icon: "restaurant",
    bg: PURPLE_BG,
    words: [
      { en: "Menu", th: "เมนู" },
      { en: "Reservation", th: "การจอง" },
      { en: "Table for two", th: "โต๊ะสำหรับสองคน" },
      { en: "Allergic to peanuts", th: "แพ้ถั่วลิสง" },
      { en: "Spicy", th: "เผ็ด" },
      { en: "Mild", th: "เผ็ดน้อย" },
      { en: "Medium", th: "ปานกลาง" },
      { en: "Takeaway", th: "ซื้อกลับบ้าน" },
      { en: "Bill please", th: "คิดเงินด้วยครับ/ค่ะ" },
      { en: "Service charge", th: "ค่าบริการ" },
      { en: "Cutlery", th: "ช้อนส้อม" },
      { en: "Napkin", th: "ผ้าเช็ดปาก" },
    ],
  },
  {
    slug: "clothing",
    title: "Clothing",
    icon: "checkroom",
    bg: GRAY_BG,
    words: [
      { en: "Size", th: "ขนาด" },
      { en: "Fitting room", th: "ห้องลอง" },
      { en: "Discount", th: "ส่วนลด" },
      { en: "Receipt", th: "ใบเสร็จ" },
      { en: "Exchange", th: "แลกเปลี่ยน" },
      { en: "Refund", th: "คืนเงิน" },
      { en: "Fabric", th: "ผ้า" },
      { en: "Pattern", th: "ลายผ้า" },
      { en: "Suit", th: "สูท" },
      { en: "Shoes", th: "รองเท้า" },
      { en: "T-shirt", th: "เสื้อยืด" },
      { en: "Jeans", th: "ยีนส์" },
    ],
  },
  {
    slug: "aviation",
    title: "Aviation",
    icon: "flight-takeoff",
    bg: GREEN_BG,
    words: [
      { en: "Pilot", th: "นักบิน" },
      { en: "Cabin crew", th: "พนักงานต้อนรับบนเครื่อง" },
      { en: "Runway", th: "รันเวย์" },
      { en: "Altitude", th: "ระดับความสูง" },
      { en: "Turbulence", th: "อากาศหนุน" },
      { en: "Seat belt", th: "เข็มขัดนิรภัย" },
      { en: "Emergency exit", th: "ทางออกฉุกเฉิน" },
      { en: "Cabin", th: "ห้องโดยสาร" },
      { en: "Cockpit", th: "ห้องนักบิน" },
      { en: "Takeoff", th: "การขึ้นบิน" },
      { en: "Landing", th: "การลงจอด" },
      { en: "Layover", th: "พักเครื่อง" },
    ],
  },
];

export function getDeckBySlug(slug: string): Deck | undefined {
  return DEFAULT_DECKS.find((d) => d.slug === slug);
}