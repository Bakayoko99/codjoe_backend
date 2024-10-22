
const express = require('express');

const router = express.Router();

const { signUp, logIn } = require('../controllers/authController');
const { signUpValidator, loginValidator } = require('../middlewares/authValidator');


router.get('/cj', (req, res) => {
    res.send('Codjoe App auth route');
});

router.post('/signup', signUpValidator, signUp);

router.post('/login', loginValidator, logIn);

module.exports = router;