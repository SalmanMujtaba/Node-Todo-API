var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

 var db = {
  localhost: 'mongodb://localhost:27017/TodoApp',
  mlab: 'mongodb://salman:1234@ds135382.mlab.com:35382/sample'
};

mongoose.connect( process.env.PORT ? db.mlab : db.localhost);
// mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};
