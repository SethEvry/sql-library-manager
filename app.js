var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const sequelize = require("./models/index").sequelize;

var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');
var usersRouter = require('./routes/users');

var app = express();

//Sequelize authentication/ sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync()
    console.log("Database synced!")
  } catch (err) {
    console.error('Unable to connect to the database: ', error);
  }
})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use('/users', usersRouter);

app.use('/books', booksRouter);


/* test /noroute and /books/noroute
app.use('/noroute', (req, res, next) =>{
  const err = new Error()
  err.status = 500;
  err.message = "Woo! I'm broked!";
  next(err)
})

app.use('/books/noroute', (req, res, next) =>{
  const err = new Error()
  err.status = 500;
  err.message = "Woo! I'm broked!";
  next(err)
})
*/


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  if(err.status === 404){
    console.log(`Error: ${err.status} - ${err.message}`)
    res.render('page-not-found');
  } else {
    console.log(`Error: ${err.status} - ${err.message}`)
    res.render('error', {err});
  }
});

module.exports = app;
