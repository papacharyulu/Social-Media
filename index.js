import express from 'express'
import hbs from 'hbs'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import {readPosts, readUser, insertPost, insertUser, likeFun, shareFun, deleteFun} from './operations.js'

const app = express()

app.set('view engine', 'hbs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(cookieParser())


app.get('/',(req, res)=>{
    res.render("login")
})

app.post('/login',async (req, res)=>{
    
    const output = await readUser(req.body.profile)
    const password = output[0].password
    if (password === req.body.password)
    {
        const secret = "7fd89d2626ab983fa85c4d43ddbe2f7cf66b126851a678d5f4bd33f4871b5adfaa160a61dd7dec9a540ef806dbf1067c1ddeb2be7370070f09ad5c816a5f828d"

        const payload = {"profile":output[0].profile, "name":output[0].name, "headline":output[0].headline}

        const token = jwt.sign(payload,secret)

        res.cookie("token", token)
        res.redirect("/posts")

    }
    else
    {
        res.send("Incorrect UserName or Password")
    }
})

app.get('/posts',verifyLogin,async (req, res)=>{
    const output = await readPosts()

    res.render("posts",{
        data: output,
        userInfo: req.payload
    })
})

app.post('/like',async(req,res)=>{
await likeFun(req.body.content)
res.redirect('/posts')
})

app.post('/share',async(req,res)=>{
    await shareFun(req.body.content)
    res.redirect('/posts')
    })

    app.post('/delete',async(req,res)=>{
        await deleteFun(req.body.content)
        res.redirect('/posts')
        })

    app.post('/addposts',async (req, res)=>{
        await insertPost(req.body.profile,req.body.content)
        res.redirect("/posts")
    })

function verifyLogin(req, res, next) {
    const secret = "7fd89d2626ab983fa85c4d43ddbe2f7cf66b126851a678d5f4bd33f4871b5adfaa160a61dd7dec9a540ef806dbf1067c1ddeb2be7370070f09ad5c816a5f828d"
    const token = req.cookies.token
    jwt.verify(token, secret, (err, payload)=>{
        if (err) return res. sendStatus(403)
        req.payload = payload
    })
    next()
}

app.post('/addusers',async (req, res)=>{
    if(req.body.password === req.body.cnfpassword)
    {
        await insertUser(req.body.name, req.body.profile, req.body.password, req.body.headline)
        res.redirect('/')
    }
    else
    {
        res.send("Password and Confirm Password Did Not Match")
    }

   
})

app.get('/register',(req, res)=>{
    res.render("register")
})

app.listen(3000,()=>{
    console.log("Listening...")
})