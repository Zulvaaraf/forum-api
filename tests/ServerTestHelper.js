const Jwt = require('@hapi/jwt');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const ServerTestHelper = {
  async getAccessToken() {
    const payload = {
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    await UsersTableTestHelper.addUser(payload);
    return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
  },
};

module.exports = ServerTestHelper;
