import UserMethods from "../dao/methods/usersMethods.js"
const userMethods = new UserMethods()
import {createHash, isValidPassword} from '../utils/bcrypt.js'

class UserService {
    getUsersService = async () => {
        try{
            const users = await userMethods.getUsersMethod()
            return users
        }catch(err){
            throw new Error(err.message)
        }
    }

    getUsersByIdService = async (id) => {
        try{
            const userFound = await userMethods.getUserByIdMethod(id)
            return userFound
        }catch(err){
            throw new Error(err.message)
        }
    }

    getUsersByEmailService = async (email) => {
        try {
            const userFound = await userMethods.getUserByEmailMethod(email)
            return userFound
        } catch (err) {
            throw new Error(err.message)
        }
    }

    addUserService = async (user) => {
        try{
            if(!user.email || !user.firstName || !user.lastName || !user.password || !user.age){
                CustomError.createError({
                    name: 'User registering error',
                    cause: userRegisterErrorInfo(user),
                    message: 'Error registering user - TEST',
                    code: ErrorsEnum.INVALID_TYPES_ERROR
                })
            }

            const newUser = await userMethods.addUserMethod(user)

            return newUser
        }catch(err){
            throw new Error(err.message)
        }
    }

    updateRoleService = async (id) => {
        try{
            const userFound = await this.getUsersByIdService(id)

            if (userFound && userFound.role) {
                if (userFound.role === 'user') {
                    const updateRole = await userMethods.updateUsertMethods(id, { role: 'premium' })
                    return updateRole
                } else if (userFound.role === 'premium') {
                    const updateRole = await userMethods.updateUsertMethods(id, { role: 'user' })
                    return updateRole
                }
            } else {
                throw new Error("Invalid user data or role not found.")
            }

        }catch(err){
            throw new Error(err.message)
        }
    }

    changePasswordService = async (userEmail, newPassword) => {
        const userFound = await userMethods.getUserByEmailMethod(userEmail)
        
        if(isValidPassword(newPassword, userFound.password)){
            throw new Error('You cannot reuse your previous password')
        }else{
            const updatePassword = await userMethods.updateUsertMethods(userFound._id, {password: createHash(newPassword)})
    
            if(updatePassword){
                return {message: 'Password updated successfully'}
            }else{
                throw new Error('There was an error updating your password')
            }
        }


    }


}

export default UserService