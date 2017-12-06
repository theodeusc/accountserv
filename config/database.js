var config = {
  default: {
    database: 'mongodb://theodeus:accountpassword@ds111066.mlab.com:11066/accounts',
    secret: 'topSecretToBeChanged'
  },

  development: {
    database: 'mongodb://localhost:27017/accounts',
    secret: 'notSoSecretToBeChanged'
  }
}

module.exports.get = function get(env) {
  return config[env] || config.default;
}
