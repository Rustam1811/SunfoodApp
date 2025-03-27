export interface Recommendation {
    id: number;
    title: string;
    image: string;
  }
  
  export interface FoodProduct {
    id: number;
    name: string;
    price: number;
    description: string;
    ingredients: string[];
    recommendation: string;
    recommendations?: Recommendation[];
    image: string;
  }
  
  export interface FoodCategory {
    id: number;
    title: string;
    image: string;
    products: FoodProduct[];
  }
  
  export const foodCategories: FoodCategory[] = [
    {
      id: 1,
      title: 'Выпечка',
      image:
        'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e3cb72f2-dab7-11ed-b001-a68c99edf6e7_______________________.jpeg',
      products: [
        {
          id: 101,
          name: 'Круассан с маслом',
          price: 250,
          description:
            'Ароматный круассан с хрустящей корочкой и сливочным маслом.',
          ingredients: ['Мука', 'Масло', 'Дрожжи', 'Соль'],
          recommendation: 'Идеально сочетается с крепким эспрессо или американо.',
          image: 'https://source.unsplash.com/featured/?croissant',
          recommendations: [
            {
              id: 201,
              title: 'Эспрессо (600 ₸)',
              image: 'https://source.unsplash.com/featured/?espresso'
            },
            {
              id: 203,
              title: 'Американо (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e213b760-22f7-11ef-85cf-e29a9b60cccb_sbx_wol_1440x810_americano.jpg'
            }
          ]
        },
        {
          id: 102,
          name: 'Маффин с ягодами',
          price: 300,
          description: 'Нежный маффин, наполненный свежими ягодами.',
          ingredients: ['Мука', 'Ягоды', 'Сахар', 'Яйца', 'Молоко'],
          recommendation: 'Отлично сочетается с мягким латте или флэт уайт.',
          image: 'https://source.unsplash.com/featured/?muffin',
          recommendations: [
            {
              id: 205,
              title: 'Латте (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            },
            {
              id: 202,
              title: 'Флэт Уайт (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Сэндвичи',
      image:
        'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e3cb72f2-dab7-11ed-b001-a68c99edf6e7_______________________.jpeg',
      products: [
        {
          id: 201,
          name: 'Куриный сэндвич',
          price: 450,
          description: 'Сочный куриный сэндвич с овощами и соусом.',
          ingredients: ['Курица', 'Хлеб', 'Овощи', 'Соус'],
          recommendation: 'Подойдёт с капучино – для сбалансированного вкуса.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e3cb72f2-dab7-11ed-b001-a68c99edf6e7_______________________.jpeg',
          recommendations: [
            {
              id: 204,
              title: 'Капучино (990 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            },
            {
              id: 201,
              title: 'Эспрессо (600 ₸)',
              image: 'https://source.unsplash.com/featured/?espresso'
            }
          ]
        },
        {
          id: 202,
          name: 'Вегетарианский сэндвич',
          price: 400,
          description: 'Лёгкий сэндвич с овощами и хумусом.',
          ingredients: ['Хлеб', 'Овощи', 'Хумус'],
          recommendation: 'Подойдёт с лёгким американо.',
          image: 'https://source.unsplash.com/featured/?veggie,sandwich',
          recommendations: [
            {
              id: 203,
              title: 'Американо (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e213b760-22f7-11ef-85cf-e29a9b60cccb_sbx_wol_1440x810_americano.jpg'
            },
            {
              id: 202,
              title: 'Флэт Уайт (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Десерты',
      image:
        'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/aa659f80-e01e-11ed-b33d-f278011f66d4___________.jpeg',
      products: [
        {
          id: 301,
          name: 'Карамельное печенье',
          price: 350,
          description: 'Хрустящее печенье с насыщенным карамельным вкусом.',
          ingredients: ['Мука', 'Сахар', 'Карамель'],
          recommendation: 'Идеально сочетается с американо для сбалансированного вкуса.',
          image: 'https://example.com/caramelcookie_food.jpeg',
          recommendations: [
            {
              id: 203,
              title: 'Американо (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e213b760-22f7-11ef-85cf-e29a9b60cccb_sbx_wol_1440x810_americano.jpg'
            }
          ]
        },
        {
          id: 302,
          name: 'Брауни',
          price: 300,
          description: 'Насыщенный шоколадный десерт с нежной текстурой.',
          ingredients: ['Шоколад', 'Мука', 'Яйца', 'Сахар'],
          recommendation: 'Отлично дополняется с нежным латте.',
          image: 'https://example.com/brownie_food.jpeg',
          recommendations: [
            {
              id: 205,
              title: 'Латте (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        },
        {
          id: 1001,
          name: 'Чизкейк',
          price: 800,
          description: 'Нежный чизкейк с воздушной текстурой.',
          ingredients: ['Творог', 'Сахар', 'Яйца', 'Ваниль'],
          recommendation: 'Идеально сочетается с латте.',
          image: 'https://example.com/cheesecake.jpeg',
          recommendations: [
            {
              id: 205,
              title: 'Латте (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        },
        {
          id: 1003,
          name: 'Капкейк',
          price: 700,
          description: 'Нежный капкейк с кремовой начинкой.',
          ingredients: ['Мука', 'Сахар', 'Яйца', 'Крем'],
          recommendation: 'Отлично сочетается с флэт уайт.',
          image: 'https://example.com/cupcake.jpeg',
          recommendations: [
            {
              id: 202,
              title: 'Флэт Уайт (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        },
        {
          id: 1005,
          name: 'Тирамису',
          price: 1200,
          description: 'Классический итальянский десерт с маскарпоне.',
          ingredients: ['Маскарпоне', 'Кофе', 'Бисквит'],
          recommendation: 'Идеально сочетается с капучино.',
          image: 'https://example.com/tiramisu.jpeg',
          recommendations: [
            {
              id: 204,
              title: 'Капучино (990 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        },
        {
          id: 1006,
          name: 'Шоколадный торт',
          price: 1500,
          description: 'Насыщенный торт с шоколадным кремом.',
          ingredients: ['Шоколад', 'Мука', 'Яйца', 'Сливки'],
          recommendation: 'Отлично с американо.',
          image: 'https://example.com/chocolatetart.jpeg',
          recommendations: [
            {
              id: 203,
              title: 'Американо (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e213b760-22f7-11ef-85cf-e29a9b60cccb_sbx_wol_1440x810_americano.jpg'
            }
          ]
        },
        {
          id: 1007,
          name: 'Имбирное печенье',
          price: 400,
          description: 'Ароматное печенье с имбирем.',
          ingredients: ['Мука', 'Имбирь', 'Сахар', 'Масло'],
          recommendation: 'Подойдёт с глитвейном.',
          image: 'https://example.com/gingercookie.jpeg',
          recommendations: [
            {
              id: 207,
              title: 'Латте M&M’s (1450 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        },
        {
          id: 1008,
          name: 'Штрудель',
          price: 500,
          description: 'Классический штрудель с яблоками.',
          ingredients: ['Яблоки', 'Мука', 'Сахар', 'Корица'],
          recommendation: 'Отлично с глитвейном.',
          image: 'https://example.com/strudel.jpeg',
          recommendations: [
            {
              id: 207,
              title: 'Латте M&M’s (1450 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        },
        {
          id: 1015,
          name: 'Макароны',
          price: 600,
          description: 'Классическое блюдо макарон с соусом.',
          ingredients: ['Макароны', 'Соус'],
          recommendation: 'Сочетается с латте.',
          image: 'https://example.com/pasta.jpeg',
          recommendations: [
            {
              id: 205,
              title: 'Латте (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        },
        {
          id: 1016,
          name: 'Ореховый штрудель',
          price: 700,
          description: 'Штрудель с орехами.',
          ingredients: ['Мука', 'Орехи', 'Сахар'],
          recommendation: 'Подойдёт с ореховым латте.',
          image: 'https://example.com/nutstrudel.jpeg',
          recommendations: [
            {
              id: 206,
              title: 'Ореховый латте с корицей (1300 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        },
        {
          id: 1017,
          name: 'Булочка с корицей',
          price: 350,
          description: 'Нежная булочка с корицей.',
          ingredients: ['Мука', 'Корица', 'Сахар', 'Масло'],
          recommendation: 'Отлично с ореховым латте.',
          image: 'https://example.com/cinnamonroll.jpeg',
          recommendations: [
            {
              id: 206,
              title: 'Ореховый латте с корицей (1300 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        },
        {
          id: 1018,
          name: 'Донаты',
          price: 450,
          description: 'Сладкие пончики с глазурью.',
          ingredients: ['Мука', 'Сахар', 'Яйца', 'Масло'],
          recommendation: 'Идеально с латте M&M’s.',
          image: 'https://example.com/donuts.jpeg',
          recommendations: [
            {
              id: 207,
              title: 'Латте M&M’s (1450 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        },
        {
          id: 1019,
          name: 'Шоколадные маффины',
          price: 500,
          description: 'Маффины с кусочками шоколада.',
          ingredients: ['Мука', 'Сахар', 'Шоколад'],
          recommendation: 'Отлично с латте M&M’s.',
          image: 'https://example.com/chocolatemuffin.jpeg',
          recommendations: [
            {
              id: 207,
              title: 'Латте M&M’s (1450 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        }
      ]
    },
    {
      id: 5,
      title: 'Завтраки',
      image:
        'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e213b760-22f7-11ef-85cf-e29a9b60cccb_sbx_wol_1440x810_americano.jpg',
      products: [
        {
          id: 401,
          name: 'Овсяная каша с фруктами',
          price: 200,
          description: 'Питательная овсяная каша, украшенная свежими фруктами.',
          ingredients: ['Овсянка', 'Молоко', 'Фрукты'],
          recommendation: 'Сбалансирует вкус лёгким флэт уайт.',
          image: 'https://example.com/oatmeal.jpeg',
          recommendations: [
            {
              id: 202,
              title: 'Флэт Уайт (950 ₸)',
              image:
                'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg'
            }
          ]
        },
        {
          id: 402,
          name: 'Бутерброд с авокадо',
          price: 300,
          description: 'Полезный бутерброд с авокадо и яйцом для энергичного утра.',
          ingredients: ['Хлеб', 'Авокадо', 'Яйцо'],
          recommendation: 'Идеален с крепким эспрессо для бодрости.',
          image: 'https://example.com/avocadosandwich.jpeg',
          recommendations: [
            {
              id: 201,
              title: 'Эспрессо (600 ₸)',
              image: 'https://source.unsplash.com/featured/?espresso'
            }
          ]
        }
      ]
    }
  ];
  