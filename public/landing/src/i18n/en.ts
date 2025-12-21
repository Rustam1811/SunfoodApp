export const en = {
  // Navigation
  nav: {
    features: 'Features',
    calculator: 'Calculator',
    testimonials: 'Reviews',
    pricing: 'Pricing',
    faq: 'FAQ',
    requestDemo: 'Request Demo',
  },

  // Hero Section
  hero: {
    badge: 'Coffee Addict: +230,000₸/mo with Brewly',
    headline: 'Your guests are waiting in line.',
    headlineAccent: 'You\'re losing 300,000₸.',
    subheadline: 'An app that turns casual visitors into loyal regulars. Order in a second, pickup in 15 seconds, average check +34%.',
    metrics: {
      revenue: { value: '+353K₸', label: 'revenue per month' },
      payback: { value: '2 mo', label: 'payback period' },
      launch: { value: '10 days', label: 'to launch' },
    },
    cta: 'Get Started in 10 Days',
    ctaSecondary: 'Watch Demo',
    trust: '✓ No order fees   ✓ Money-back guarantee   ✓ 24/7 Support',
    floatingCards: {
      check: { value: '+34%', label: 'avg check' },
      repeat: { value: '×2.3', label: 'repeat rate' },
    },
  },

  // Features Section
  features: {
    eyebrow: 'How It Makes Money',
    title: 'Every Feature = Revenue Growth',
    description: 'Not just features. Real results from coffee shops already using Brewly.',
    items: [
      {
        id: 'average-check',
        metric: '+34%',
        title: 'Average Check Grows',
        description: 'Smart upsells at order time. Croissant with cappuccino, syrup with latte — the algorithm knows what to suggest.',
      },
      {
        id: 'queue-gone',
        metric: '-70%',
        title: 'Queue Disappears',
        description: 'Guest orders in advance. Barista scans QR in 15 seconds. Rush hour is no longer stressful.',
      },
      {
        id: 'repeat-rate',
        metric: '×2.3',
        title: 'They Come Back More',
        description: 'Loyalty program with levels. Favorite drink on main screen. Personal push notifications.',
      },
      {
        id: 'analytics',
        metric: '24/7',
        title: 'See Everything',
        description: 'Revenue, top products, peak hours — in real time. Know what to promote and when.',
      },
    ],
    stats: [
      { value: '+353K', label: 'Revenue growth per month' },
      { value: '2 mo', label: 'Average payback' },
      { value: '447%', label: 'ROI per year' },
      { value: '10 days', label: 'Turnkey launch' },
    ],
  },

  // Process Section
  process: {
    eyebrow: 'How It Works',
    title: 'From Request to First Order — 10 Days',
    description: 'No bureaucracy. We do everything for you.',
    steps: [
      {
        number: '01',
        title: 'We Talk',
        description: 'Discuss your coffee shop, review current metrics, calculate ROI.',
        duration: '30 min',
        icon: '📞',
      },
      {
        number: '02',
        title: 'We Set Up',
        description: 'Upload menu, customize colors for your brand.',
        duration: '3-5 days',
        icon: '⚙️',
      },
      {
        number: '03',
        title: 'We Train',
        description: 'Conduct training for baristas. Set up admin panel. Answer questions.',
        duration: '2 hours',
        icon: '👨‍🏫',
      },
      {
        number: '04',
        title: 'We Launch',
        description: 'Publish the app. First orders. You see growth in real time.',
        duration: 'Day X',
        icon: '🚀',
      },
    ],
    summary: {
      value: '10',
      label: 'days',
      description: 'from request to first order',
    },
  },

  // Showcase Section
  showcase: {
    eyebrow: 'Demo',
    title: 'See How It Works',
    description: 'Switch between admin panel and client app',
    tabs: {
      admin: 'Admin',
      client: 'Client',
    },
    adminShots: ['Orders', 'POS Menu', 'Analytics', 'Bonuses', 'Customers'],
    clientShots: ['Home', 'Menu', 'Order', 'Profile', 'Card'],
  },

  // Why Us Section
  whyUs: {
    eyebrow: 'Why Brewly',
    title: 'Not Just Another App',
    description: 'Compare for yourself. We built Brewly for ourselves, then realized — every coffee shop needs this.',
    competitors: [
      {
        name: 'Yandex eda',
        problems: [
          '15% commission on every order',
          'Customers go to their database',
          'No analytics for check growth',
          'Template design',
        ],
      },
      {
        name: 'Poster/iiko',
        problems: [
          'Only for accounting, not sales',
          'Inconvenient for customers to order',
          'No loyalty programs',
          'High implementation cost',
        ],
      },
      {
        name: 'No System',
        problems: [
          'Queues and lost customers',
          'No guest data',
          'Each order loses 2-3 minutes',
          'Guests don\'t return',
        ],
      },
    ],
    advantages: [
      { icon: 'zap', title: 'Pays for Itself in 2 Months', description: 'Not an expense, an investment. Average revenue growth +353,000₸/mo' },
      { icon: 'users', title: 'Your Customers Are Yours', description: 'Database stays with you. No order fees. Full control.' },
      { icon: 'trending-up', title: 'Built for Check Growth', description: 'Smart upsells, personalization, loyalty programs +34% to check' },
      { icon: 'award', title: 'Premium for Your Brand', description: 'App design completely matches your brand style' },
      { icon: 'headphones', title: 'Human Support', description: 'We respond in 15 minutes. Help set up. Guide to results.' },
      { icon: 'rocket', title: 'Launch in 10 Days', description: 'From signing to first order. Not months, days.' },
    ],
    brewlyTitle: 'Brewly',
    brewlyFeatures: [
      '0% order fees',
      'Your data — your base',
      'Analytics + smart upsells',
      'Design for your brand',
    ],
  },

  // Testimonials Section
  testimonials: {
    eyebrow: 'Owner Results',
    title: 'We Don\'t Promise. We Show Potential.',
    description: 'Real owners. Real situations. Real solutions.',
    beforeLabel: 'Before:',
    items: [
      {
        name: 'Dmitry Volkov',
        role: 'Owner, Coffee Addict',
        before: 'Queues during peak hours, some guests left without waiting',
        result: '+230,000₸/mo',
        period: 'in 2 months',
        quote: 'At first I thought — another service. But when the average check grew from 1,690₸ to 2,385₸, I understood: this isn\'t an expense, it\'s an investment. Brewly paid for itself in the first month.',
        metrics: { checkIncrease: '+41%', queueReduction: '-70%', repeatRate: '×2.3' },
      },
      {
        name: 'Anna Sokolova',
        role: 'Coffee Hub Chain (3 locations)',
        before: '2 baristas couldn\'t keep up during morning hours',
        result: '+680,000₸/mo',
        period: 'in 3 months',
        quote: 'The main thing — guests come back. They used to come once a week, now 3-4 times. And no queues during rush hour. Staff can finally breathe.',
        metrics: { checkIncrease: '+34%', queueReduction: '-85%', repeatRate: '×3.2' },
      },
      {
        name: 'Igor Petrov',
        role: 'Brew Bar on Pokrovka',
        before: 'Small coffee shop, 30 seats, some guests turned around',
        result: '+150,000₸/mo',
        period: 'in 6 weeks',
        quote: 'I have a small coffee shop, 30 seats. I thought it was too expensive for me. But in 6 weeks I got +150k to revenue. Now I understand — I was overpaying by NOT using Brewly.',
        metrics: { checkIncrease: '+28%', queueReduction: '-60%', repeatRate: '×2.1' },
      },
    ],
    metricsLabels: {
      checkIncrease: 'avg check',
      queueReduction: 'queue',
      repeatRate: 'returns',
    },
  },

  // Story Section
  story: {
    quote: 'We opened a coffee shop in 2021. After six months we realized: rush hour queues kill sales. Guests leave without waiting. We looked for solutions — Yandex eda took 15% commission, iiko couldn\'t do loyalty. We built it for ourselves. It worked so well that now it\'s Brewly.',
    highlightQueue: 'rush hour queues kill sales',
    highlightCommission: 'Yandex eda took 15% commission',
    founder: 'Rustam',
    founderRole: 'Founder of Brewly',
    stats: [
      { value: '2021', label: 'Started with our own café' },
      { value: '15+', label: 'Coffee shops connected' },
      { value: '₸4.2M', label: 'Orders per month' },
      { value: '100%', label: 'Owners satisfied' },
    ],
  },

  // Calculator Section
  calculator: {
    eyebrow: 'Potential Calculator',
    title: 'Estimate Your Growth Opportunities',
    description: 'Enter your coffee shop data — see estimated revenue growth potential.',
    currentMetrics: 'Your Current Metrics',
    ordersPerDay: 'Orders per day',
    averageCheck: 'Average check, ₸',
    currentRevenue: 'Current monthly revenue',
    withBrewly: 'Potential in 2 Months with Brewly',
    newCheck: 'Projected average check',
    newOrders: 'Projected orders per day',
    newRevenue: 'Projected monthly revenue',
    revenueIncrease: 'Revenue increase potential',
    perMonth: '/mo',
    netProfit: 'Potential profit after Brewly payment',
    payback: 'Estimated payback',
    months: 'mo',
    getCalculation: 'Discuss calculation for my coffee shop',
    disclaimer: 'Calculation is based on average metrics from coffee shops with queues and take-away. Actual results depend on location, foot traffic, and implementation.',
  },

  // Pricing Section
  pricing: {
    eyebrow: 'Pricing',
    title: 'Choose Your Plan',
    description: 'Flexible terms for any business.',
    popular: 'Popular',
    cta: 'Choose plan',
    plans: {
      subscription: {
        name: 'Subscription',
        price: '50,000 ₸',
        period: '/mo',
        tagline: 'Access to Brewly',
        description: 'Pay as you go.',
        suitableFor: [
          'want to try first',
          'not ready to buy',
          'need a system right now',
        ],
        features: [
          'Skip the queue ordering',
          'Admin panel',
          'Menu and online orders',
          'Promotions, achievements, stories',
          'Exclusive offers for regulars',
          'Push notifications (web)*',
          'Analytics',
        ],
        disclaimer: '* notification delivery depends on guest\'s device.',
        support: null,
      },
      standard: {
        name: 'Standard',
        price: '300,000 ₸',
        period: '',
        tagline: 'Brewly stays with you',
        description: 'No subscription. No time limits.',
        suitableFor: [
          'need product long-term',
          'don\'t want monthly payments',
        ],
        features: [
          'Same features as subscription',
          'Dedicated setup for your coffee shop',
          'Product stays with you',
          'Web / PWA version',
          'Push notifications (web)*',
        ],
        disclaimer: '* notification delivery depends on guest\'s device.',
        support: {
          price: '40,000 ₸/mo',
          description: 'optional',
        },
      },
      premium: {
        name: 'Premium',
        price: '500,000 ₸',
        period: '',
        tagline: 'Maximum control and stability',
        description: 'Product and channel stay with you.',
        suitableFor: [
          'returns and promos are important',
          'need reliable guest communication',
          'building a brand',
        ],
        features: [
          'Everything from Standard',
          'Own app in App Store and Play Market',
          'Stable push notifications (iOS / Android)',
          'Full control over communication channel',
          'Custom brand design',
        ],
        disclaimer: null,
        support: {
          price: '50,000 ₸/mo',
          description: 'optional',
        },
      },
    },
    suitableForLabel: 'Suitable if:',
    supportLabel: 'Tech Support',
    techSupport: {
      title: 'Why tech support?',
      features: [
        'updates',
        'changes for new promotions',
        'analytics help',
        'stable system operation',
      ],
      note: 'Don\'t need it — don\'t pay.',
    },
  },

  // FAQ Section
  faq: {
    eyebrow: 'Answers',
    title: 'Frequently Asked Questions',
    description: 'Didn\'t find an answer? Write us on WhatsApp, we respond in 15 minutes',
    items: [
      {
        question: 'How long does implementation take?',
        answer: 'From first meeting to launch — 10 business days. Days 1-2: admin setup for your brand. Days 3-5: menu and customer base transfer. Days 6-8: barista and admin training. Days 9-10: pilot launch with monitoring.',
      },
      {
        question: 'What if guests don\'t like the app?',
        answer: 'In 2 years of work, refund rate is less than 2%. Interface is intuitive, no training needed. See favorite drink — tap — pick up. If a guest doesn\'t want the app, they can order at the counter as before.',
      },
      {
        question: 'How does it affect average check?',
        answer: 'Average check grows 28-34% in the first 3 months. Reasons: smart cross-sells (croissant with cappuccino), visibility of new items and promotions, loyalty level psychology (wanting to reach the next badge).',
      },
      {
        question: 'Can it integrate with our POS?',
        answer: 'Yes, we have API for integration with popular POS systems (ATOL, Evotor, iiko, Poster). Order automatically goes to POS, barista sees composition, customer gets receipt. Integration setup — 1-2 days.',
      },
      {
        question: 'What\'s included in tech support?',
        answer: '24/7 help via WhatsApp and Telegram. Average response time 15 minutes. Emergency issues (POS not working, bugs) — under 5 minutes. Updates, new features, customizations for your requests — free.',
      },
      {
        question: 'What\'s the difference between plans?',
        answer: 'Subscription (50,000₸/mo) — system rental, ideal for starting. Standard (300,000₸) — all yours forever, no monthly payments. Premium (500,000₸) — adds native mobile app for iOS and Android.',
      },
    ],
  },

  // CTA Section
  cta: {
    // badge: 'First 5 coffee shops — month free',
    headline: 'Ready to earn +353,000₸/mo?',
    description: 'Get a personalized calculation for your coffee shop. See specific revenue growth numbers. No spam — just an honest conversation about money.',
    button: 'Get calculation for my coffee shop',
    responseTime: 'We\'ll respond in 15 minutes',
    stats: [
      { value: '2 mo', label: 'Average payback' },
      { value: '10 days', label: 'From request to launch' },
      { value: '447%', label: 'Average ROI' },
    ],
    guarantee: {
      title: 'Money-back Guarantee',
      description: 'Don\'t see results in 3 months — 100% refund',
    },
  },

  // Footer
  footer: {
    navLabel: 'Footer navigation',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Calculator', href: '#calculator' },
      { label: 'Reviews', href: '#testimonials' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
    copyright: '© 2025 Brewly. All rights reserved.',
  },

  // Request Modal
  modal: {
    title: 'Request Demo',
    subtitle: 'Fill out the form and we\'ll contact you via WhatsApp',
    close: 'Close',
    fields: {
      name: 'Your name',
      coffeeshopName: 'Coffee shop name',
      city: 'City',
      plan: 'Select plan',
    },
    placeholders: {
      name: 'What\'s your name?',
      coffeeshopName: 'Coffee Addict, Brew Bar...',
      city: 'Almaty, Astana...',
    },
    plans: {
      subscription: 'Subscription',
      standard: 'Standard',
      premium: 'Premium',
    },
    submit: 'Send via WhatsApp',
    sending: 'Sending...',
    privacy: 'By clicking, you agree to the processing of personal data',
    whatsappMessage: '👋 Hello!\n\n📋 Brewly Request:\n\n👤 Name: {name}\n☕ Coffee shop: {coffeeshopName}\n📍 City: {city}\n💼 Plan: {plan}\n\nLooking forward to hearing back!',
  },
};
