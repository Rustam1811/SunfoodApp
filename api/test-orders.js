// Тестовые заказы для аналитики
const testOrders = [
  {
    id: 'test1',
    userId: '87053096206',
    items: [
      { productName: 'Капучино', quantity: 2, price: 350 },
      { productName: 'Круассан', quantity: 1, price: 200 }
    ],
    totalAmount: 900,
    status: 'completed',
    createdAt: new Date('2025-01-25T09:30:00'),
    tableNumber: 5
  },
  {
    id: 'test2',
    userId: '87777777777',
    items: [
      { productName: 'Латте', quantity: 1, price: 400 },
      { productName: 'Чизкейк', quantity: 1, price: 450 }
    ],
    totalAmount: 850,
    status: 'completed',
    createdAt: new Date('2025-01-25T10:15:00'),
    tableNumber: 3
  },
  {
    id: 'test3',
    userId: '87053096206',
    items: [
      { productName: 'Эспрессо', quantity: 3, price: 250 },
      { productName: 'Тирамису', quantity: 2, price: 380 }
    ],
    totalAmount: 1510,
    status: 'completed',
    createdAt: new Date('2025-01-25T11:00:00'),
    tableNumber: 7
  },
  {
    id: 'test4',
    userId: '87053096206',
    items: [
      { productName: 'Американо', quantity: 1, price: 300 },
      { productName: 'Сэндвич', quantity: 1, price: 350 }
    ],
    totalAmount: 650,
    status: 'completed',
    createdAt: new Date('2025-01-25T12:30:00'),
    tableNumber: 2
  },
  {
    id: 'test5',
    userId: '87777777777',
    items: [
      { productName: 'Капучино', quantity: 1, price: 350 },
      { productName: 'Пирожное', quantity: 2, price: 280 }
    ],
    totalAmount: 910,
    status: 'completed',
    createdAt: new Date('2025-01-25T14:45:00'),
    tableNumber: 1
  },
  {
    id: 'test6',
    userId: '87053096206',
    items: [
      { productName: 'Мокко', quantity: 1, price: 420 },
      { productName: 'Брауни', quantity: 1, price: 320 }
    ],
    totalAmount: 740,
    status: 'completed',
    createdAt: new Date('2025-01-25T15:20:00'),
    tableNumber: 4
  },
  {
    id: 'test7',
    userId: '87777777777',
    items: [
      { productName: 'Латте', quantity: 2, price: 400 },
      { productName: 'Багет', quantity: 1, price: 250 }
    ],
    totalAmount: 1050,
    status: 'completed',
    createdAt: new Date('2025-01-25T16:10:00'),
    tableNumber: 6
  },
  {
    id: 'test8',
    userId: '87053096206',
    items: [
      { productName: 'Раф', quantity: 1, price: 380 },
      { productName: 'Маффин', quantity: 1, price: 220 }
    ],
    totalAmount: 600,
    status: 'completed',
    createdAt: new Date('2025-01-25T17:30:00'),
    tableNumber: 8
  }
];

console.log('Создано тестовых заказов:', testOrders.length);
console.log('Общая сумма:', testOrders.reduce((sum, order) => sum + order.totalAmount, 0));

module.exports = testOrders;
