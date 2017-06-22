var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');


var {mongoose} = require('./db/mongoose');

var{Todo} = require('./models/todo');

var{user} = require('./models/user');

var app = express();

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
  //console.log(req.body);
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
  //console.log(id);
  if (!ObjectID.isValid(id)) {
   //console.log('ID not valid');
   res.status(404).send();
  }
  else {
    Todo.findById(id).then((todo) => {
      if (!todo) {
         //console.log('Unable to find user');
         return res.status(404).send();
      }
    //  console.log(JSON.stringify(todo, undefined, 2));
      res.send({todo});
    }).catch((e)=>{
      res.status(400).send();
    });
  }});

app.listen(3000,()=>{
  console.log('server started on port 3000');
});

module.exports = {app};
