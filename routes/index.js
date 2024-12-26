const express = require('express');
const router = express.Router();

const adminAuth = require('../middlewares/admin-auth');
const adminAuthRouter = require('./admin/auth');
const adminRouter = require('./admin');
const appRouter = require('./app');

router.use('/admin/auth', adminAuthRouter);
router.use('/admin', adminAuth, adminRouter);
router.use('/', appRouter);

module.exports = router;
