const userService = require('./User.service');

class AuthService {
    async signUp(userDto) {
        const user = await userService.create(userDto);
        delete user.dataValues.password;
        return user;
    }
    signIn() {}
}

module.exports = new AuthService();
