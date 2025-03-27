export interface Recommendation {
    id: number;
    title: string;
    image: string;
  }
  
  export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    ingredients: string[];
    recommendation: string;
    recommendations?: Recommendation[]; 
    image: string;
  }
  
  export interface DrinkCategory {
    id: number;
    title: string;
    image: string;
    products: Product[];
  }
  
  export const drinkCategories: DrinkCategory[] = [
    {
      id: 1,
      title: 'Сезонные напитки',
      image:
        'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/8e918d94-df71-11ed-826f-be444133118d___________________.jpeg?w=200 200w',
      products: [
        {
          id: 101,
          name: 'Весенний Капучино',
          price: 450,
          description: 'Лёгкий капучино с оттенком весенних ароматов.',
          ingredients: ['Эспрессо', 'Молоко', 'Ванильный сироп'],
          recommendation: 'Рекомендуем с чизкейком.',
          image: 'https://imageproxy.wolt.com/menu/menu-images/...jpeg',
          recommendations: [
            {
              id: 1001,
              title: 'Чизкейк',
              image: 'https://example.com/cheesecake.jpeg'
            },
            {
              id: 1002,
              title: 'Круассан',
              image: 'https://example.com/croissant.jpeg'
            }
          ]
        },
        {
          id: 102,
          name: 'Раф ванильный',
          price: 1200,
          description:
            'Ароматный сливочный кофе с нотками ванили, сладкий и насыщенный.',
          ingredients: ['Эспрессо, сливки, ванильный сироп'],
          recommendation: 'Ванильные капкейки, белый шоколад.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg',
          recommendations: [
            {
              id: 1003,
              title: 'Капкейк',
              image: 'https://example.com/cupcake.jpeg'
            }
          ]
        },
        {
          id: 103,
          name: 'Американо',
          price: 950,
          description: 'Классический черный кофе с мягким вкусом.',
          ingredients: ['Эспрессо', 'Горячая вода'],
          recommendation: 'Карамельное печенье – идеальное дополнение.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e213b760-22f7-11ef-85cf-e29a9b60cccb_sbx_wol_1440x810_americano.jpg',
          recommendations: [
            {
              id: 1004,
              title: 'Карамельное печенье',
              image: 'https://example.com/caramelcookie.jpeg'
            }
          ]
        },
        {
          id: 104,
          name: 'Капучино',
          price: 990,
          description:
            'Идеальный баланс эспрессо, молока и воздушной пенки. Кремовый вкус с легкой горчинкой.',
          ingredients: ['Эспрессо', 'Молоко', 'Молочная пенка'],
          recommendation: 'Тирамису, шоколадный торт.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg',
          recommendations: [
            {
              id: 1005,
              title: 'Тирамису',
              image: 'https://example.com/tiramisu.jpeg'
            },
            {
              id: 1006,
              title: 'Шоколадный торт',
              image: 'https://example.com/chocolatetart.jpeg'
            }
          ]
        },
        {
          id: 105,
          name: 'Глитвейн',
          price: 750,
          description:
            'Пряный, согревающий напиток с фруктами и специями.',
          ingredients: ['Вишневый сок', 'Корица', 'Апельсин', 'Гвоздика', 'Мёд'],
          recommendation: 'Имбирное печенье, штрудель.',
          image: 'https://source.unsplash.com/featured/?espresso',
          recommendations: [
            {
              id: 1007,
              title: 'Имбирное печенье',
              image: 'https://example.com/gingercookie.jpeg'
            },
            {
              id: 1008,
              title: 'Штрудель',
              image: 'https://example.com/strudel.jpeg'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Напитки на основе эспрессо',
      image:
        'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e213b760-22f7-11ef-85cf-e29a9b60cccb_sbx_wol_1440x810_americano.jpg',
      products: [
        {
          id: 201,
          name: 'Эспрессо',
          price: 500,
          description:
            'Интенсивный и крепкий эспрессо для бодрого начала дня.',
          ingredients: ['Эспрессо'],
          recommendation: 'Отлично сочетается с круассаном.',
          image: 'https://source.unsplash.com/featured/?espresso',
          recommendations: [
            {
              id: 1009,
              title: 'Круассан',
              image: 'https://example.com/croissant2.jpeg'
            }
          ]
        },
        {
          id: 202,
          name: 'Флэт Уайт',
          price: 950,
          description:
            'Насыщенный кофейный вкус с бархатистой молочной текстурой.',
          ingredients: ['Двойной эспрессо', 'Микропенка'],
          recommendation: 'Отлично подходит к карамельному печенью.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg',
          recommendations: [
            {
              id: 1010,
              title: 'Карамельное печенье',
              image: 'https://example.com/caramelcookie.jpeg'
            }
          ]
        },
        {
          id: 203,
          name: 'Американо',
          price: 950,
          description: 'Классический черный кофе с мягким вкусом.',
          ingredients: ['Эспрессо', 'Горячая вода'],
          recommendation: 'Карамельное печенье – идеальное дополнение.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e213b760-22f7-11ef-85cf-e29a9b60cccb_sbx_wol_1440x810_americano.jpg',
          recommendations: [
            {
              id: 1011,
              title: 'Карамельное печенье',
              image: 'https://example.com/caramelcookie.jpeg'
            }
          ]
        },
        {
          id: 204,
          name: 'Капучино',
          price: 990,
          description: 'Идеальный баланс эспрессо, молока и воздушной пенки.',
          ingredients: ['Эспрессо', 'Молоко', 'Молочная пенка'],
          recommendation: 'Тирамису, шоколадный торт.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg',
          recommendations: [
            {
              id: 1012,
              title: 'Тирамису',
              image: 'https://example.com/tiramisu.jpeg'
            },
            {
              id: 1013,
              title: 'Шоколадный торт',
              image: 'https://example.com/chocolatetart.jpeg'
            }
          ]
        },
        {
          id: 205,
          name: 'Латте',
          price: 950,
          description: 'Легкий и сливочный напиток с мягким кофейным вкусом.',
          ingredients: ['Эспрессо', 'Молоко'],
          recommendation: 'Макароны, чизкейк.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg',
          recommendations: [
            {
              id: 1014,
              title: 'Чизкейк',
              image: 'https://example.com/cheesecake2.jpeg'
            },
            {
              id: 1015,
              title: 'Макароны',
              image: 'https://example.com/pasta.jpeg'
            }
          ]
        },
        {
          id: 206,
          name: 'Ореховый латте с корицей',
          price: 1300,
          description: 'Глубокий ореховый аромат с приятной пряностью корицы.',
          ingredients: ['Эспрессо', 'Молоко', 'Ореховый сироп', 'Корица'],
          recommendation: 'Ореховый штрудель, булочка с корицей.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg',
          recommendations: [
            {
              id: 1016,
              title: 'Ореховый штрудель',
              image: 'https://example.com/nutstrudel.jpeg'
            },
            {
              id: 1017,
              title: 'Булочка с корицей',
              image: 'https://example.com/cinnamonroll.jpeg'
            }
          ]
        },
        {
          id: 207,
          name: 'Латте M&M’s',
          price: 1450,
          description: 'Сладкий и игривый напиток с вкусом шоколадных конфет.',
          ingredients: ['Эспрессо', 'Молоко', 'Шоколадный сироп', 'M&M’s'],
          recommendation: 'Донаты, шоколадные маффины.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg',
          recommendations: [
            {
              id: 1018,
              title: 'Донаты',
              image: 'https://example.com/donuts.jpeg'
            },
            {
              id: 1019,
              title: 'Шоколадные маффины',
              image: 'https://example.com/chocolatemuffin.jpeg'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Фильтр кофе',
      image:
        'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/e213b760-22f7-11ef-85cf-e29a9b60cccb_sbx_wol_1440x810_americano.jpg',
      products: [
        {
          id: 301,
          name: 'Фильтр кофе',
          price: 350,
          description: 'Ароматный свежесваренный кофе, приготовленный вручную.',
          ingredients: ['Свежемолотый кофе', 'Вода'],
          recommendation: 'Попробуйте с маффином.',
          image: 'https://source.unsplash.com/featured/?filter,coffee',
          recommendations: [
            {
              id: 1021,
              title: 'Маффин',
              image: 'https://example.com/muffin.jpeg'
            }
          ]
        }
      ]
    },
    {
      id: 4,
      title: 'Фраппучино',
      image:
        'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/37764a64-df75-11ed-b9b9-9a5933180c6e__________.jpeg',
      products: [
        {
          id: 401,
          name: 'Айс латте',
          price: 1150,
          description: 'Освежающий холодный кофе с молоком и льдом.',
          ingredients: ['Эспрессо, молоко, лёд.'],
          recommendation: 'Вафли, ягодные маффины.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/c0439ee6-df6b-11ed-922c-96784c6eb084__________.jpeg',
          recommendations: [
            {
              id: 1022,
              title: 'Вафли',
              image: 'https://example.com/waffles.jpeg'
            },
            {
              id: 1023,
              title: 'Ягодные маффины',
              image: 'https://example.com/berrymuffin.jpeg'
            }
          ]
        },
        {
          id: 402,
          name: 'Айс американо',
          price: 520,
          description: 'Лёгкий и бодрящий охлаждённый чёрный кофе.',
          ingredients: ['Эспрессо, ледяная вода.'],
          recommendation: 'Попробуйте с чизкейком.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/6e7200b2-df6b-11ed-9b90-c24749d793bf______________.jpeg',
          recommendations: [
            {
              id: 1024,
              title: 'Чизкейк',
              image: 'https://example.com/cheesecake3.jpeg'
            }
          ]
        },
        {
          id: 403,
          name: 'Фраппучино',
          price: 520,
          description: 'Густой кофейный коктейль с карамельной сладостью.',
          ingredients: ['Эспрессо, молоко, лёд, сироп, взбитые сливки.'],
          recommendation: 'Рекомендуем Чизкейк Нью-Йорк.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/37764a64-df75-11ed-b9b9-9a5933180c6e__________.jpeg',
          recommendations: [
            {
              id: 1025,
              title: 'Чизкейк Нью-Йорк',
              image: 'https://example.com/nycheesecake.jpeg'
            }
          ]
        },
        {
          id: 404,
          name: 'Гляссе',
          price: 1550,
          description: 'Кофе с шариком мороженого – нежность и бодрость в одном стакане.',
          ingredients: ['Эспрессо, ванильное мороженое.'],
          recommendation: 'Тарталетки с ягодами, круассан.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/37764a64-df75-11ed-b9b9-9a5933180c6e__________.jpeg',
          recommendations: [
            {
              id: 1026,
              title: 'Тарталетки',
              image: 'https://example.com/tartlets.jpeg'
            },
            {
              id: 1027,
              title: 'Круассан',
              image: 'https://example.com/croissant3.jpeg'
            }
          ]
        },
        {
          id: 405,
          name: 'Бамбл кофе',
          price: 1500,
          description: 'Цитрусовый холодный кофе с освежающей кислинкой.',
          ingredients: ['Эспрессо, апельсиновый сок, лёд.'],
          recommendation: 'Тарталетки с ягодами, круассан.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/6e7200b2-df6b-11ed-9b90-c24749d793bf______________.jpeg',
          recommendations: [
            {
              id: 1028,
              title: 'Тарталетки',
              image: 'https://example.com/tartlets2.jpeg'
            },
            {
              id: 1029,
              title: 'Круассан',
              image: 'https://example.com/croissant4.jpeg'
            }
          ]
        }
      ]
    },
    {
      id: 5,
      title: 'Матча Латте',
      image:
        'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/aa659f80-e01e-11ed-b33d-f278011f66d4___________.jpeg',
      products: [
        {
          id: 501,
          name: 'Классический Чай Латте',
          price: 400,
          description: 'Ароматный японский чай с молоком, богатый антиоксидантами',
          ingredients: ['Матча', 'Молоко', 'Сироп (по желанию)'],
          recommendation: 'Идеален с маффином.',
          image: 'https://source.unsplash.com/featured/?tea,latte',
          recommendations: [
            {
              id: 1030,
              title: 'Маффин',
              image: 'https://example.com/muffin2.jpeg'
            }
          ]
        }
      ]
    },
    {
      id: 6,
      title: 'Горячий шоколад',
      image:
        'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/ca4c0ba0-e022-11ed-89b1-629455acbfe5____________.jpeg',
      products: [
        {
          id: 601,
          name: 'Какао',
          price: 890,
          description: 'Легкий молочный напиток с нежным шоколадным вкусом.',
          ingredients: ['Какао', 'Молоко', 'Сахар'],
          recommendation: 'Попробуйте с круассаном.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/ca4c0ba0-e022-11ed-89b1-629455acbfe5____________.jpeg',
          recommendations: [
            {
              id: 1031,
              title: 'Круассан',
              image: 'https://example.com/croissant5.jpeg'
            }
          ]
        },
        {
          id: 602,
          name: 'Горячий шоколад "Sunfood"',
          price: 890,
          description: 'Густой насыщенный шоколад с кремовой текстурой.',
          ingredients: ['Шоколад', 'Молоко', 'Сливки'],
          recommendation: 'Попробуйте с брауни.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/ca4c0ba0-e022-11ed-89b1-629455acbfe5____________.jpeg',
          recommendations: [
            {
              id: 1032,
              title: 'Брауни',
              image: 'https://example.com/brownie.jpeg'
            }
          ]
        }
      ]
    },
    {
      id: 7,
      title: 'Вода',
      image:
        'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/27eec45a-0cad-11ec-88f6-621338a4b2a1__________________________________vittel__0_33__.jpeg',
      products: [
        {
          id: 701,
          name: 'Миниральная вода',
          price: 250,
          description: 'Удобный напиток для тех, кто всегда в движении.',
          ingredients: ['Вода'],
          recommendation: 'Отлично сочетается с маффином.',
          image:
            'https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/27eec45a-0cad-11ec-88f6-621338a4b2a1__________________________________vittel__0_33__.jpeg',
          recommendations: [
            {
              id: 1033,
              title: 'Маффин',
              image: 'https://example.com/muffin3.jpeg'
            }
          ]
        }
      ]
    }
  ];
  