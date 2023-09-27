import { Schema, model } from "mongoose"

const CartSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    products: {
        type: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number
            }
        }]
    }
})

const Cart = model('Cart', CartSchema)
export default Cart