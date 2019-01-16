/**
 * TskController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
let sID = "TS";
let redis = require("redis"),
client = redis.createClient({
  port: 6379,
  host: '127.0.0.1',
  // host: '192.168.1.103',
});
 
let getData = (req,res)=>{
  client.smembers(sID,(error, value)=>{
    if(error){
      console.log("Error " + error);
    }else{
      let temp = [];
      if(value!=[]){
        value.forEach(element => {
          temp.push({desc: element , done: false});
        });
      }
      Tsk.find({}).exec((err, completedTasks) => {
        if(err) {console.log(err);}
        if(completedTasks!=[]){
          completedTasks.forEach(task => {
            temp.push(task);
          });
        }
        res.json({taskList: temp});
      });
    }
  })
}

let delTask = (req, res) =>{
  let id = req.body
    client.srem(sID, id.desc, (err)=>{
      if(err){
        res.send(500, {error:"DB Error"})
      }
    })
    getData(req, res);
}

let addTask = (req, res)=>{
  let id = req.body;
    client.sadd(sID, id.desc, (err)=>{
      if(err){
        res.send(500, {error:"DB Error"})
      }
      res.redirect('/')
    })
}

let addRemoveTask = (req, res)=>{
  let id = req.body;
  client.srem(sID, id.desc, (err)=>{
    if(err){
      res.send(500, {error:"DB Error"})
    }
    client.sadd(sID, id.editedDesc, (err)=>{
      if(err){
        console.log("Error " + err);
      } 
      res.redirect('/');
    });
  })
}

client.on("error", function (err) {
  console.log("Error " + err);
});
module.exports = {
  start:(req,res)=>{
    getData(req, res)
  },
  add:(req, res)=>{
    addTask(req, res)
  },
  done:(req, res)=>{
    delTask(req, res);
    let id = req.body
    Tsk.create({desc:id.desc , done: true}).exec((err)=>{
      if(err){
        console.log("Error " + err);
      }
      console.log("Data added in Mongo")
    })
  },
  delete:(req,res)=>{
    delTask(req, res)
  },
  edit:(req,res)=>{
    addRemoveTask(req, res)
  },
  /**
   * `TskController.tskh()`
   */
  tskh: async function (req, res) {
    return res.json({
      todo: 'tskh() is not implemented yet!'
    });
  },

  /**
   * `TskController.tsks()`
   */
  tsks: async function (req, res) {
    return res.json({
      todo: 'tsks() is not implemented yet!'
    });
  }

};
//action="/tsk/edit/<%= task %>" method="post"