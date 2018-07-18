const express = require('express');
const router = express.Router();
const Codeforces = require('~/api.js');

/* GET home page. */
router.get('/', async function(req, res, next) {
    res.render('index');
});
router.get('/compare/:id1/:id2', async function(req, res, next) {
    const id1 = req.params.id1, id2 = req.params.id2;
    console.log(`> compare ${id1} and ${id2}`);
    let result = {}
    try{
        result = await Promise.all(Codeforces.external.user.acProblems(id1), 
            Codeforces.external.user.acProblems(id2));
    }catch(error){
        result = error;
    }
    res.render('compare', {one: result[0], two: result[1]});
});

module.exports = router;
