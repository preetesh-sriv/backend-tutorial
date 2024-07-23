import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
/*
# cookie-parser is a middleware for Express that parses cookies attached to the client request object. 
  It populates the req.cookies object with an object keyed by the cookie names. 
*/

mongoose
.connect('mongodb://localhost:27017',{
    dbName:'backend',
}).then(()=>console.log('Database Connected'))
  .catch((e)=>console.log(e))
 
  const messageSchema = new mongoose.Schema({
    name:String,
    email:String,
    // Creatign a schema
  })

  const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,

    // Creatign a schema
  })
  
  
//   Creating a model -> collection

const Messge  = mongoose.model('Message',messageSchema)
const User  = mongoose.model('User',userSchema)

const app = express(); //# creating a server

// # We get saved from writing if-else again and again . We can use multiple files for that also for routing. 
//Now showing use of middlewares 
app.use(express.static(path.join(path.resolve(),'public')))
//# Above -> to access static file index.html in public.The app.use() method in Express is used to mount middleware functions at a specified path.
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

app.set('view engine','ejs'); // for ejs

const isAuthenticated = async(req,res,next)=>{
    // isAuthenticated is a middleware handler made by us
    // Does same job as we did in func2 auth

   const {token} = req.cookies
   

    if(token){
    const decoded = jwt.verify(token,'ffadfdsfadfsd'); //JWT method used to decode
    /*
    Yes, the jwt.verify() method from the jsonwebtoken library is used to decode and verify a JSON Web Token (JWT). 
    This method checks if the token is valid and if it was signed using the specified secret or public key. 
    If the token is valid, it returns the decoded payload; otherwise, it throws an error.
    */
//    console.log(decoded);

    req.user = await User.findById(decoded._id) // # if token is there so save user's information 
    /*
    Yes, that's a common pattern for handling authentication with JWTs in an Express application. 
    After verifying the token and decoding the payload, you can use the user ID (or other identifier) from the payload to retrieve the full user information from your database. 
    This can then be attached to the req object for use in subsequent middleware and route handlers.
    
    */

        next()
    }
    else{
        res.render('login')
    }
}

app.get('/home',(req,res)=>{
    //  res.send('Hi') // convinience methods

    // res.sendStatus(400);

    // res.json({
    //     "success":"true",
    //     "products":[]
    // })

    // res.status(400).send("Hello bro")
    //# Bad request shown in console and a custom msg will be displayed on the screen 

    // const pathLocation = path.resolve();
    // console.log(pathLocation);
    // res.sendFile(path.join(pathLocation,'./test.html'));
    
    
    //res.render('index.ejs'); //# If you do not want to write .ejs extension again and again so write app.set()
     res.render('index',{name:'Preetesh'});
    //  res.sendFile('index.html')//# Since with the help of middleware we have served the public folder so now we can access the index.html file.
})
/*Authentication starts here */

app.get('/login',isAuthenticated,(req,res)=>{
   res.render('logout',{name:req.user.name})
   /*
   # This defines a GET route at the path /login. 
   When a GET request is made to /login, the middleware function isAuthenticated is executed before the callback function.

   # The isAuthenticated middleware function is called before the route handler. 
   This function is typically used to check if the user is authenticated. 
   If the user is not authenticated, the middleware would usually redirect the user to a login page or send an appropriate response.

   #If the isAuthenticated middleware allows the request to proceed (i.e., the user is authenticated), the server will render the logout view. 
   The res.render method renders a view template (in this case, logout) and sends the rendered HTML to the client.
   */
})

app.get('/login',(req,res)=>{
    // func2 auth
    console.log(req.cookies);
    //# To run above you must install cookie-parser
    // res.render('login');
    const {token} = req.cookies;

    if(token){
        res.render('logout');
    }
    else{
        res.render('login')
    }
})
app.post('/register',async (req,res)=>{

    // console.log(req.body);
    const {name,email,password} = req.body

    let user = await User.findOne({email});
    
    if(user){
        //If user does not exist so code will not execute and register first will be consoled out 
        //If user does  exist so code will redirect to login page.

        // return console.log('Register first')

        res.redirect('/login'); //to make it work first use app.get('/register'....)
    }
     const hashedPassword  = await bcrypt.hash(password,10);
     user = await User.create({
        name,
        email,
        password: hashedPassword,
    })
    
    const token = jwt.sign({_id:user._id},"ffadfdsfadfsd");//JWT part
    // console.log(token);

   res.cookie('token',token,{
    // JWT is used to ensure security ex:user id
    httpOnly:true,
    expires:new Date(Date.now()+60*1000)
   })

   res.redirect('/login')
});
app.get('/logout',(req,res)=>{
    // # mark that you have used app.get here
    res.cookie('token',null,{
     httpOnly:true,
     expires:new Date(Date.now())
    // # mark that how you have given the time
    })
 
    res.redirect('/login')
 });

app.get('/register',(req,res)=>{
    res.render('register');
})
/*Authentication
Data is stored in three ways local,session storage and cookies 
Cookie delete = logout
Cookie itself gets deleted after expire time(automatic logout)
Cookie => key-value pair 
Expire = session means will remain in that session 
Cookie is in application of inspect(inspect -> application -> cookie)
httpOnly makes it more secure
*/
/*
app.get('/add',(req,res)=>{
    // res.send('Niceooooo')

    Messge.create({name:'Preetesh',email:'sample@gmail.com'}).then(()=>{
             res.send('Niceooooo')
    })
})
    One way of working with the mongoDB
*/
app.get('/add',async(req,res)=>{
    // res.send('Niceooooo')

    await Messge.create({name:'Preetesh',email:'sample@gmail.com'})
             res.send('Added to DB')
            //  Manually adding to DB
})

app.post('/home',async (req,res)=>{
    // working with contact form 
//    console.log(req.body)
//   const messageData = {username:req.body.name, email:req.body.email}
//   console.log(messageData);
// await Messge.create({name:req.body.name, email:req.body.email})
   const {name,email} = req.body; //destructured initally 
   await Messge.create({name,email});

})
app.listen(5000,()=>{
    console.log('Server is working');
})

/*
#package-lock contains dependencies of dependencies
mongoDB
# database and collections
# mongoose to connect db to nodejs
# connect -> new 

*/