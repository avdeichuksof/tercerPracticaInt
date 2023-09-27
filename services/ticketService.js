import TicketMethods from "../dao/methods/ticketMethods.js"
const ticketMethods = new TicketMethods()
import ProductsService from "./productsService.js"
const productsService = new ProductsService()

class TicketService {
    createTicketService = async (newTicket) => {
        const newTkt = await TicketMethods.createTicketMethod(newTicket)
        return newTkt
    }

    getTicketsService = async () => {
        const tickets = await TicketMethods.getTicketsMethod()
        return tickets
    }

    updateStockService = async (stock) => {
        stock.map(async (product, index) => {
            await productsService.updateStockService(product.id, product.stock)
            console.log('Stock modificado')
        })
    }

    deletePurchaseService = async () => {
        const ticket = await TicketMethods.deletePurchaseMethod()
        return ticket
    }
}

export default TicketService