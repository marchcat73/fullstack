const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const User = require(`../models/User`)
const keys = require(`../config/keys`)
const errorHandler = require(`../utils/errorHandler`)


module.exports.login = async function(req, res) {

  const candidate = await User.findOne({email: req.body.email})

  if(candidate) {
    //Будем проверять пароль
    const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
    if(passwordResult) {
      // Генерация токена, пароли совпали
      const token = jwt.sign({
        email: candidate.email,
        userId: candidate._id
      }, keys.jwt, {expiresIn: 60 * 60})

      res.status(200).json({
        token: `Bearer ${token}`
      })
    } else {
      // Пароли не совпали
      res.status(401).json({
        message: `Пароль не верен. Попробуйте еще раз.`
      })
    }
  } else {
    //Пользователя нет, ошибка
    res.status(404).json({
      message: `Пользователь с таким ${req.body.email} емейл не найден.`
    })
  }
}

module.exports.register = async function(req, res) {

  const candidate = await User.findOne({email: req.body.email})

  if(candidate) {
    // Пользователь существует, нужно отправить ошибку
    res.status(409).json({
      message: `Такой ${req.body.email} емейл уже занят, попробуйте другой`
    })
  } else {
    // Нужно создать пользователя
    const salt = bcrypt.genSaltSync(10)  //создаем хеш для шифрования пароля
    const password = req.body.password
    const user = new User({
      email: req.body.email,
      password: bcrypt.hashSync(password, salt)
    })

    try{
      await user.save()
      res.status(201).json(user)
    } catch(e) {
      //Обработать ошибку
      errorHandler(res, e)
    }
    
  }
}