const events = require('events');
const express = require('express');
const axios = require('axios');
const redis = require('redis');


const redisClient = redis.createClient({
  host: '127.0.0.1', // Replace with your Redis server's hostname or IP address
  port: '6379', // Replace with your Redis server's port
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});
redisClient.connect();

const app = express();

app.use(express.urlencoded({ extended: true}))

app.get('/photos/', async(req,res) => {
  const albumId  = req.params.id
  
  const photos = await getOrSetCache(`photos` , async() => {
    console.log("err")
    const {data} = await axios.get("https://jsonplaceholder.typicode.com/photos" ,
    {
      params: {
        albumId:albumId
      }
    })
    return data
  }
  )


res.json(photos)
  
}
)



app.get('/photos/:id', async(req,res) => {
  const albumId  = req.params.id
  
  const photos = await getOrSetCache(`photos?albumId=${albumId}` , async() => {
    console.log("err")
    const {data} = await axios.get("https://jsonplaceholder.typicode.com/photos" ,
    {
      params: {
        albumId:albumId
      }
    })
    return data
  }
  )


res.json(photos)
  
}
)


function getOrSetCache(key,cb)
{
  return new Promise(async(resolve , reject) => {
    console.log("hello")
    console.log(await redisClient.get("name"))
    const data = await redisClient.get(key)
      
      
    
      if(data != null) 
      {
        console.log("Cached")
        return resolve(JSON.parse(data))
      }
      const freshData = await cb();
      console.log("miss")
      redisClient.setEx(key , 3600 , JSON.stringify(freshData))
      return resolve(freshData)
      
    
  }
  )
}

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});


// var EventEmitter = new events.EventEmitter();

// EventEmitter.on('deing', function(message) {
//     console.log("printing ......" , message);
// });

// EventEmitter.emit('deing', 'find what you love and make it kill you');