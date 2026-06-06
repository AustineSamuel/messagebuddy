import type {
  Contact,
  Conversation,
  DailyCredits,
  Product,
  BusinessSettings,
  TriggerRule,
} from "@/dashboard/types";

export const DEMO_CONTACTS: Contact[] = [
  {
    id: 1,
    name: "Amaka Kelechi",
    phone: "+234 803 421 9900",
    initials: "AK",
    avatarColor: "#1e3a4a",
    online: true,
    rule: "always",
    unreadCount: 2,
    lastMessage: "When will my order arrive?",
    lastMessageTime: "2m",
    aiHandled: true,
    tags: ["VIP", "Returning"],
    notes:
      "Returning customer. Interested in premium plan. Prefers formal tone.",
  },
  {
    id: 2,
    name: "Chidi Uzodinma",
    phone: "+234 706 332 8811",
    initials: "CU",
    avatarColor: "#1a2e50",
    online: true,
    rule: "custom",
    unreadCount: 0,
    lastMessage: "AI: Thanks for your interest in our bulk discount...",
    lastMessageTime: "14m",
    aiHandled: true,
    tags: ["Wholesale"],
    notes: "Interested in bulk orders. Always ask about bulk discount first.",
  },
  {
    id: 3,
    name: "Fatima Abubakar",
    phone: "+234 813 905 6634",
    initials: "FA",
    avatarColor: "#2e1a50",
    online: false,
    rule: "always",
    unreadCount: 0,
    lastMessage: "AI: The premium plan includes unlimited access...",
    lastMessageTime: "1h",
    aiHandled: true,
    tags: ["Premium"],
  },
  {
    id: 4,
    name: "Taiwo Makinde",
    phone: "+234 802 771 4422",
    initials: "TM",
    avatarColor: "#1a3a3a",
    online: false,
    rule: "default",
    unreadCount: 1,
    lastMessage: "Do you have Galaxy S24?",
    lastMessageTime: "2h",
    aiHandled: false,
  },
  {
    id: 5,
    name: "Ngozi Eze",
    phone: "+234 817 449 2200",
    initials: "NE",
    avatarColor: "#3a1a28",
    online: false,
    rule: "never",
    unreadCount: 0,
    lastMessage: "You replied: Thank you!",
    lastMessageTime: "3h",
    aiHandled: false,
  },
  {
    id: 6,
    name: "Emeka Okafor",
    phone: "+234 803 215 7744",
    initials: "EO",
    avatarColor: "#1a253a",
    online: true,
    rule: "always",
    unreadCount: 3,
    lastMessage: "What is your return policy?",
    lastMessageTime: "4h",
    aiHandled: true,
  },
  {
    id: 7,
    name: "Bola Adeyemi",
    phone: "+234 805 663 2210",
    initials: "BA",
    avatarColor: "#2a3a1a",
    online: false,
    rule: "custom",
    unreadCount: 0,
    lastMessage: "AI: Your delivery has been scheduled for tomorrow...",
    lastMessageTime: "5h",
    aiHandled: true,
    tags: ["Lagos"],
  },
];

export const DEMO_CONVERSATIONS: Record<number, Conversation> = {
  1: {
    contactId: 1,
    messages: [
      {
        id: "m1",
        direction: "in",
        text: "Hi! I ordered an iPhone 15 Pro Max yesterday. When will it arrive?",
        time: "10:22",
        aiGenerated: false,
      },
      {
        id: "m2",
        direction: "out",
        text: "Hello Amaka! 👋 Thank you for your order. Your iPhone 15 Pro Max has been confirmed and is being prepared for dispatch. You can expect delivery within 1–2 business days. I'll send you a tracking link once it's shipped!",
        time: "10:22",
        aiGenerated: true,
      },
      {
        id: "m3",
        direction: "in",
        text: "Great! Can I pay on delivery?",
        time: "10:35",
        aiGenerated: false,
      },
      {
        id: "m4",
        direction: "out",
        text: "Yes absolutely! We accept payment on delivery for orders within Lagos. For orders outside Lagos, we require 50% upfront. Your total is ₦850,000. Is there anything else I can help you with? 😊",
        time: "10:36",
        aiGenerated: true,
      },
      {
        id: "m5",
        direction: "in",
        text: "Perfect. What accessories do you recommend with it?",
        time: "10:40",
        aiGenerated: false,
      },
      {
        id: "m6",
        direction: "out",
        text: "Great choice! For the iPhone 15 Pro Max I'd recommend:\n\n• AirPods Pro 2nd Gen – ₦180,000 (perfect pairing)\n• MagSafe Charger – ₦25,000\n• Premium case – from ₦8,000\n\nBundle deal: iPhone + AirPods for ₦1,005,000 (save ₦25,000). Interested? 🎉",
        time: "10:41",
        aiGenerated: true,
      },
      {
        id: "m7",
        direction: "in",
        text: "When will my order arrive?",
        time: "11:02",
        aiGenerated: false,
      },
    ],
  },
  2: {
    contactId: 2,
    messages: [
      {
        id: "m1",
        direction: "in",
        text: "Do you offer bulk discount for 10 laptops?",
        time: "09:15",
        aiGenerated: false,
      },
      {
        id: "m2",
        direction: "out",
        text: "Hi Chidi! Great to hear from you. Yes, we absolutely offer bulk discounts! For 10+ units of the MacBook Air M2, you get 8% off the listed price, bringing it to ₦1,104,000 per unit. I can also arrange free delivery to your office. Would you like a formal quote?",
        time: "09:16",
        aiGenerated: true,
      },
      {
        id: "m3",
        direction: "in",
        text: "Yes please send the quote",
        time: "09:20",
        aiGenerated: false,
      },
      {
        id: "m4",
        direction: "out",
        text: "Thanks for confirming! I'm preparing the formal quote now. Our sales team will send it to your email within the hour. Could you confirm your email address please?",
        time: "09:20",
        aiGenerated: true,
      },
    ],
  },
  3: {
    contactId: 3,
    messages: [
      {
        id: "m1",
        direction: "in",
        text: "Hi, I want to know more about the premium plan",
        time: "08:50",
        aiGenerated: false,
      },
      {
        id: "m2",
        direction: "out",
        text: "Hello Fatima! 😊 The premium plan includes unlimited access to all our products, priority customer support, extended 2-year warranty, and free delivery on every order. It's ₦15,000/month or ₦150,000/year. Would you like to sign up today?",
        time: "08:51",
        aiGenerated: true,
      },
    ],
  },
  4: {
    contactId: 4,
    messages: [
      {
        id: "m1",
        direction: "in",
        text: "Do you have Galaxy S24?",
        time: "07:30",
        aiGenerated: false,
      },
    ],
  },
  6: {
    contactId: 6,
    messages: [
      {
        id: "m1",
        direction: "in",
        text: "What is your return policy?",
        time: "06:15",
        aiGenerated: false,
      },
    ],
  },
};

export const DEMO_DAILY_CREDITS: DailyCredits[] = [
  { day: "Mon", date: "Jun 2", used: 180, messages: 62 },
  { day: "Tue", date: "Jun 3", used: 220, messages: 74 },
  { day: "Wed", date: "Jun 4", used: 195, messages: 65 },
  { day: "Thu", date: "Jun 5", used: 260, messages: 88 },
  { day: "Fri", date: "Jun 6", used: 310, messages: 103 },
  { day: "Sat", date: "Jun 7", used: 275, messages: 91 },
  { day: "Sun", date: "Jun 8", used: 143, messages: 47 },
];

export const DEMO_PRODUCTS: Product[] = [
  { id: 1, emoji: "📱", name: "iPhone 15 Pro Max", price: "₦850,000", stock: "in" },
  { id: 2, emoji: "💻", name: "MacBook Air M2", price: "₦1,200,000", stock: "in" },
  { id: 3, emoji: "🎧", name: "AirPods Pro 2nd Gen", price: "₦180,000", stock: "in" },
  { id: 4, emoji: "⌚", name: "Apple Watch Series 9", price: "₦320,000", stock: "low" },
  { id: 5, emoji: "🖥️", name: "Samsung 32\" Monitor", price: "₦145,000", stock: "out" },
  { id: 6, emoji: "🔌", name: "MagSafe Charger 30W", price: "₦25,000", stock: "in" },
];

export const DEMO_BUSINESS_SETTINGS: BusinessSettings = {
  name: "Obi's Electronics & Accessories",
  description: "Phones, laptops, accessories and repairs in Lagos",
  website: "https://obiselectronics.ng",
  address: "14 Broad Street, Lagos Island, Lagos",
  aiRules:
    "Always be warm, professional, and helpful. Reply in the same language the customer uses. Never quote prices above our listed rates. Always offer free delivery on orders above ₦50,000. If a customer complains, apologize first and offer a solution. Never mention competitors by name. End messages with our store link if relevant.",
  responseLanguage: "auto",
  escalationRules:
    "Customer requests a refund, order is above ₦500,000, customer uses aggressive language",
  tone: "professional",
};

export const DEMO_TRIGGER_RULES: TriggerRule[] = [
  { id: 1, keyword: "price", action: "Send pricing catalog" },
  { id: 2, keyword: "complaint", action: "Escalate to owner" },
  { id: 3, keyword: "delivery", action: "Send tracking info" },
  { id: 4, keyword: "return", action: "Share return policy" },
];

export const DEMO_CREDITS_BALANCE = 4820;
export const DEMO_TOTAL_CREDITS = 5000;
