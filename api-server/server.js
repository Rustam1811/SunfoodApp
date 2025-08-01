const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Импорт API handlers
const bonusSettings = require('../api/bonus-settings');
const orders = require('../api/orders');
const userBonus = require('../api/user-bonus');
const useBonus = require('../api/use-bonus');
const promoCodes = require('../api/promo-codes');
const testBonus = require('../api/test-bonus');
const simpleOrder = require('../api/simple-order');
const login = require('../api/login');
const register = require('../api/register');

// API Routes
app.use('/api/bonus-settings', bonusSettings);
app.use('/api/orders', orders);
app.use('/api/user-bonus', userBonus);
app.use('/api/use-bonus', useBonus);
app.use('/api/promo-codes', promoCodes);
app.use('/api/test-bonus', testBonus);
app.use('/api/simple-order', simpleOrder);
app.use('/api/login', login);
app.use('/api/register', register);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SunfoodApp API Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler для API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.path
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 SunfoodApp API Server running on http://localhost:${PORT}`);
    console.log(`📊 Available endpoints:`);
    console.log(`   GET  /api/health`);
    console.log(`   *    /api/bonus-settings`);
    console.log(`   *    /api/orders`);
    console.log(`   *    /api/user-bonus`);
    console.log(`   *    /api/use-bonus`);
    console.log(`   *    /api/promo-codes`);
    console.log(`   *    /api/test-bonus`);
    console.log(`   *    /api/simple-order`);
    console.log(`   *    /api/login`);
    console.log(`   *    /api/register`);
});
