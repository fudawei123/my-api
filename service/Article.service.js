const { Article } = require('../models');
const BaseService = require('./BaseService');

class ArticleService extends BaseService {
    constructor() {
        super(Article);
    }
}

module.exports = new ArticleService();
