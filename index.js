const http = require('http');
const MongoClient = require('mongodb').MongoClient
const fs = require('fs')
var formidable = require('formidable');
const { fstat } = require('fs');
var url = "mongodb+srv://projecttwo:projecttwo@cluster0.qt7ts.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const server = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type','multipart/form-data');
    if(req.method === "POST"){
        const form = formidable({ multiples: true });
        form.parse(req, (err, fields, files) => { 
          if (err) {
          res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
          res.end(String(err));
          return;
        }
        MongoClient.connect(url,function(err,db){  
          if(err) throw err;
          var dbo = db.db('sampledata');
          var data = {
            image : files,
            field : fields
          }
          var email = data.field.email
            dbo.collection('data').find({"field.email" : email}).toArray((err,result)=>{
              if(result[0]){
                res.writeHead(401)
                const message = "Email already exists"
                return res.end(JSON.stringify({'message': message }))
              }
              else{
                let oldpath = data.image.file.filepath;
                let newPath = `./uploads/${data.image.file.originalFilename}`
                data.image = newPath;
                console.log(data.image)
                fs.rename(oldpath, newPath, (err)=>{
                  if(err){
                    console.log(err)
                    console.log("some error")
                  }else{
                    console.log('uploaded')
                  }
                })
                return dbo.collection('data').insertOne(data,
                  function(err,result){
                    if(err) throw err;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    var message = 'User data collected'
                    res.end(JSON.stringify({ 'message':message }));
                  }
                )
              }           
            })     
        })      
      });
        }
        else{
          console.log('this is GET request');
          MongoClient.connect(url,function(err,db){
            if(err) throw err;
            var dbo = db.db('sampledata');
            if(dbo){
              return dbo.collection('data').find({}).toArray(function(err,result){
                if(err) throw err;  
                res.writeHead(200,{'Content-Type':'application/json'})         
                res.end(JSON.stringify(result)) 
              }) 
        }    
      })    
    }
});

server.listen(3000, (err) => {
  if (err) {
    console.log('bad things');
    return;
  }
  console.log('listening on port 3000');
});