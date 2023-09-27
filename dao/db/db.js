import mongoose from "mongoose"
import config from "../../config/config.js"
const password = config.mongoPassword
const URL = `mongodb+srv://savdeichuk:${password}@ecommerce.dmrehes.mongodb.net/ecommerce`

export default {
    URL,
    connect: () => {
        return mongoose.connect(URL, {useUnifiedTopology: true, useNewUrlParser: true})
        .then((connect) => {
            console.log('Connected to DB')
        })
        .catch((err) => console.log(err))
    }
}