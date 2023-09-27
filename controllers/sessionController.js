import UserService from "../services/usersService.js"
const userService = new UserService()
import UserDTO from "../dao/DTO/userDto.js"
import jwt from 'jsonwebtoken'

class SessionController {
    getUsersController = async (req, res) => {
        try{
            const users = await userService.getUsersService()
            res.status(200).send({users: users})
        }catch(err){
            res.status(404).send({error:err})
        }
    }

    register = (req,res) => {
        try{
            if(!req.user) return res.status(400).send({error: 'Error registering'})
            
            req.session.user = {_id: req.user._id, email: req.user.email, firstName:  req.user.firstName, lastName: req.user.lastName, password: req.session.password, age: req.user.age, cart: req.user.cart}

            return res.status(200).redirect('/session/login')
        }catch(err){
            return res.status(500).send({error: err.message})
        }
    }

    failedRegister = (req, res) => {
        return res.status(400).send({error: 'Fail to register'})
    }

    login = (req, res) => {
        try{
            if(!req.user) return res.status(401).send({error: 'Invalid credentials'})
            
            req.session.user = {
                _id: req.user._id,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                password: req.user.password,
                age: req.user.age,
                cart: req.user.cart,
                role: req.user.role
            }

            const showUser = new UserDTO(req.session.user)
            console.log(showUser)
            
            try {
                let token = jwt.sign(req.session.user, 'tokenSecreto', { expiresIn: '2000s' })
                console.log({ token, message: 'User logged in' })
                return res.redirect('/home')
            } catch (tokenError) {
                return next(tokenError)
            }
        }catch(err){
            return res.status(500).send({error: err.message})
        }
    }

    failLogin = (req, res) => {
        return res.status(400).send({error: 'Fail to login'})
    }

    logout = (req, res) => {
        req.session.destroy((err) => {
            if(err) return res.status(500).send({error:'Logout failed', detail: err})
            console.log('Logged out')
            res.redirect('/session/login')
        })
    }

    isAdmin = (req, res) => {
        res.send('Bienvenido admin!')
    }

    getCurrentSession = (req, res) => {
        const user = req.session.user
        const showUser = new UserDTO(user)
        return res.status(200).send({user: showUser})
    }
    
    updateRoleController = async (req, res) => {
        const userId = req.params.uid
        await userService.updateRoleService(userId)
        const updatedUser = await userService.getUsersByIdService(userId)
        const showUser = new UserDTO(updatedUser)
        console.log('Current role:', updatedUser.role)
        return res.status(200).send({updatedUser: showUser})
    }

    changePasswordController = async (req, res) => {
        await userService.changePasswordService(req.query.email, req.body.password)
        console.log('Password changed successfully')
        return res.status(200).redirect('/session/login')
    }

}

export default SessionController