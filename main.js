// server
import express from 'express'
const app = express()

// dependencies
import passport from 'passport'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import config from './config/config.js'
import handlebars from 'express-handlebars'
import initPassport from './config/passportConfig.js'

// http import
import http from 'http'
const server = http.createServer(app)

// socket import
import {Server} from 'socket.io'
const io = new Server(server)

// mongo
import DB from './dao/db/db.js'
import Product from './dao/models/productsModel.js'
import Message from './dao/models/messagesModel.js'
import ProductService from './services/productsService.js'
const productService = new ProductService()

// routes
import authRoute from './routes/authRoute.js'
import chatRoute from './routes/chatRoute.js'
import homeRoute from './routes/homeRoute.js'
import cartsRoute from './routes/cartsRoute.js'
import loggerRoute from './routes/loggerRoute.js'
import mockingRoute from './routes/mockingRoute.js'
import sessionsRoute from './routes/sessionsRoute.js'
import productsRoute from './routes/productsRoute.js'
import realTimeRoute from './routes/realTimeProdsRoute.js'

// data
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// dirname
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname + '/public')))

// views
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname + '/views'))

// session
app.use(session({
    store: MongoStore.create({
        mongoUrl: DB.URL
    }),
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

// passport
initPassport()
app.use(passport.initialize())
app.use(passport.session())

// logger 
import addLogger from './services/logger/logger.js'
app.use(addLogger)

// routes
app.use('/auth', authRoute)
app.use('/chat', chatRoute)
app.use('/home', homeRoute)
app.use('/api/carts', cartsRoute)
app.use('/session', sessionsRoute)
app.use('/loggerTest', loggerRoute)
app.use('/api/products', productsRoute)
app.use('/mockingproducts', mockingRoute)
app.use('/realtimeproducts', realTimeRoute)

// sockets
io.on('connection', async (socket) => {
    console.log('User connected')

    // PRODUCTS
    // mostramos todos los productos
    const products = await productService.getProductsService()
    socket.emit('products', products)

    socket.on('newProduct', async (data) => {
        console.log(data)
        const newProduct = new Product(data)
        productService.addProductService(newProduct)
        const products = await productService.getProductsService()
        io.sockets.emit('all-products', products)
    })

    socket.on('deleteProduct', async (data) => {
        await Product.deleteOne({_id: data})
        console.log('Product deleted')
        io.sockets.emit('all-products', products)
    })

    // CHAT
    const messages = await Message.find()
    socket.on('newMessage', async (data) => {
        const message = new Message(data)
        await message.save(data)
        io.sockets.emit('all-messages', messages)
    })
})


server.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`)
    DB.connect()
})