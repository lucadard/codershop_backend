import { randomUUID } from 'crypto'
import { User } from './models/User.js'
import { CustomError } from '../models/CustomError.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { vars } from '../../config/vars.js'

const createHash = (password) => {
  if (!password) throw new CustomError('Password not provided', 400)
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}
const isPasswordValid = (user, password) =>
  bcrypt.compareSync(password, user.password)
const generateAccessToken = (user) => jwt.sign(user, vars.jwtSecret)

export class UsersService {
  #repository
  constructor(repository) {
    this.#repository = repository
  }
  getUserById = async (userId) => {
    const user = await this.#repository.getById(userId)
    if (!user) throw new CustomError('User not found.', 404)
    return user.asDto()
  }
  getUserDetails = async (userId) => {
    const user = await this.#repository.getById(userId)
    if (!user) throw new CustomError('User not found.', 404)
    return {
      ...user.asDto(),
      password: undefined,
      admin: vars.admins.includes(user.asDto().email)
    }
  }
  addUser = async (userData) => {
    const newUser = new User({
      ...userData,
      id: randomUUID(),
      password: createHash(userData.password)
      // ? check password complexity
    })
    const [userAlreadyExists] = await this.#repository.getByQuery({
      email: userData.email
    })
    if (userAlreadyExists) throw new CustomError('User already exists.', 400)

    const createdUser = await this.#repository.create(newUser)
    if (!createdUser) throw new CustomError('Could not create user.', 500)
    return createdUser.asDto()
  }
  login = async (email, password) => {
    const [user] = await this.#repository.getByQuery({ email })
    if (!user) throw new CustomError('User not found.', 404)

    if (!isPasswordValid(user.asDto(), password))
      throw new CustomError('Invalid credentials', 401)
    return generateAccessToken({ id: user.asDto().id })
  }
}
