const express = require('express');
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const http = require('http');
const app = express();
const MongoStore = require('connect-mongo')(session)
const PORT = process.env.PORT || 4500

const server = http.createServer(app);
const io = require('socket.io')(server);
const LocalStrategy = require('passport-local').Strategy;

//models
const Business = require('./models/business');
const Consumer = require('./models/consumer');
const ConsumerSellModel = require('./models/consumerSellModel');
const BusinessSellModel = require('./models/businessSellModel');

//routes
const businessLogin = require('./routes/businessLogin');
const consumerLogin = require('./routes/consumerLogin');
const businessRegister = require('./routes/businessRegister');
const consumerRegister = require('./routes/consumerRegister');
const consumerDashboard = require('./routes/consumerDashboard');
const consumerSell = require('./routes/consumerSell');
const businessBrowse = require('./routes/businessBrowse');
const businessSell = require('./routes/businessSell');
const consumerBrowse = require('./routes/consumerBrowse');
const businessDashboard = require('./routes/businessDashboard');
const wasteView = require('./routes/wasteView');
const productView = require('./routes/productView');
const chat = require('./routes/chat');
const cart = require('./routes/cart');


//configuring the view engine
app.set('view-engine', 'ejs');

//configuring body-parser------use express' built-in parser no need to use body-parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set('trust proxy', 1)

//configuring express session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore(),
    cookie: {maxAge: 60*60*60 },
    cookie: { secure: false }
}))

app.use(flash());

//serving static files
app.use(express.static(__dirname + '/public'))

//configuring passport for authentication
app.use(passport.initialize());
app.use(passport.session());
//authentication strategy
// for businesses
passport.use('businessLocal', new LocalStrategy(Business.authenticate()));
// for consumers
passport.use('consumerLocal', new LocalStrategy(Consumer.authenticate()));
//using with sessions
// for business
passport.serializeUser(Business.serializeUser());
passport.deserializeUser(Business.deserializeUser());
// for consumer
passport.serializeUser(Consumer.serializeUser());
passport.deserializeUser(Consumer.deserializeUser());


//Routes
app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.use('/businessLogin', businessLogin)

app.use('/businessRegister', businessRegister)

app.use('/consumerLogin', consumerLogin)

app.use('/consumerRegister', consumerRegister)

app.use('/consumerDashboard', consumerDashboard)

app.use('/consumerSell', consumerSell)

app.use('/businessBrowse', businessBrowse)

app.use('/businessSell', businessSell)

app.use('/consumerBrowse', consumerBrowse)

app.use('/businessDashboard', businessDashboard)

app.use('/wasteView', wasteView)

app.use('/productView', productView)

app.use('/chat', chat(io))

app.use('/cart', cart)

app.all('*', (req, res) => {
    res.status(404).send('404! Oooops sorry Page Not Found')
})

server.listen(PORT, () => {
    console.log('Server is listening on port 4500');
})