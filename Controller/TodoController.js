const redis = require("redis");
const TodoModel = require("../models/TodoModel");

let redisClient;

(async () => {
  redisClient = redis.createClient({
    password: "4d3RQOBznooai1Bw2ymsANTH9Rq40qEm",
    socket: {
      host: "redis-10799.c301.ap-south-1-1.ec2.cloud.redislabs.com",
      port: 10799,
    },
  });
  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
  console.log("redis server is connected...");
})();
module.exports.getTodo = async (req, res) => {
  let todo;
  let isCached = false;
  const cacheResults = await redisClient.get("todos");
  //   console.log("results => ", cacheResults);
  if (cacheResults) {
    isCached = true;
    todo = JSON.parse(cacheResults);
  } else {
    todo = await TodoModel.find();
    await redisClient.set("todos", JSON.stringify(todo));
  }
  res.send({ fromCache: isCached, data: todo });
};

module.exports.saveTodo = async (req, res) => {
  const { text } = req.body;
  let todoExist = await TodoModel.exists({ text: text });
  if (todoExist) {
    res.send("Todo item already exists");
  } else {
    let todo = await redisClient.get("todos");
    todo = JSON.parse(todo);
    TodoModel.create({ text }).then((data) => {
      console.log("Added Successfully");
      console.log(data);
      todo.push(data);
      redisClient.set("todos", JSON.stringify(todo));
      res.send(data);
    });
  }
};

module.exports.updateTodo = async (req, res) => {
  const { _id, text } = req.body;
  let todo = await redisClient.get("todos");
  todo = JSON.parse(todo);
  TodoModel.findByIdAndUpdate(_id, { text })
    .then(() => {
      todo = todo.map((element) => {
        if (element._id === _id) {
          element.text = text;
        }
        return element;
      });
      redisClient.set("todos", JSON.stringify(todo));
      res.send("Updated Successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.deleteTodo = async (req, res) => {
  const { _id } = req.body;
  let todo = await redisClient.get("todos");
  todo = JSON.parse(todo);
  console.log("id to delete ", _id);
  console.log("todo => ", todo);
  TodoModel.findByIdAndDelete(_id)
    .then(() => {
      todo = todo.filter((item) => item._id !== _id);
      console.log("updated todo => ", todo);
      redisClient.set("todos", JSON.stringify(todo));
      res.send("Deleted Successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};
