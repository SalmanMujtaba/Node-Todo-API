const expect = require('expect');
const request = require('supertest');
const{ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');


//add sample data cause we dont want the database to be empty
const todos = [{
  _id: new ObjectID(),
  text: 'First'
},{
  _id: new ObjectID(),
  text: 'Seconf'
}];

//remove everything from the database but add two records
beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() =>done());
});


describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
      //    console.log('length'+todos.length);
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

//to fetch all the data from the database
describe('GET /todos',()=>{
  it('should get all todos', (done) =>{
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res)=>{
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id',()=>{
    it('should return todo doc', (done)=>{
      request(app)
        .get('/todos/'+((todos[0]._id.toHexString())))
        .expect(200)
        .expect((res) =>{
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });
//we're passing a valid object id which is not present in the database
    var obj = new ObjectID().toHexString();
    console.log(typeof(obj));
    console.log(obj);
    it('should return 404 if todo not found',(done) =>{
      request(app)
        .get('/todos/'+obj)
        .expect(404)
        .end(done);
    });
//we're passing an invalid id
    it('should return 404 for non object ids',(done) =>{
      request(app)
        .get('/todos/123')
        .expect(404)
        .end(done);
    });

});
