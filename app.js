const express = require('express')
const app = express()
const path = require('path')
const dotenv = require('dotenv')
var multer = require('multer')
const Post = require('./api/models/posts')
const postsData = new Post()

dotenv.config()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${getExt(file.mimetype)}`)
  },
})

const getExt = (mimetype) => {
  switch (mimetype) {
    case 'image/png':
      return '.png'
    case 'image/jpeg':
      return '.jpeg'
  }
}

var upload = multer({ storage: storage })

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
app.use(express.static(path.join(__dirname, '/public')))

app.get('/api/posts', (req, res) => {
  res.status(200).send(postsData.get())
})

app.get('/api/posts/:postId', (req, res) => {
  const postId = req.params.postId
  const foundPost = postsData.getIndividualBlog(postId)
  if (foundPost) {
    res.status(200).send(foundPost)
  } else {
    res.status(404).send('Not Found')
  }
})

app.post('/api/posts', upload.single('post-image'), (req, res) => {
  const newPost = {
    id: `${Date.now()}`,
    title: req.body.title,
    content: req.body.content,
    post_image: `uploads/${req.file.filename}`,
    added_date: `${Date.now()}`,
  }
  postsData.add(newPost)
  res.status(201).send('ok')
})

app.get('*', (req, res) =>
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server running on port ${PORT}`))
