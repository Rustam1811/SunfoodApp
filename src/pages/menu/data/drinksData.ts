export interface Recommendation {
  id: number;
  title: string; // Ключ для t()
  image: string;
}

export interface Modifier {
  id: number;
  title: string;
  type: 'select' | 'multi' | 'toggle' | 'slider';
  options?: string[];
  default: any;
  min?: number;
  max?: number;
}

export interface TogetherBetter {
  id: number;
  name: string;
  image: string;
}

export interface Review {
  user: string;
  text: string;
  rating?: number;
}

export interface NutritionInfo {
  energy: string; // ккал
  protein: string; // г
  fat: string;     // г
  carbs: string;   // г
}

export interface FoodPairing {
  id: number;
  name: string;
  price: number;
  image: string;
}

export interface Product {
  id: number;
  name: string; // Ключ для t()
  price: number;
  description: string; // Ключ для t()
  ingredients: string[]; // Массив ключей для t()
  recommendation: string; // Ключ для t()
  recommendations?: Recommendation[];
  image: string;
  isNew?: boolean;
  isHit?: boolean;
  energy: number;
  protein: number;
  fat: number;
  carbs: number;
  caffeine?: number;
  modifiers: Modifier[];
  togetherBetter: TogetherBetter[];
  badges: string[];
  promo?: string;
  bonusPay: number;
  rating: number;
  reviews: Review[];
  allergens: string[];
  shortDesc?: string;
  nutrition?: NutritionInfo; // сделать optional для fallback
  pairings?: FoodPairing[];
}

export interface DrinkCategory {
  id: number;
  title: string; // Ключ для t()
  image: string;
  products: Product[];
  icon?: React.ReactNode;
}

export const drinkCategories: DrinkCategory[] = [
  {
    id: 1,
    title: 'menu.categories.black_coffee',
    image: '/drinks/blackcoffee/espresso.png',
    products: [
      {
        id: 101,
        name: 'menu.espresso.name',
        price: 990,
        description: 'menu.espresso.description',
        ingredients: [
          'menu.espresso.ingredients.0',
          'menu.espresso.ingredients.1'
        ],
        recommendation: 'menu.espresso.recommendation',
        image: '/drinks/blackcoffee/espresso.png',
        recommendations: [
          {
            id: 1001,
            title: 'menu.croissant',
            image: 'https://example.com/croissant.jpeg'
          }
        ],
        isNew: false,
        isHit: true,
        energy: 15,
        protein: 0.6,
        fat: 0.2,
        carbs: 0.5,
        caffeine: 120,
        modifiers: [
          { id: 1, title: "Объем", type: "select", options: ["Одинарный", "Двойной"], default: "Одинарный" },
          { id: 2, title: "Сахар", type: "toggle", default: false },
          { id: 3, title: "Крепость", type: "slider", min: 1, max: 3, default: 2 }
        ],
        togetherBetter: [
          { id: 1001, name: "Круассан классический", image: "/food/сытные-круассаны/круассан-классический.png" },
          { id: 1201, name: "Печенье Слимс", image: "/food/выпечка/печенье-слимс.png" }
        ],
        badges: ["HIT"],
        promo: "Покупай утром до 10:00 - скидка 15%",
        bonusPay: 150,
        rating: 4.7,
        reviews: [
          { user: "Асель", text: "Отличный эспрессо! Настоящий вкус кофе", rating: 5 },
          { user: "Данияр", text: "Крепкий и ароматный, как я люблю", rating: 5 }
        ],
        allergens: []
      },
      {
        id: 102,
        name: 'menu.americano.name',
        price: 1090,
        description: 'menu.americano.description',
        ingredients: [
          'menu.americano.ingredients.0',
          'menu.americano.ingredients.1'
        ],
        recommendation: 'menu.americano.recommendation',
        image: '/drinks/blackcoffee/americano.png',
        recommendations: [
          {
            id: 1002,
            title: 'menu.sandwich',
            image: 'https://example.com/sandwich.jpeg'
          }
        ],
        isNew: false,
        isHit: false,
        energy: 20,
        protein: 0.8,
        fat: 0.3,
        carbs: 1.2,
        caffeine: 100,
        modifiers: [
          { id: 1, title: "Объем", type: "select", options: ["250мл", "350мл", "450мл"], default: "350мл" },
          { id: 2, title: "Сироп", type: "multi", options: ["Ваниль", "Карамель", "Орех"], default: [] },
          { id: 3, title: "Сахар", type: "toggle", default: false },
          { id: 4, title: "Молоко", type: "select", options: ["Без молока", "Обычное", "Овсяное"], default: "Без молока" }
        ],
        togetherBetter: [
          { id: 1002, name: "Круассан с сыром", image: "/food/сытные-круассаны/круассан-с-сыром.png" },
          { id: 1101, name: "Панини Моцарелла Песто", image: "/food/панини/панини-моцарелла-песто.png" }
        ],
        badges: [],
        promo: "Купи 2 - получи 3-й в подарок по воскресеньям",
        bonusPay: 200,
        rating: 4.5,
        reviews: [
          { user: "Максат", text: "Хороший американо, не слишком крепкий", rating: 4 },
          { user: "Лаура", text: "Идеально для утра, бодрит отлично", rating: 5 }
        ],
        allergens: []
      },
      {
        id: 103,
        name: 'menu.batch_brew.name',
        price: 1090,
        description: 'menu.batch_brew.description',
        ingredients: [
          'menu.batch_brew.ingredients.0'
        ],
        recommendation: 'menu.batch_brew.recommendation',
        image: '/drinks/blackcoffee/batchbru.png',
        recommendations: [
          {
            id: 1003,
            title: 'menu.pastry',
            image: 'https://example.com/pastry.jpeg'
          }
        ],
        isNew: true,
        isHit: false,
        energy: 25,
        protein: 1.0,
        fat: 0.4,
        carbs: 1.8,
        caffeine: 85,
        modifiers: [
          { id: 1, title: "Объем", type: "select", options: ["300мл", "400мл"], default: "300мл" },
          { id: 2, title: "Сахар", type: "toggle", default: false },
          { id: 3, title: "Молоко", type: "select", options: ["Без молока", "Обычное", "Овсяное"], default: "Без молока" }
        ],
        togetherBetter: [
          { id: 1202, name: "Миндальный круассан", image: "/food/выпечка/миндальный-круассан.png" },
          { id: 1205, name: "Коричное пирожное", image: "/food/выпечка/пирожное-шу-с-шоколадом.png" }
        ],
        badges: ["NEW"],
        promo: "Новинка! Попробуй альтернативный способ заваривания",
        bonusPay: 180,
        rating: 4.3,
        reviews: [
          { user: "Айгуль", text: "Интересный вкус, мягче обычного кофе", rating: 4 },
          { user: "Ерлан", text: "Необычно, но мне понравилось", rating: 4 }
        ],
        allergens: []
      },
      {
        id: 104,
        name: 'menu.lungo_aeropress.name',
        price: 1890,
        description: 'menu.lungo_aeropress.description',
        ingredients: [
          'menu.lungo_aeropress.ingredients.0',
          'menu.lungo_aeropress.ingredients.1'
        ],
        recommendation: 'menu.lungo_aeropress.recommendation',
        image: '/drinks/blackcoffee/aeropress.png',
        recommendations: [
          {
            id: 1004,
            title: 'menu.cookie',
            image: 'https://example.com/cookie.jpeg'
          }
        ],
        isNew: false,
        isHit: false,
        energy: 30,
        protein: 1.2,
        fat: 0.5,
        carbs: 2.1,
        caffeine: 110,
        modifiers: [
          { id: 1, title: "Сахар", type: "toggle", default: false },
          { id: 2, title: "Интенсивность", type: "slider", min: 1, max: 5, default: 3 }
        ],
        togetherBetter: [
          { id: 1204, name: "Шоколадный круассан", image: "/food/выпечка/шоколадный-круассан.png" },
          { id: 1207, name: "Трайфл", image: "/food/выпечка/трайфл.png" }
        ],
        badges: [],
        promo: "Для ценителей - особый способ приготовления",
        bonusPay: 300,
        rating: 4.6,
        reviews: [
          { user: "Сергей", text: "Очень чистый вкус, без горечи", rating: 5 },
          { user: "Жанара", text: "Дорого, но того стоит", rating: 4 }
        ],
        allergens: []
      },
      {
        id: 105,
        name: 'menu.barista_set.name',
        price: 2990,
        description: 'menu.barista_set.description',
        ingredients: [
          'menu.barista_set.ingredients.0',
          'menu.barista_set.ingredients.1',
          'menu.barista_set.ingredients.2'
        ],
        recommendation: 'menu.barista_set.recommendation',
        image: '/drinks/blackcoffee/batchbru.png',
        recommendations: [
          {
            id: 1005,
            title: 'menu.dessert_set',
            image: 'https://example.com/dessert-set.jpeg'
          }
        ],
        isNew: false,
        isHit: true,
        energy: 45,
        protein: 2.0,
        fat: 0.8,
        carbs: 3.5,
        caffeine: 200,
        modifiers: [
          { id: 1, title: "Тип зерна", type: "select", options: ["Арабика", "Смесь"], default: "Арабика" },
          { id: 2, title: "Степень обжарки", type: "select", options: ["Светлая", "Средняя", "Темная"], default: "Средняя" }
        ],
        togetherBetter: [
          { id: 1005, name: "Круассан лосось гурме", image: "/food/сытные-круассаны/круассан-лосось-гурме.png" },
          { id: 1104, name: "Панини лосось гурме", image: "/food/панини/панини-лосось-гурме.png" }
        ],
        badges: ["HIT"],
        promo: "Комплект для истинных ценителей кофе",
        bonusPay: 450,
        rating: 4.8,
        reviews: [
          { user: "Алмас", text: "Отличный набор! Попробовал разные виды", rating: 5 },
          { user: "Динара", text: "Дорого, но качество превосходное", rating: 5 }
        ],
        allergens: []
      }
    ]
  },
  {
    id: 2,
    title: 'menu.categories.seasonal',
    image: 'https://example.com/seasonal-category.jpeg',
    products: [
      {
        id: 201,
        name: 'menu.cola_bro_strawberry_blueberry.name',
        price: 1490,
        description: 'menu.cola_bro_strawberry_blueberry.description',
        ingredients: [
          'menu.cola_bro_strawberry_blueberry.ingredients.0',
          'menu.cola_bro_strawberry_blueberry.ingredients.1',
          'menu.cola_bro_strawberry_blueberry.ingredients.2'
        ],
        recommendation: 'menu.cola_bro_strawberry_blueberry.recommendation',
        image: '/drinks/сезонное/кола-бро-клубника-черника.png',
        recommendations: [
          {
            id: 2001,
            title: 'menu.summer_dessert',
            image: 'https://example.com/summer-dessert.jpeg'
          }
        ],
        isNew: true,
        isHit: true,
        energy: 180,
        protein: 1.5,
        fat: 0.3,
        carbs: 42.0,
        caffeine: 35,
        modifiers: [
          { id: 1, title: "Лёд", type: "select", options: ["Мало", "Средне", "Много"], default: "Средне" },
          { id: 2, title: "Сладость", type: "slider", min: 0, max: 100, default: 70 },
          { id: 3, title: "Газировка", type: "toggle", default: true }
        ],
        togetherBetter: [
          { id: 1203, name: "Фисташковый круассан", image: "/food/выпечка/фисташковый-круассан.png" },
          { id: 1201, name: "Печенье Слимс", image: "/food/выпечка/печенье-слимс.png" }
        ],
        badges: ["NEW", "HIT"],
        promo: "Летний хит! Освежающий вкус ягод",
        bonusPay: 220,
        rating: 4.4,
        reviews: [
          { user: "Амина", text: "Очень освежает в жару!", rating: 5 },
          { user: "Тимур", text: "Необычный вкус, детям понравилось", rating: 4 }
        ],
        allergens: []
      },
      {
        id: 202,
        name: 'menu.cardamom_syrup.name',
        price: 1290,
        description: 'menu.cardamom_syrup.description',
        ingredients: [
          'menu.cardamom_syrup.ingredients.0',
          'menu.cardamom_syrup.ingredients.1'
        ],
        recommendation: 'menu.cardamom_syrup.recommendation',
        image: '/drinks/сезонное/кардамоновый-сироп.png',
        recommendations: [
          {
            id: 2002,
            title: 'menu.spiced_cookie',
            image: 'https://example.com/spiced-cookie.jpeg'
          }
        ],
        isNew: false,
        isHit: false,
        energy: 220,
        protein: 3.2,
        fat: 8.5,
        carbs: 28.0,
        caffeine: 80,
        modifiers: [
          { id: 1, title: "Молоко", type: "select", options: ["Обычное", "Овсяное", "Кокосовое"], default: "Обычное" },
          { id: 2, title: "Специи", type: "multi", options: ["Корица", "Имбирь", "Мускатный орех"], default: ["Корица"] },
          { id: 3, title: "Температура", type: "select", options: ["Горячий", "Тёплый"], default: "Горячий" }
        ],
        togetherBetter: [
          { id: 1206, name: "Эклер де ната", image: "/food/выпечка/паштел-де-ната.png" },
          { id: 1205, name: "Коричное пирожное", image: "/food/выпечка/пирожное-шу-с-шоколадом.png" }
        ],
        badges: [],
        promo: "Согревающий напиток с восточными нотами",
        bonusPay: 200,
        rating: 4.2,
        reviews: [
          { user: "Гульнара", text: "Очень ароматный, напоминает детство", rating: 4 },
          { user: "Бахтияр", text: "Интересное сочетание специй", rating: 4 }
        ],
        allergens: ["Молоко"]
      },
      {
        id: 203,
        name: 'menu.lavender_mint.name',
        price: 1690,
        description: 'menu.lavender_mint.description',
        ingredients: [
          'menu.lavender_mint.ingredients.0',
          'menu.lavender_mint.ingredients.1',
          'menu.lavender_mint.ingredients.2'
        ],
        recommendation: 'menu.lavender_mint.recommendation',
        image: '/drinks/сезонное/лавандовая-мята.png',
        recommendations: [
          {
            id: 2003,
            title: 'menu.herbal_cake',
            image: 'https://example.com/herbal-cake.jpeg'
          }
        ],
        isNew: true,
        isHit: false,
        energy: 85,
        protein: 0.5,
        fat: 0.1,
        carbs: 20.5,
        modifiers: [
          { id: 1, title: "Сладость", type: "select", options: ["Без сахара", "Мёд", "Сироп"], default: "Мёд" },
          { id: 2, title: "Температура", type: "select", options: ["Горячий", "Холодный"], default: "Горячий" },
          { id: 3, title: "Лёд", type: "toggle", default: false }
        ],
        togetherBetter: [
          { id: 1207, name: "Трайфл", image: "/food/выпечка/трайфл.png" },
          { id: 1202, name: "Миндальный круассан", image: "/food/выпечка/миндальный-круассан.png" }
        ],
        badges: ["NEW"],
        promo: "Расслабляющий напиток для умиротворения",
        bonusPay: 250,
        rating: 4.1,
        reviews: [
          { user: "Назира", text: "Очень успокаивает, пью перед сном", rating: 4 },
          { user: "Олжас", text: "Необычно, но приятно", rating: 4 }
        ],
        allergens: []
      },
      {
        id: 204,
        name: 'menu.tropical_mix.name',
        price: 1690,
        description: 'menu.tropical_mix.description',
        ingredients: [
          'menu.tropical_mix.ingredients.0',
          'menu.tropical_mix.ingredients.1',
          'menu.tropical_mix.ingredients.2'
        ],
        recommendation: 'menu.tropical_mix.recommendation',
        image: '/drinks/сезонное/тропический-микс.png',
        recommendations: [
          {
            id: 2004,
            title: 'menu.tropical_dessert',
            image: 'https://example.com/tropical-dessert.jpeg'
          }
        ],
        isNew: false,
        isHit: true,
        energy: 195,
        protein: 2.1,
        fat: 0.8,
        carbs: 48.0,
        modifiers: [
          { id: 1, title: "Фрукты", type: "multi", options: ["Манго", "Ананас", "Маракуйя", "Кокос"], default: ["Манго", "Ананас"] },
          { id: 2, title: "Лёд", type: "select", options: ["Мало", "Средне", "Много"], default: "Много" },
          { id: 3, title: "Газировка", type: "toggle", default: false }
        ],
        togetherBetter: [
          { id: 1203, name: "Фисташковый круассан", image: "/food/выпечка/фисташковый-круассан.png" },
          { id: 1004, name: "Круассан с говядиной", image: "/food/сытные-круассаны/круассан-с-говядиной.png" }
        ],
        badges: ["HIT"],
        promo: "Вкус тропиков в сердце Астаны",
        bonusPay: 250,
        rating: 4.6,
        reviews: [
          { user: "Асем", text: "Как будто на отдыхе! Очень вкусно", rating: 5 },
          { user: "Нурлан", text: "Освежающий, идеально летом", rating: 5 }
        ],
        allergens: []
      },
      {
        id: 205,
        name: 'menu.affogato.name',
        price: 1690,
        description: 'menu.affogato.description',
        ingredients: [
          'menu.affogato.ingredients.0',
          'menu.affogato.ingredients.1',
          'menu.affogato.ingredients.2'
        ],
        recommendation: 'menu.affogato.recommendation',
        image: '/drinks/сезонное/аффогато.png',
        recommendations: [
          {
            id: 2005,
            title: 'menu.gelato',
            image: 'https://example.com/gelato.jpeg'
          }
        ],
        isNew: false,
        isHit: false,
        energy: 165,
        protein: 4.2,
        fat: 7.8,
        carbs: 18.5,
        caffeine: 75,
        modifiers: [
          { id: 1, title: "Мороженое", type: "select", options: ["Ванильное", "Шоколадное", "Карамельное"], default: "Ванильное" },
          { id: 2, title: "Кофе", type: "select", options: ["Эспрессо", "Двойной эспрессо"], default: "Эспрессо" },
          { id: 3, title: "Топпинг", type: "multi", options: ["Орехи", "Шоколадная стружка", "Карамель"], default: [] }
        ],
        togetherBetter: [
          { id: 1204, name: "Шоколадный круассан", image: "/food/выпечка/шоколадный-круассан.png" },
          { id: 1201, name: "Печенье Слимс", image: "/food/выпечка/печенье-слимс.png" }
        ],
        badges: [],
        promo: "Десерт и кофе в одном стакане!",
        bonusPay: 250,
        rating: 4.5,
        reviews: [
          { user: "Дана", text: "Идеальное сочетание горячего и холодного", rating: 5 },
          { user: "Ержан", text: "Необычно, но очень вкусно", rating: 4 }
        ],
        allergens: ["Молоко"]
      }
    ]
  },
  {
    id: 3,
    title: 'menu.categories.milk_coffee',
    image: 'https://example.com/milk-coffee-category.jpeg',
    products: [
      {
        id: 301,
        name: 'menu.cappuccino.name',
        price: 1490,
        description: 'menu.cappuccino.description',
        ingredients: [
          'menu.cappuccino.ingredients.0',
          'menu.cappuccino.ingredients.1'
        ],
        recommendation: 'menu.cappuccino.recommendation',
        image: '/drinks/кофе-с-молоком/капучино.png',
        recommendations: [
          {
            id: 3001,
            title: 'menu.morning_pastry',
            image: 'https://example.com/morning-pastry.jpeg'
          }
        ],
        isNew: false,
        isHit: true,
        energy: 150,
        protein: 8.5,
        fat: 8.2,
        carbs: 12.0,
        caffeine: 80,
        modifiers: [
          { id: 1, title: "Молоко", type: "select", options: ["Обычное", "Овсяное", "Кокосовое", "Безлактозное"], default: "Обычное" },
          { id: 2, title: "Сироп", type: "multi", options: ["Ваниль", "Карамель", "Орех"], default: [] },
          { id: 3, title: "Пенка", type: "select", options: ["Классическая", "Плотная", "Лёгкая"], default: "Классическая" },
          { id: 4, title: "Температура", type: "select", options: ["Горячий", "Тёплый"], default: "Горячий" }
        ],
        togetherBetter: [
          { id: 1001, name: "Круассан классический", image: "/food/сытные-круассаны/круассан-классический.png" },
          { id: 1202, name: "Миндальный круассан", image: "/food/выпечка/миндальный-круассан.png" }
        ],
        badges: ["HIT"],
        promo: "Классика жанра - идеально для завтрака",
        bonusPay: 220,
        rating: 4.7,
        reviews: [
          { user: "Айжан", text: "Лучший капучино в городе!", rating: 5 },
          { user: "Арман", text: "Пенка просто идеальная", rating: 5 }
        ],
        allergens: ["Молоко"]
      },
      {
        id: 302,
        name: 'menu.flat_white.name',
        price: 1590,
        description: 'menu.flat_white.description',
        ingredients: [
          'menu.flat_white.ingredients.0',
          'menu.flat_white.ingredients.1'
        ],
        recommendation: 'menu.flat_white.recommendation',
        image: '/drinks/кофе-с-молоком/флэт-уайт.png',
        recommendations: [
          {
            id: 3002,
            title: 'menu.biscuit',
            image: 'https://example.com/biscuit.jpeg'
          }
        ],
        isNew: false,
        isHit: false,
        energy: 135,
        protein: 7.8,
        fat: 7.5,
        carbs: 10.2,
        caffeine: 95,
        modifiers: [
          { id: 1, title: "Молоко", type: "select", options: ["Обычное", "Овсяное", "Кокосовое"], default: "Обычное" },
          { id: 2, title: "Крепость", type: "slider", min: 1, max: 3, default: 2 },
          { id: 3, title: "Сироп", type: "multi", options: ["Ваниль", "Карамель"], default: [] }
        ],
        togetherBetter: [
          { id: 1204, name: "Шоколадный круассан", image: "/food/выпечка/шоколадный-круассан.png" },
          { id: 1101, name: "Панини Моцарелла Песто", image: "/food/панини/панини-моцарелла-песто.png" }
        ],
        badges: [],
        promo: "Для ценителей крепкого кофе с молоком",
        bonusPay: 240,
        rating: 4.4,
        reviews: [
          { user: "Самат", text: "Крепче капучино, мне нравится", rating: 4 },
          { user: "Жадыра", text: "Хороший баланс кофе и молока", rating: 4 }
        ],
        allergens: ["Молоко"]
      },
      {
        id: 303,
        name: 'menu.latte.name',
        price: 1490,
        description: 'menu.latte.description',
        ingredients: [
          'menu.latte.ingredients.0',
          'menu.latte.ingredients.1'
        ],
        recommendation: 'menu.latte.recommendation',
        image: '/drinks/кофе-с-молоком/латте.png',
        recommendations: [
          {
            id: 3003,
            title: 'menu.cookie',
            image: 'https://example.com/cookie.jpeg'
          }
        ],
        isNew: false,
        isHit: true,
        energy: 158,
        protein: 8.2,
        fat: 8.1,
        carbs: 12.6,
        caffeine: 75,
        modifiers: [
          { id: 1, title: "Молоко", type: "select", options: ["Обычное", "Овсяное", "Кокосовое", "Миндальное"], default: "Обычное" },
          { id: 2, title: "Размер", type: "select", options: ["250мл", "350мл", "450мл"], default: "350мл" },
          { id: 3, title: "Сироп", type: "multi", options: ["Ваниль", "Карамель", "Лесной орех"], default: [] }
        ],
        togetherBetter: [
          { id: 1205, name: "Миндальный круассан", image: "/food/выпечка/миндальный-круассан.png" },
          { id: 1301, name: "Тирамису", image: "/food/десерты/тирамису.png" }
        ],
        badges: ["ХИТ"],
        promo: "Классический латте с нежной молочной пеной",
        bonusPay: 220,
        rating: 4.6,
        reviews: [
          { user: "Айгуль", text: "Очень нежный вкус, люблю этот латте", rating: 5 },
          { user: "Дарын", text: "Хорошая пенка, вкусно", rating: 4 },
          { user: "Мадина", text: "Мой любимый кофе!", rating: 5 }
        ],
        allergens: ["Молоко"]
      },
      {
        id: 304,
        name: 'menu.mocha.name',
        price: 1690,
        description: 'menu.mocha.description',
        ingredients: [
          'menu.mocha.ingredients.0',
          'menu.mocha.ingredients.1',
          'menu.mocha.ingredients.2'
        ],
        recommendation: 'menu.mocha.recommendation',
        image: '/drinks/кофе-с-молоком/мокка.png',
        recommendations: [
          {
            id: 3004,
            title: 'menu.chocolate_cake',
            image: 'https://example.com/chocolate-cake.jpeg'
          }
        ],
        isNew: false,
        isHit: false,
        energy: 198,
        protein: 9.1,
        fat: 9.8,
        carbs: 18.4,
        caffeine: 85,
        modifiers: [
          { id: 1, title: "Молоко", type: "select", options: ["Обычное", "Овсяное", "Кокосовое"], default: "Обычное" },
          { id: 2, title: "Шоколад", type: "select", options: ["Молочный", "Темный", "Белый"], default: "Молочный" },
          
        ],
        togetherBetter: [
          { id: 1302, name: "Брауни", image: "/food/десерты/брауни.png" },
          { id: 1206, name: "Шоколадный маффин", image: "/food/выпечка/шоколадный-маффин.png" }
        ],
        badges: [],
        promo: "Кофе с шоколадом и взбитыми сливками",
        bonusPay: 250,
        rating: 4.3,
        reviews: [
          { user: "Алия", text: "Сладко, но очень вкусно", rating: 4 },
          { user: "Батыр", text: "Отличный десертный кофе", rating: 4 }
        ],
        allergens: ["Молоко", "Глютен"]
      },
      {
        id: 305,
        name: 'menu.macchiato.name',
        price: 1390,
        description: 'menu.macchiato.description',
        ingredients: [
          'menu.macchiato.ingredients.0',
          'menu.macchiato.ingredients.1'
        ],
        recommendation: 'menu.macchiato.recommendation',
        image: '/drinks/кофе-с-молоком/маккиато.png',
        recommendations: [
          {
            id: 3005,
            title: 'menu.biscotti',
            image: 'https://example.com/biscotti.jpeg'
          }
        ],
        isNew: true,
        isHit: false,
        energy: 89,
        protein: 4.2,
        fat: 4.1,
        carbs: 6.8,
        caffeine: 105,
        modifiers: [
          { id: 1, title: "Молоко", type: "select", options: ["Обычное", "Овсяное", "Кокосовое"], default: "Обычное" },
          { id: 2, title: "Размер", type: "select", options: ["Одинарный", "Двойной"], default: "Одинарный" }
        ],
        togetherBetter: [
          { id: 1207, name: "Канноли", image: "/food/выпечка/канноли.png" },
          { id: 1102, name: "Панини Прошутто", image: "/food/панини/панини-прошутто.png" }
        ],
        badges: ["НОВИНКА"],
        promo: "Эспрессо с каплей молочной пены",
        bonusPay: 210,
        rating: 4.2,
        reviews: [
          { user: "Ернур", text: "Крепкий и ароматный", rating: 4 },
          { user: "Асель", text: "Интересный вкус, попробую еще", rating: 4 }
        ],
        allergens: ["Молоко"]
      },
      {
        id: 306,
        name: 'menu.cortado.name',
        price: 1540,
        description: 'menu.cortado.description',
        ingredients: [
          'menu.cortado.ingredients.0',
          'menu.cortado.ingredients.1'
        ],
        recommendation: 'menu.cortado.recommendation',
        image: '/drinks/кофе-с-молоком/кортадо.png',
        recommendations: [
          {
            id: 3006,
            title: 'menu.churros',
            image: 'https://example.com/churros.jpeg'
          }
        ],
        isNew: false,
        isHit: false,
        energy: 102,
        protein: 5.8,
        fat: 5.2,
        carbs: 7.4,
        caffeine: 90,
        modifiers: [
          { id: 1, title: "Молоко", type: "select", options: ["Обычное", "Овсяное"], default: "Обычное" },
          { id: 2, title: "Температура молока", type: "select", options: ["Горячее", "Теплое"], default: "Горячее" }
        ],
        togetherBetter: [
          { id: 1208, name: "Мадлен", image: "/food/выпечка/мадлен.png" },
          { id: 1103, name: "Тост Авокадо", image: "/food/панини/тост-авокадо.png" }
        ],
        badges: [],
        promo: "Испанский кофе с равными частями эспрессо и молока",
        bonusPay: 230,
        rating: 4.1,
        reviews: [
          { user: "Нуржан", text: "Хороший баланс кофе и молока", rating: 4 },
          { user: "Гульнара", text: "Попробовала впервые, понравилось", rating: 4 }
        ],
        allergens: ["Молоко"]
      }
    ]
  },
  {
  id: 4,
  title: 'menu.categories.alternative_drinks',
  image: 'https://example.com/alternative-drinks-category.jpeg',
  products: [
    {
      id: 401,
      name: 'menu.matcha_latte.name',
      price: 1790,
      description: 'menu.matcha_latte.description',
      ingredients: [
        'menu.matcha_latte.ingredients.0',
        'menu.matcha_latte.ingredients.1',
        'menu.matcha_latte.ingredients.2'
      ],
      recommendation: 'menu.matcha_latte.recommendation',
      image: '/drinks/альтернативные/матча-латте.png',
      recommendations: [
        {
          id: 4001,
          title: 'menu.green_tea_cookies',
          image: 'https://example.com/matcha-cookies.jpeg'
        }
      ],
      isNew: true,
      isHit: true,
      energy: 142,
      protein: 6.8,
      fat: 7.2,
      carbs: 14.6,
      caffeine: 35,
      modifiers: [
        { id: 1, title: "Молоко", type: "select", options: ["Обычное", "Овсяное", "Кокосовое", "Миндальное"], default: "Овсяное" },
        { id: 2, title: "Сладость", type: "slider", min: 0, max: 3, default: 1 },
        { id: 3, title: "Лед", type: "select", options: ["Горячий", "Холодный"], default: "Горячий" }
      ],
      togetherBetter: [
        { id: 1303, name: "Моти", image: "/food/десерты/моти.png" },
        { id: 1209, name: "Зеленые маффины", image: "/food/выпечка/зеленые-маффины.png" }
      ],
      badges: ["НОВИНКА", "ХИТ"],
      promo: "Японский зеленый чай с молоком",
      bonusPay: 270,
      rating: 4.7,
      reviews: [
        { user: "Аида", text: "Очень необычный и вкусный!", rating: 5 },
        { user: "Тимур", text: "Отличная альтернатива кофе", rating: 4 },
        { user: "Камила", text: "Нежный вкус, рекомендую", rating: 5 }
      ],
      allergens: ["Молоко"]
    },
    {
      id: 402,
      name: 'menu.turmeric_latte.name',
      price: 1590,
      description: 'menu.turmeric_latte.description',
      ingredients: [
        'menu.turmeric_latte.ingredients.0',
        'menu.turmeric_latte.ingredients.1',
        'menu.turmeric_latte.ingredients.2',
        'menu.turmeric_latte.ingredients.3'
      ],
      recommendation: 'menu.turmeric_latte.recommendation',
      image: '/drinks/альтернативные/куркума-латте.png',
      recommendations: [
        {
          id: 4002,
          title: 'menu.spiced_cookies',
          image: 'https://example.com/spiced-cookies.jpeg'
        }
      ],
      isNew: false,
      isHit: false,
      energy: 124,
      protein: 4.2,
      fat: 6.1,
      carbs: 12.8,
      caffeine: 0,
      modifiers: [
        { id: 1, title: "Молоко", type: "select", options: ["Обычное", "Овсяное", "Кокосовое", "Миндальное"], default: "Кокосовое" },
        { id: 3, title: "Температура", type: "select", options: ["Горячий", "Теплый"], default: "Горячий" }
      ],
      togetherBetter: [
        { id: 1205, name: "Имбирное печенье", image: "/food/выпечка/имбирное-печенье.png" },
        { id: 1401, name: "Медовые пряники", image: "/food/десерты/медовые-пряники.png" }
      ],
      badges: ["БЕЗ КОФЕИНА"],
      promo: "Золотое молоко с куркумой и специями",
      bonusPay: 240,
      rating: 4.3,
      reviews: [
        { user: "Санжар", text: "Необычно, но очень полезно", rating: 4 },
        { user: "Алия", text: "Согревает и тонизирует", rating: 5 },
        { user: "Дамир", text: "Интересный вкус специй", rating: 4 }
      ],
      allergens: ["Молоко"]
    },
    {
      id: 403,
      name: 'menu.beetroot_latte.name',
      price: 1690,
      description: 'menu.beetroot_latte.description',
      ingredients: [
        'menu.beetroot_latte.ingredients.0',
        'menu.beetroot_latte.ingredients.1',
        'menu.beetroot_latte.ingredients.2'
      ],
      recommendation: 'menu.beetroot_latte.recommendation',
      image: '/drinks/альтернативные/свекольный-латте.png',
      recommendations: [
        {
          id: 4003,
          title: 'menu.berry_cake',
          image: 'https://example.com/berry-cake.jpeg'
        }
      ],
      isNew: true,
      isHit: false,
      energy: 108,
      protein: 3.8,
      fat: 5.4,
      carbs: 11.2,
      caffeine: 0,
      modifiers: [
        { id: 1, title: "Молоко", type: "select", options: ["Обычное", "Овсяное", "Миндальное"], default: "Овсяное" },
        { id: 3, title: "Сладость", type: "slider", min: 0, max: 2, default: 1 }
      ],
      togetherBetter: [
        { id: 1302, name: "Ягодный чизкейк", image: "/food/десерты/ягодный-чизкейк.png" },
        { id: 1208, name: "Овсяное печенье", image: "/food/выпечка/овсяное-печенье.png" }
      ],
      badges: ["НОВИНКА", "СУПЕРФУД"],
      promo: "Яркий розовый напиток с пользой свеклы",
      bonusPay: 255,
      rating: 4.1,
      reviews: [
        { user: "Айгерим", text: "Красивый цвет и приятный вкус", rating: 4 },
        { user: "Ерлан", text: "Удивительно вкусно!", rating: 5 },
        { user: "Мадина", text: "Полезно и необычно", rating: 4 }
      ],
      allergens: ["Молоко"]
    },
    {
      id: 404,
      name: 'menu.blue_spirulina_latte.name',
      price: 1890,
      description: 'menu.blue_spirulina_latte.description',
      ingredients: [
        'menu.blue_spirulina_latte.ingredients.0',
        'menu.blue_spirulina_latte.ingredients.1',
        'menu.blue_spirulina_latte.ingredients.2',
        'menu.blue_spirulina_latte.ingredients.3'
      ],
      recommendation: 'menu.blue_spirulina_latte.recommendation',
      image: '/drinks/альтернативные/голубая-спирулина-латте.png',
      recommendations: [
        {
          id: 4004,
          title: 'menu.coconut_macarons',
          image: 'https://example.com/coconut-macarons.jpeg'
        }
      ],
      isNew: true,
      isHit: true,
      energy: 136,
      protein: 5.2,
      fat: 6.8,
      carbs: 13.4,
      caffeine: 0,
      modifiers: [
        { id: 1, title: "Молоко", type: "select", options: ["Кокосовое", "Миндальное", "Овсяное"], default: "Кокосовое" },
      ],
      togetherBetter: [
        { id: 1304, name: "Кокосовые макаруны", image: "/food/десерты/кокосовые-макаруны.png" },
        { id: 1210, name: "Протеиновые батончики", image: "/food/выпечка/протеиновые-батончики.png" }
      ],
      badges: ["НОВИНКА", "ХИТ", "СУПЕРФУД"],
      promo: "Голубое чудо природы для здоровья",
      bonusPay: 285,
      rating: 4.8,
      reviews: [
        { user: "Жанар", text: "Невероятный цвет и вкус!", rating: 5 },
        { user: "Асхат", text: "Очень красиво и полезно", rating: 5 },
        { user: "Диана", text: "Моя новая любимая альтернатива", rating: 4 }
      ],
      allergens: ["Молоко"]
    },
    {
      id: 405,
      name: 'menu.mushroom_coffee.name',
      price: 1790,
      description: 'menu.mushroom_coffee.description',
      ingredients: [
        'menu.mushroom_coffee.ingredients.0',
        'menu.mushroom_coffee.ingredients.1',
        'menu.mushroom_coffee.ingredients.2'
      ],
      recommendation: 'menu.mushroom_coffee.recommendation',
      image: '/drinks/альтернативные/грибной-кофе.png',
      recommendations: [
        {
          id: 4005,
          title: 'menu.healthy_granola',
          image: 'https://example.com/healthy-granola.jpeg'
        }
      ],
      isNew: false,
      isHit: false,
      energy: 89,
      protein: 2.1,
      fat: 3.4,
      carbs: 8.7,
      caffeine: 25,
      modifiers: [
        { id: 1, title: "Интенсивность", type: "slider", min: 1, max: 3, default: 2 },
        { id: 2, title: "Молоко", type: "select", options: ["Без молока", "Овсяное", "Миндальное"], default: "Без молока" },
      ],
      togetherBetter: [
        { id: 1211, name: "Гранола домашняя", image: "/food/выпечка/гранола-домашняя.png" },
        { id: 1405, name: "Энергетические шарики", image: "/food/десерты/энергетические-шарики.png" }
      ],
      badges: ["АДАПТОГЕН"],
      promo: "Кофе с экстрактами грибов чага и рейши",
      bonusPay: 270,
      rating: 4.0,
      reviews: [
        { user: "Нурлан", text: "Интересная альтернатива обычному кофе", rating: 4 },
        { user: "Гульмира", text: "Мягкий вкус без кислинки", rating: 4 },
        { user: "Болат", text: "Дает энергию без нервозности", rating: 4 }
      ],
      allergens: []
    },
    {
      id: 406,
      name: 'menu.chicory_coffee.name',
      price: 1390,
      description: 'menu.chicory_coffee.description',
      ingredients: [
        'menu.chicory_coffee.ingredients.0',
        'menu.chicory_coffee.ingredients.1'
      ],
      recommendation: 'menu.chicory_coffee.recommendation',
      image: '/drinks/альтернативные/цикорий-кофе.png',
      recommendations: [
        {
          id: 4006,
          title: 'menu.oat_cookies',
          image: 'https://example.com/oat-cookies.jpeg'
        }
      ],
      isNew: false,
      isHit: false,
      energy: 72,
      protein: 1.8,
      fat: 2.1,
      carbs: 9.4,
      caffeine: 0,
      modifiers: [
        { id: 1, title: "Молоко", type: "select", options: ["Обычное", "Овсяное", "Без молока"], default: "Обычное" },
        { id: 2, title: "Сладость", type: "slider", min: 0, max: 2, default: 0 },
      ],
      togetherBetter: [
        { id: 1201, name: "Печенье слимс", image: "/food/выпечка/печенье-слимс.png" },
        { id: 1406, name: "Домашние пряники", image: "/food/десерты/домашние-пряники.png" }
      ],
      badges: ["БЕЗ КОФЕИНА", "КЛАССИКА"],
      promo: "Традиционная альтернатива кофе из цикория",
      bonusPay: 210,
      rating: 3.9,
      reviews: [
        { user: "Алтынай", text: "Как в детстве у бабушки", rating: 4 },
        { user: "Марат", text: "Хорошая замена кофе вечером", rating: 4 },
        { user: "Роза", text: "Полезно и без кофеина", rating: 4 }
      ],
      allergens: ["Молоко"]
    }
  ]
}
]