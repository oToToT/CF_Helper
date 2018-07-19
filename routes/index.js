const express = require('express');
const router = express.Router();
const Codeforces = require('~/api.js');

// cache for 30 minute
Codeforces.external.setCacheTime(30 * 60000);

/* GET home page. */
router.get('/', async function(req, res, next) {
    res.render('index');
});
router.get('/compare/:id1/:id2', async function(req, res, next) {
    const id1 = req.params.id1, id2 = req.params.id2;
    console.log(`> compare ${id1} and ${id2}`);
    let s1 = {}, s2 = {};
    try{
        await Promise.all([Codeforces.user.status({'handle': id1}), 
            Codeforces.user.status({'handle': id2}),
            Codeforces.problemset.problems()]);
        [s1, s2] = await Promise.all([Codeforces.external.acProblemsOfUser(id1),
            Codeforces.external.acProblemsOfUser(id2)]);
    }catch(error){
        return res.render('compare', {'error': error});
    }
    const prob_comp = function(a, b) {
        if(a.contestId === b.contestId){
            if(a.index === b.index) return 0;
            else if(a.index < b.index) return -1;
            else return 1;
        }else return a.contestId - b.contestId;
    }
    const one = [...s1].filter((x)=>{
        const x_name = `${x.contestId}${x.index}`;
        return !s2.find((y)=>x_name == `${y.contestId}${y.index}`);
    }).sort(prob_comp);
    const two = [...s2].filter((x)=>{
        const x_name = `${x.contestId}${x.index}`;
        return !s1.find((y)=>x_name == `${y.contestId}${y.index}`);
    }).sort(prob_comp);
    const both = [...s1].filter((x)=>{
        const x_name = `${x.contestId}${x.index}`;
        return s2.find((y)=>x_name == `${y.contestId}${y.index}`);
    }).sort(prob_comp);
    return res.render('compare', {id1, id2, one, two, both});
});

module.exports = router;
