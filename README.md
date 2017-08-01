# Node-Todo-API

A node API which registers and authenticates users based on tokens (JWT). The password is hashed and salted, and then stored in the database. The user can create/update/delete todos, by sending text and providing the x-auth token (in Postman), generated after login/registration.
The app is deployed on the following link. Postman is required to be used with the heroku link below. The database is deployed on mLab. 
Several test cases have been created for the todo-api.

Links:
In Postman:

Post
REGISTERING A USER

https://protected-caverns-56912.herokuapp.com/user

Instructions:
Provide email and password like this in the body section of Postman
{
	"email": "sample@gmail.com",
	"password": "sample"
}

note the x-auth token. Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTgwY2RlMTVjYzNjMTAwMTE0OWI4NWEiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAxNjEzNTM3fQ.MeCFi1KMjgkngXr4oScfKS4wzOMw_Qy3LrmC2I-kHqA

Post
LOGING IN
Get
https://protected-caverns-56912.herokuapp.com/user/me/login

Instructions:
Provide the previously used email id and password. Again a token would be generated.

Similarly, to create a todo (Post https://protected-caverns-56912.herokuapp.com/todo)
, just provide some data, like 

{
  text: "sample"
 }

and provide the auth token of the user, say the one we used above.

The user is able to fetch the todos, only which he created, by providing the auth token.


