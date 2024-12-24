///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                  !THIS IS ROUTER FOR THIS APP!                                                           //
//          This part is very easy to do if you are making modification and custom endpoints                                //
//                                                                                                                          //
//                                           EXAMPLE                                                                        //
//                                                                                                                          //
//  router.{methode}("PATH_OF_API", authenticateAppKey, generateCSRFToken/verifyCSRFToken, {Controller_NAME}.{your_methode) //                                                                                  //
//                                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const bcrypt = require('bcrypt');
const { Admin, Todo } = require('../database/database');
const { generateCSRFToken, verifyCSRFToken, nonSessionCSRFToken, sessionCSRFToken} = require('../protection/csrfProtection');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const EmailController = require('../Controllers/EmailController');
const authenticateAppKey = require('../middleware/authenticateAppKey');
const AdminController = require('../Controllers/AdminController');
const TodoController = require('../Controllers/TodoController');
const ChangeColorsController = require("../Controllers/Colors/ChangeColors");
const CreationController = require('../Controllers/admin/CreationController');
const {requireSession} = require("../Controllers/SessionManager");
const {groupRoutes} = require("../config/group")


groupRoutes(router, '/', (groupRouter) => {
    groupRouter.post("/login", authenticateAppKey, sessionCSRFToken, AdminController.login);
    groupRouter.get("/login", authenticateAppKey, AdminController.checkLogin);
    groupRouter.post("/logout", authenticateAppKey, AdminController.logOut);
});

groupRoutes(router, "/todos", (groupRouter) =>{
    groupRouter.post("/", authenticateAppKey, verifyCSRFToken, TodoController.create);
    groupRouter.get("/", authenticateAppKey, TodoController.getAll);
    groupRouter.patch("/:todoId", authenticateAppKey, verifyCSRFToken, TodoController.update);
    groupRouter.delete("/:todoId", authenticateAppKey, verifyCSRFToken, TodoController.delete);
});

groupRoutes(router, "/emails", (groupRouter) => {
    groupRouter.post("/forgot-password", authenticateAppKey,  EmailController.sendForgotPasswordEmail);
    groupRouter.post("/reset-password", authenticateAppKey,  EmailController.resetPassword);
});
groupRoutes(router, "/admin", (groupRouter) => {
    groupRouter.get("/colors", authenticateAppKey, ChangeColorsController.getColors);
    groupRouter.post("/colors", authenticateAppKey, verifyCSRFToken, ChangeColorsController.updateColor);
    groupRouter.post("/colors/reset", authenticateAppKey, verifyCSRFToken, ChangeColorsController.resetColors);
    groupRouter.post("/users/create", authenticateAppKey, CreationController.createUser);
});

module.exports = router;

