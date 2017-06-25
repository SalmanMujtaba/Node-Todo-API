require('./config/config');
var express = require('express');
var bodyParser = require('body-parser');
const _ = require('lodash');

const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');

var{Todo} = require('./models/todo');

var{User} = require('./models/user');

var app = express();

const port = process.env.PORT;



app.use(bodyParser.json());

app.post('/todos',(req,res)=>{
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc)=>{
    res.send(doc);
  }, (err)=>{
res.status(400).send(err);
  });
});


app.get('/todos',(req,res)=>{

  Todo.find().then((todos)=>{
    res.send({todos});
  }, (e) =>{
    res.status(400).send(e);
  })
});

app.get('/todos/:id',(req,res)=>{
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
   res.status(404).send();
  }
  else {
    Todo.findById(id).then((todo) => {
      if (!todo) {
         return res.status(404).send();
      }
      res.send({todo});
    }).catch((e)=>{
      res.status(400).send();
    });
  }});

  app.delete('/todos/:id',(req,res)=>{
    if (!ObjectID.isValid(id)) {
     res.status(404).send();
    }
    else {
      Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
           return res.status(404).send();
        }
        res.status(200).send({todo});
      }).catch((e)=>{
        res.status(400).send();
      });
    }});

    app.patch('/todos/:id', (req, res) => {
      var id = req.params.id;
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({todo});
    }).catch((e) => {
      res.status(400).send();
    })
  });

  //user database related
  app.post('/user', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      //x-auth for custom header to store jwt 
      res.header('x-auth', token).send(user);
    }).catch((e) => {
      console.log(e);
      res.status(400).send(e);
    })
  });

app.listen(port,()=>{
  console.log('server started on port'+port);
});

module.exports = {app};
