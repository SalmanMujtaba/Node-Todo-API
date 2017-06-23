var env = process.env.NODE_ENV || 'development';
console.log('environment:'+env);
if(env==='development'){
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
}

else if(env==='test'){
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoTest';
}
else if(env==='production'){
  process.env.MONGODB_URI = 'mongodb://salman:1234@ds135382.mlab.com:35382/sample';
}
