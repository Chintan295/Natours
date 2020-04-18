const express = require('express');
const morgan = require('morgan');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit')
const AppError=require('./utils/appError')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorController=require('./controllers/errorController')

const app = express();

// *** Global MidleWare ****

// security Middlware
app.use(helmet())

//Morgan Middleware for Development logger
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Output look like this :- GET /api/v1/tours 200 263.782 ms - 8642
}

//Rating middleware fir the same api
const limit=rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'Too many Request from this IP ,please try again after one hour'
});
app.use('/api',limit)

//To get access of body parameter in response
app.use(express.json({max:'10kb'}));

//To server Static file middlware
app.use(express.static(`${__dirname}/public`));


// Test Middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

//this two are middleware , Mount Our Router // if we get Router like '/api/v1/tours' then go to this @tourRouter Function
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*',(req,res,next)=>{
    next(new AppError(`route ${req.originalUrl} is not defined`,400))
});
app.use(globalErrorController)

module.exports = app;