const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const handlebars = require('express-handlebars');
const cluster = require('cluster');
const compression = require('compression');
const log4js = require('log4js');

const { graphqlHTTP }  = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
app.use(compression());

const User = require('./db/model');

const login = require('./rutas/login');
const register = require('./rutas/register');
const producto = require('./rutas/productos');

app.use('/', login);
app.use('/user', register);
app.use('/producto', producto);

/* -------------- Datos por CL -------------- */

const portCL = process.argv[2] || 5504;


/* -------------- PASSPORT -------------- */
const passport = require('passport');

/* -------------- graphql -------------- */

const schema = buildSchema(`
    type Query {
        mensaje: String,
        productos: [Producto]
    }
    type Mutation {
        guardarProducto(nombre: String!,codigo: Int!,precio: Int!,stock: Int!): Producto
    },
    type Producto {
        nombre: String
        codigo: Int
        precio: Int
        stock: Int
    }    
`);

// Root resolver
const root = {
    mensaje: () => 'GraphQL: Ingrese Artículo',
    articulos : () => articulos,
    guardarArticulo : guardarArticulo
};

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));


/* -------------- LOGGERS -------------- */
log4js.configure({
    appenders: {
        miLoggerConsole: {type: "console"},
        miLoggerFileWarning: {type: 'file', filename: 'warn.log'},
        miLoggerFileError: {type: 'file', filename: 'error.log'}
    },
    categories: {
        default: {appenders: ["miLoggerConsole"], level:"trace"},
        info: {appenders: ["miLoggerConsole"], level: "info"},
        warn: {appenders:["miLoggerFileWarning"], level: "warn"},
        error: {appenders: ["miLoggerFileError"], level: "error"}
    }
});

const loggerInfo = log4js.getLogger('info');
const loggerWarn = log4js.getLogger('warn');
const loggerError = log4js.getLogger('error');

/* -------------------------------------------- */



    /* -------------- serialize + deserialize -------------- */
    passport.serializeUser(function(user, cb) {
        cb(null, user);
    });

    passport.deserializeUser(function(obj, cb) {
        cb(null, obj);
    });

    /* ------------------------------------ */
    /* CONFIG */
    app.use(express.json());
    app.use(express.urlencoded({extended:true}));

    app.use(cookieParser());
    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            maxAge: 60000
        }
    }));


    app.engine(
        "hbs", 
        handlebars({
            extname: ".hbs",
            defaultLayout: 'index.hbs',
        })
    );


    app.set("view engine", "hbs");
    app.set("views", "./views");

    app.use(express.static('public'));
    app.use(passport.initialize());
    app.use(passport.session());

   
    /* -------------- DB CONNECTION -------------- */

    app.listen( process.env.PORT|| portCL, ()=>{
        loggerInfo.info(`Running on PORT ${portCL} - PID WORKER ${process.pid}`);
        mongoose.connect('mongodb://localhost:27017/ecommerce', 
            {
                useNewUrlParser: true, 
                useUnifiedTopology: true
            }
        )
            .then( () => loggerInfo.info('Base de datos conectada') )
            .catch( (err) => loggerError.error(err) );
    })













