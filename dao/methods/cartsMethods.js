import Cart from '../models/cartsModel.js'

class CartsMethods{
    getCartsMethods = async () => {
        const carts = await Cart.find({})
        return carts
    }

    addCartMethods = async () => {
        const newCart = new Cart()
        return newCart.save()
        
    }

    getCartByIdMethods = async (id) => {
        const cartFound = 
            await Cart.findOne({_id: id}).populate('products.product')
                .then(c => console.log(JSON.stringify(c, null, '\t')))
                .catch(err => console.log(err))
        return cartFound
        
    }

    updateCartMethods = async (id) => {
        await Cart.updateOne({_id: id}, {products: []})
    }

    updateProductsMethods = async (id, products) => {
        await Cart.updateOne({_id: id}, {products})
    }

    deleteCartMethods = async (id) => {
        const deletedCart = await Cart.deleteOne({_id: id})
        return deletedCart
    }

}

export default CartsMethods 