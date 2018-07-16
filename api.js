const fetch = require('node-fetch');
const queryString = require('query-string');
const crypto = require('crypto');
const randomstring = require('randomstring');
const sha512 = crypto.createHash('sha512');

const Codeforces = function() {
    let keys = {
        key: "",
        secret: ""
    };
    const baseUrl = "https://codeforces.com/api/";
    async function ApiCall(method, params) {
        let rand = randomstring.generate(6);
        params.apiKey = keys.key;
        params.time = Math.floor(Date.now() / 1000);
        sha512.update(`${rand}/${method}?${queryString.stringify(params)}#${keys.secret}`);
        params.apiSig = rand+sha512.digest('hex');
        url = baseUrl + method + '?' + queryString.stringify(params);
        const result = await fetch(url, {
            method: 'GET', 
            cache: 'reload',
            referrer: 'no-referrer'
        }).then((res)=>res.json());
        if(result.status === "FAILED") {
            throw new Error(result.comment);
        } else if(result.status === "OK") {
            return result.result;
        } else {
            throw new Error("fail calling api with unknown reason");
        }
    }
    return {
        setApiKeys: function(key, secret) {
            keys.key = key;
            keys.key = secret;
        },
        blogEntry: {
            comments: function(blogEntryId) {
                if(typeof blogEntryId === 'undefined') {
                    return new Promise((resolve, reject)=>reject('blogEntryId is needed for blogEntry.comments'));
                }
                if(typeof blogEntryId !== 'object') {
                    return new Promise((resolve, reject)=>reject('should be call with {\'blogEntryId\': id}'));
                }
                return ApiCall("blogEntry.comments", blogEntryId);
            }
        },
        contest: {

        }, 
        problemset: {

        },
        user: {

        },
        recentAction: function() {

        }
    };
};

module.exports =  new Codeforces();