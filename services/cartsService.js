import Cart from '../dao/models/cartsModel.js'
import CartsMethods from "../dao/methods/cartsMethods.js"
const cartMethods = new CartsMethods()
import ProductsService from "./productsService.js"
const productsService = new ProductsService()
import TicketService from "./ticketService.js"
const ticketService = new TicketService()

class CartService {
    getCartsService = async () => {
        try {
            const carts = await cartMethods.getCartsMethods()
            return carts
        } catch (err) {
            throw new Error(err.message)
        }
    }

    addCartService = async () => {
        try {
            const cart = await cartMethods.addCartMethods()
            return cart
        } catch (err) {
            throw new Error(err.message)
        }
    }

    getCartByIdService = async (id) => {
        try {
            const cartFound = await cartMethods.getCartByIdMethods(id)
            return cartFound
        } catch (err) {
            throw new Error(err.message)
        }
    }

    addProductToCartService = async (cartId, prodId, user) => {
        try {
            let cart = await this.getCartByIdService(cartId)
            if (!cart) console.log('Cart not found')

            const productFound = cart.products.find(item => item.product.toString() === prodId)
            
            if(productFound) {
                if(productFound.owner === user.email){
                    throw new Error('Error adding product to cart, you are an owner.')
                }else{
                    await Cart.updateOne(
                        { _id: cartId, 'products.product': prodId },
                        { $inc: { 'products.$.quantity': 1 } }
                    )
                    return ({ message: 'Product quantity increased' })
                }
            }else{
                const addProd = { $push: { products: { product: prodId, quantity: 1 } } }
                await Cart.updateOne({ _id: cartId }, addProd)
                return ({ message: 'Product added to cart' })
            }
        } catch (err) {
            throw new Error(err.message)
        }
    }

    updateQuantityService = async (cartId, prodId, newQuantity) => {
        try {
            let cartFound = await this.getCartByIdService(cartId)

            if (cartFound) {
                const productFound = cartFound.products.find((product) => product.product.toString() === prodId)

                if (productFound) {
                    await Cart.updateOne(
                        { _id: cartId, 'products.product': prodId },
                        { $set: { 'products.$.quantity': newQuantity } }
                    )
                    return ({ message: 'Quantity updated successfully' })
                } else {
                    console.log('Product not found')
                }
            } else {
                console.log('Cart not found')
            }
        } catch (err) {
            throw new Error(err.message)
        }
    }

    updateCartService = async (cartId, prodId, userCart) => {
        try {
            if(prodId === null){
                // modifica el carrito
                let cart = await cartMethods.getCartByIdMethods(cartId)
                let updateCart = cart.products = userCart.products
                await cart.save()
                console.log('Products in cart updated successfully')
                return updateCart
            }else{
                // modifica la cant
                let cart = await cartMethods.getCartByIdMethods(cartId)

                let prodExists = cart.products.find((pid) => pid._id === prodId)
                if(prodExists){
                    prodExists.quantity = userCart.quantity
                }else{
                    console.log("Product not found in cart")
                }
                await cart.save()
                return cart
            }
        } catch (err) {
            throw new Error(err.message)
        }
    }

    updateProductsService = async (cartId, products) => {
        try {
            const cartFound = await cartMethods.updateProductsMethods(cartId, products)
            console.log('Products in cart updated successfully')
            return cartFound
        } catch (err) {
            throw new Error(err.message)
        }
    }

    deleteProductFromCartService = async (cartId, prodId) => {
        try {
            let cartFound = await this.getCartByIdService(cartId)

            if (cartFound) {
                const productFound = cartFound.products.find((product) => product.product.toString() === prodId)

                if (productFound) {
                    cartFound.products.splice(productFound, 1)
                    await cartFound.save()
                    return cartFound
                } else {
                    return false
                }
            } else {
                console.log('Cart not found')
            }
        } catch (err) {
            throw new Error(err.message)
        }

    }

    deleteCartService = async (id) => {
        try {
            const deletedCart = await cartMethods.deleteCartMethods(id)
            return deletedCart
        } catch (err) {
            throw new Error(err.message)
        }
    }

    generatePurchase = async (user, cartId) => {
        try {
            const cart = await cartMethods.getCartByIdMethods(cartId)
            if(cart){
                // guardamos IDs de los productos
                const prodsIds = cart.products.map(product => product._id.toString())
                // guardamos quantities 
                const prodsQuantity = cart.products.map(q => q.quantity)
                // guardamos info de los prods
                const prodsInfo = await productsService.getProductsDataService(prodsIds)

                let amount = 0
                let noStock = []
                let prodStock = []

                prodsInfo.map((product, i) => {
                    // si no tiene stock
                    if(prodsQuantity[i] > product.stock){
                        noStock.push({prodId: product._id, quantity: prodsQuantity[i]})
                    }else{
                        // si hay stock
                        // restamos lo que se agrega al carrito del stock
                        let newStock = product.stock - (prodsQuantity[i])

                        // sacamos el total
                        let prodPrice = product.price * (prodsQuantity[i])
                        amount += prodPrice

                        // actualizamos el stock
                        prodStock.push({prodId: product._id, stock: newStock})
                    }
                })

                // creación del ticket
                const ticket = await ticketService.createTicketService({
                    amount, purchaser: user
                })
    
                return{ticket, prodStock, noStock}
            }else{
                console.log('Cart not found')
            }

        } catch (err) {
            throw new Error(err.message)
        }
    }

    getPurchase = async () => {
        try {
            const tickets = await ticketService.getTicketsService()
            return tickets
        } catch (err) {
            throw new Error(err.message)
        }
    }

    deletePurchase = async () => {
        try {
            const tickets = await ticketService.deletePurchaseService()
            return tickets
        } catch (err) {
            throw new Error(err.message)
        }
    }
}

export default CartService