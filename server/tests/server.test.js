const expect = require('expect');
const request = require('supertest');
const{ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id',()=>{
    it('should return todo doc', (done)=>{
      request(app)
        .get('/todos/'+((todos[0]._id.toHexString())))
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) =>{
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });
//we're passing a valid object id which is not present in the database
    var obj = new ObjectID().toHexString();
      it('should return 404 if todo not found',(done) =>{
      request(app)
        .get('/todos/'+obj)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
//we're passing an invalid id
    it('should return 404 for non object ids',(done) =>{
      request(app)
        .get('/todos/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should not return a  todo doc created by other user', (done)=>{
      request(app)
        .get('/todos/'+((todos[1]._id.toHexString())))
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

});

describe('DELETE /todos/:id',()=>{
  it('it should remove a Todo', (done) =>{
      var obj = todos[1]._id.toHexString();
    request(app)
      .delete('/todos/'+obj)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(obj);
      })
      .end((err,res)=>{
        if(err){
          return done(err);
        }

        Todo.findById(obj).then((todo) => {
          //just to show that that no record is present in the database
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('it should not remove a Todo if a different user tries to delete it', (done) =>{
      var obj = todos[0]._id.toHexString();
    request(app)
      .delete('/todos/'+obj)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err,res)=>{
        if(err){
          return done(err);
        }

        Todo.findById(obj).then((todo) => {
          //just to show that that no record is present in the database
          expect(todo).toExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if todo is not found',(done) =>{
    var obj = new ObjectID().toHexString();
    request(app)
      .delete('/todos/'+obj)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object is invalid',(done) =>{
    var obj = todos[0]._id.toHexString();
    request(app)
      .delete('/todos/123')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id',()=>{
    it('should update the todo', (done)=>{

      var id = todos[0]._id.toHexString();
      var sampleText = 'abc';
      request(app)
        .patch('/todos/'+id)
        .set('x-auth', users[0].tokens[0].token)
        .send({text: sampleText, completed: true })
        .expect(200)
        .expect((res) =>{
          expect(res.body.todo.text).toBe(sampleText);
          expect(res.body.todo.completed).toBe(true);
          expect(res.body.todo.completedAt).toBeA('number');

        })
        .end(done);
    });

    it('should not update the todo with a different user', (done)=>{

      var id = todos[0]._id.toHexString();
      var sampleText = 'abc';
      request(app)
        .patch('/todos/'+id)
        .set('x-auth', users[1].tokens[0].token)
        .send({text: sampleText, completed: true })
        .expect(404)
        .end(done);
    });

    it('should complete completedAt when todo is not completed', (done)=>{

      var id = todos[1]._id.toHexString();
      var sampleText = 'secondsamptext';
      request(app)
        .patch('/todos/'+id)
        .set('x-auth', users[1].tokens[0].token)
        .send({text: sampleText, completed: false })
        .expect(200)
        .expect((res) =>{
          expect(res.body.todo.text).toBe(sampleText);
          expect(res.body.todo.completed).toBe(false);
          expect(res.body.todo.completedAt).toNotExist();

        })
        .end(done);
    });
  });
  describe('GET /user/me', () => {
    it('should return user if authenticated', (done) => {
      request(app)
        .get('/user/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
      request(app)
        .get('/user/me')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
  });

  describe('POST /user', () => {
    it('should create a user', (done) => {
      var email = 'example@example.com';
      var password = '123mnb!';

      request(app)
        .post('/user')
        .send({email, password})
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).toExist();
          expect(res.body._id).toExist();
          expect(res.body.email).toBe(email);
        })
        .end((err) => {
          if (err) {
            return done(err);
          }

          User.findOne({email}).then((user) => {
            expect(user).toExist();
            expect(user.password).toNotBe(password);
            done();
          });
        });
    });

    it('should return validation errors if request invalid', (done) => {
      request(app)
        .post('/user')
        .send({
          email: 'and',
          password: '123'
        })
        .expect(400)
        .end(done);
    });

    it('should not create user if email in use', (done) => {
      request(app)
        .post('/user')
        .send({
          email: users[0].email,
          password: 'Password123!'
        })
        .expect(400)
        .end(done);
    });
  });


  describe('POST /user/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/user/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

    it('should reject invalid login', (done) => {
      var email = users[1].email;
      var password = users[1].passsword+'abc';

      request(app)
        .post('/user/login')
        .send({email, password})
        .expect(400)
        .expect((res) => {
          expect(res.headers['x-auth']).toNotExist();
        })
        .end((err) => {
          if (err) {
            return done(err);
          }

          User.findById(users[1]._id).then((user) => {
            expect(user.tokens.length).toBe(1);
            done();
          }).catch((e)=> done(e));
        });
    });
});

describe('DELETE /user/me/login',()=>{
  it('should remove auth token on logout', (done) =>{
    var token = users[0].tokens[0].token;
    request(app)
      .delete('/user/me/token')
      .set('x-auth', token)
      .expect(200)
      .end((err,res)=>{
        if(err){
          return done(err);
        }
        User.findById(users[0]._id).then((user)=>{
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e)=>done(e));
      });
    });
});
