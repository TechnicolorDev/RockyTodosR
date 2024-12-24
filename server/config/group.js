const express = require('express');
const router = express.Router();

const groupRoutes = (router, groupPrefix, callback) => {
    const groupRouter = express.Router();
    callback(groupRouter);
    router.use(groupPrefix, groupRouter);
};

module.exports={groupRoutes};