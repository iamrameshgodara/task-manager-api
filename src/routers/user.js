const express = require('express')
const multer = require('multer')
const sharp=require('sharp')
const User = require('../models/user')
const router = new express.Router()
const bodyParser = require('body-parser').json()
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendCancelEmail}=require('../emails/account')

router.post('/users', bodyParser, async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    sendWelcomeEmail(user.email,user.name)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image.'))
    }
    cb(undefined, true)
  }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req, res) => {
  const buffer=await sharp(req.file.buffer).resize({height:250,width:250}).png().toBuffer()
  req.user.avatar= buffer  
   await req.user.save()
  res.send()
  },(error, req, res, next) => {
    res.status(400).send({ error: error.message })
  }
)

router.delete('/users/me/avatar',auth, async (req,res)=> {
  req.user.avatar=undefined
  await req.user.save()
  res.send()
})

router.get('/users/:id/avatar',async (req,res)=>{
try{
const user=await User.findById(req.params.id)
if(!user || !user.avatar){
  throw new Error()
}
res.set('Content-Type','image/png')
res.send(user.avatar)
}
catch(e){
  res.status(404).send()
}
})

router.post('/users/login', bodyParser, async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send(e)
    console.log('error', e)
  }
})
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      //req.user is already fetched in auth
      return token.token != req.token
    })
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user) //req.user is definded in auth so we will get user from auth
})

router.get('/users/:id', async (req, res) => {
  const _id = req.params.id

  try {
    const user = await User.findById(_id)

    if (!user) {
      return res.status(404).send()
    }

    res.send(user)
  } catch (e) {
    res.status(500).send()
  }
})

router.patch('/users/me', auth, bodyParser, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  //just check updating key is available or not i.e height.
  if (!isValidOperation) {
    return res.status(400).send({
      error: 'Invalid updates!'
    })
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update])) //shorthand
    await req.user.save()
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    //now we are using auth so we a have access to user.
    await req.user.remove()
    sendCancelEmail(req.user.email,req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router
