const express = require('express')
const mongoose = require(`mongoose`)
const passport = require(`passport`)
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const authRouts = require('./routes/auth')
const analyticsRouts = require('./routes/analytics')
const categoryRouts = require('./routes/category')
const orderRouts = require('./routes/order')
const positionRouts = require('./routes/position')
const keys = require(`./config/keys`)
const app = express()

mongoose.connect(keys.mongoURI, {
   useNewUrlParser: true 
})
  .then(() => console.log(`MongoDB connected...`))
  .catch(e => console.log(e))

app.use(passport.initialize())
require(`./middleware/passport`)(passport)

app.use(morgan('dev'))
app.use(`/uploads`, express.static(`uploads`))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

app.use(`/api/auth`, authRouts)
app.use(`/api/analytics`, analyticsRouts)
app.use(`/api/category`, categoryRouts)
app.use(`/api/order`, orderRouts)
app.use(`/api/position`, positionRouts)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/dist/client'))

  app.get('*', (req, res) => {
    res.sendFile(
      path.resolve(
        __dirname, 'client', 'dist', 'client', 'index.html'
      )
    )
  })
}

module.exports = app
