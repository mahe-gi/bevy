import express from "express";
const app = express();

const PORT = 3000;

app.post('/create',(req,res)=>{

    console.log(req);
    res.json({
        "msg":"Hello"
    })


})
app.get("/",(req,res)=>{
    console.log(req);
    res.send("hello from get route");
})

app.listen(PORT,()=>{
    console.log("server started on port"+ PORT);
})