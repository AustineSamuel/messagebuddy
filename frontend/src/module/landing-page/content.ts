export const landingPageContent = {
  brand: {
    name: "MessageBuddy",
    tagline: "WhatsApp Business dashboard with AI that never sleeps.",
  },
  hero: {
    eyebrow: "WhatsApp business dashboard for sellers",
    eyebrowIcon: "messages" as const,
    headline: "Never lose a WhatsApp sale because you replied too late.",
    subheadline:
      "MessageBuddy is the WhatsApp Business dashboard built for sellers — one inbox for every chat, AI replies while you sleep, voice-note transcription, product storefronts, and smart follow-ups. Connect your number in minutes. Set your rules once. Let your business keep closing.",
    primaryCta: "Start free — 5,000 credits",
    primaryCtaHref: "/register",
    secondaryCta: "Sign in",
    secondaryCtaHref: "/login",
    dashboardCta: "Open dashboard",
    dashboardCtaHref: "/dashboard",
    trustLine:
      "Free forever to start · 5,000 credits on signup · No credit card · Phone & desktop",
    trustBadges: [
      { icon: "gift" as const, label: "Free to start" },
      { icon: "zap" as const, label: "5,000 credits" },
      { icon: "shield" as const, label: "No card required" },
      { icon: "smartphone" as const, label: "Phone & desktop" },
    ],
  },
  pillars: {
    title: "The WhatsApp workspace your business actually needs.",
    subtitle:
      "Not another chat app — a sales workspace built for how merchants actually sell on WhatsApp.",
    items: [
      {
        label: "FIG 1.0",
        icon: "store" as const,
        title: "Built for WhatsApp sellers",
        description:
          "DMs, voice notes, price checks, delivery questions — shaped for Instagram-to-WhatsApp vendors and local merchants who close on chat.",
      },
      {
        label: "FIG 1.1",
        icon: "sparkles" as const,
        title: "AI you control, not a generic bot",
        description:
          "Auto-reply, draft assist, and follow-ups use your rules, tone, and contact memory. Sound like your brand — not a robot.",
      },
      {
        label: "FIG 1.2",
        icon: "zap" as const,
        title: "Speed that wins customers",
        description:
          "One inbox, fewer tabs, less typing. Transcribe voice notes instantly and reply before the lead buys elsewhere.",
      },
    ],
  },
  workflows: [
    {
      id: "inbox",
      step: "1.0",
      label: "Inbox",
      icon: "inbox" as const,
      title: "Every WhatsApp conversation in one dashboard",
      description:
        "Sync chats, contacts, and unread counts into a clean business inbox. Stop passing phones around or losing track of who asked for what.",
      bullets: ["Unified WhatsApp chat list", "Real-time message sync", "Per-contact rules panel"],
    },
    {
      id: "automate",
      step: "2.0",
      label: "Automate",
      icon: "bot" as const,
      title: "AI auto-reply while you are offline",
      description:
        "Save rules per contact and let MessageBuddy reply from the server using recent chat context. Your laptop does not need to stay open.",
      bullets: ["Server-side AI auto-reply", "AI compose assist", "Voice note transcription"],
    },
    {
      id: "sell",
      step: "3.0",
      label: "Sell",
      icon: "shop" as const,
      title: "Turn WhatsApp chats into a storefront",
      description:
        "Publish products to a branded public store. Send a link instead of typing prices in voice notes for the tenth time today.",
      bullets: ["Product catalog & SEO pages", "WhatsApp checkout handoff"],
    },
    {
      id: "grow",
      step: "4.0",
      label: "Grow",
      icon: "chart" as const,
      title: "Follow up and measure what converts",
      description:
        "Schedule AI follow-ups for quiet leads and track credits, daily usage, and top contacts from one analytics view.",
      bullets: ["Smart follow-up sequences", "Credits & usage charts", "5,000 free credits to start"],
    },
  ],
  storefront: {
    title: "Every business gets a public shop",
    body: "Publish your products and share one clean link. Customers browse your store, then reach you on WhatsApp to buy.",
    urlSlug: "your-business-name",
    imageSrc: "/landing/storefront-example.jpeg",
    imageAlt: "Example MessageBuddy storefront with featured products and new arrivals",
  },
  faq: [
    {
      question: "Will AI replies sound fake to my customers?",
      answer:
        "You control instructions, tone, and notes per contact. AI uses your business context — and you can edit every draft before sending.",
    },
    {
      question: "Do I need to keep my laptop open for auto-reply?",
      answer:
        "No. AI auto-reply and follow-ups run on the MessageBuddy server after WhatsApp is connected.",
    },
    {
      question: "Can MessageBuddy transcribe WhatsApp voice notes?",
      answer:
        "Yes. Tap Transcribe on any audio message in your dashboard to read what the customer said and reply faster.",
    },
    {
      question: "Is this only for big companies?",
      answer:
        "MessageBuddy is built for solo sellers and small teams drowning in WhatsApp DMs — not enterprise call centers.",
    },
    {
      question: "What if I want to reply myself?",
      answer:
        "Use the dashboard like a normal inbox, turn off AI per contact, or use ✨ AI only to draft.",
    },
  ],
  offer: {
    title: "Start free. Connect WhatsApp today.",
    body: "Create your account and get 5,000 credits to send messages, test AI replies, transcribe voice notes, and explore your dashboard. No credit card. No sales call.",
    primaryCta: "Create free account",
    primaryCtaHref: "/register",
    secondaryCta: "Already have an account? Sign in",
    secondaryCtaHref: "/login",
  },
  about: {
    title: "About MessageBuddy",
    body: "We help merchants stay on top of WhatsApp with clarity, speed, and calm — for businesses without a call center or CRM team who still need to look professional and close more sales.",
  },
  contact: {
    title: "Contact us",
    body: "Questions before you sign up? We are happy to help.",
    email: "hello@messagebuddy.com",
  },
  footer: {
    tagline: "Make WhatsApp feel like a business tool — not a second job.",
  },
  seo: {
    title: "MessageBuddy — AI WhatsApp Business Dashboard | Auto-Reply & Voice Transcription",
    description:
      "Reply faster on WhatsApp with AI auto-reply, voice note transcription, smart follow-ups, and a product storefront. Free account with 5,000 credits. Built for African merchants.",
    keywords: [
      "WhatsApp Business dashboard",
      "WhatsApp AI auto reply",
      "WhatsApp voice note transcription",
      "WhatsApp sales automation",
      "WhatsApp business inbox",
      "AI WhatsApp agent",
      "WhatsApp storefront",
      "Nigeria WhatsApp business",
      "African e-commerce WhatsApp",
      "MessageBuddy",
    ],
  },
} as const;

export type LandingPageContent = typeof landingPageContent;
