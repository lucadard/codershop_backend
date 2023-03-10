import { cartsService } from '../carts/index.js'
import { usersService } from './index.js'
import { vars } from '../../config/vars.js'

const usersController = {
  getUser: async (req, res, next) => {
    try {
      const user = await usersService.getUserDetails(req.user.id) // req.user is data from jwt
      res.json({ userData: user })
    } catch (err) {
      next(err)
    }
  },
  registerUser: async (req, res, next) => {
    try {
      const createdUser = await usersService.addUser(req.body)
      const createdCart = await cartsService.createCart(createdUser.id)
      res.json({ id: createdUser.id })
    } catch (err) {
      next(err)
    }
  }
}

export class UsersController {
  static getController = () => usersController
}
