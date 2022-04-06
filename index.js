const http = require('http');
const MongoClient = require('mongodb').MongoClient
var formidable = require('formidable');
var url = "mongodb+srv://projecttwo:projecttwo@cluster0.qt7ts.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const server = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type','multipart/form-data');
    if(req.method === "POST"){
        console.log("hi");
        const form = formidable({ multiples: true });
  
        form.parse(req, (err, fields, files) => {  
          console.log(fields);
          console.log(files);
        if (err) {
          res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
          res.end(String(err));
          return;
        }
        MongoClient.connect(url,function(err,db){
          if(err) throw err;
          var database = db.db('sampledata');
          var data = {
            image : files,
            field :fields
          }
          if(data.image){
            return database.collection('data').insertOne(data,
              function(err,result){
                if(err) throw err;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                console.log(result)
              }
              )
          }
        
        res.end(JSON.stringify({ fields, files }, null, 2));
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