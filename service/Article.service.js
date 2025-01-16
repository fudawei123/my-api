const { Article } = require('../models');
const BaseService = require('./Base.service');

class ArticleService extends BaseService {
    constructor() {
        super(Article);
    }
}

module.exports = new ArticleService();
