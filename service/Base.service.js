const { NotFound } = require('http-errors');

class BaseService {
    Model;

    constructor(Model) {
        this.Model = Model;
    }

    async findAndCountAll(condition) {
        const { count, rows } = await this.Model.findAndCountAll(condition);
        return {
            rows,
            count,
        };
    }

    async findOne(condition) {
        return await this.Model.findOne(condition);
    }

    async findByPk(id) {
        const entity = await this.Model.findByPk(id);
        if (!entity) {
            throw new NotFound(`ID: ${id}的资源未找到。`);
        }
        return entity;
    }

    async create(dto) {
        return await this.Model.create(dto);
    }

    async destroy(id) {
        const entity = await this.findByPk(id);
        await entity.destroy();
    }

    async update(id, dto) {
        const entity = await this.findByPk(id);
        await entity.update(dto);
    }
}

module.exports = BaseService;
