const cors = require('cors');
const config = {
  origin: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  credentials: true
};

module.exports = () => cors(config);