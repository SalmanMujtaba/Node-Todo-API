var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');


var {mongoose} = require('./db/mongoose');

var{Todo} = require('./models/todo');

var{user} = require('./models/user');

var app = express();

var port = process.env.PORT || 3000;



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
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
     console.log('404 error 1');

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

app.listen(port,()=>{
  console.log('server started on port'+port);
});

module.exports = {app};
