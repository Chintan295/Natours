const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authController= require('../controllers/authController');

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/forgetPassword',authController.forgetPassword);
router.patch('/resetPassword/:resetToken',authController.resetPassword);

//After this route all the route to access user must be login
router.use(authController.protect);

router.patch('/updatePassword',authController.protect,authController.updatePassword);
router.patch('/updateMe',authController.protect,userController.updateMe);
router.delete('/deleteMe',authController.protect,userController.deleteMe);
router.get('/me',authController.protect,userController.getMe,userController.getUser);

router.use(authController.restrict('admin'))
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;