const { Router } = require("express");
const {
  getTodo,
  saveTodo,
  updateTodo,
  deleteTodo,
} = require("../Controller/TodoController");

const router = Router();

router.get("/", getTodo);
router.post("/save", saveTodo);
router.patch("/update", updateTodo);
router.post("/delete", deleteTodo);
module.exports = router;
