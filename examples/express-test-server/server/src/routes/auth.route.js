const { signIn } = require("../controllers/auth.controller.js");

const router = require("express").Router();

router.post("/signin", signIn);

module.exports = router;
