const express = require('express');
const router = express.Router();
const Codeforces = require('~/api.js');

/* GET home page. */
router.get('/', async function(req, res, next) {
    let val = "Express";
    try{
        val = await Codeforces.user.info("oTo_ToT");
    }catch(error){
        val = error;
    }
    res.render('index', { title: val });
});

module.exports = router;
