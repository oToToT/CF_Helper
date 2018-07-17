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
    async function ApiCall(method, params) {
        const rand = randomstring.generate(6);
        params.apiKey = keys.key;
        params.time = Math.floor(Date.now() / 1000);
        sha512.update(`${rand}/${method}?${queryString.stringify(params)}#${keys.secret}`);
        params.apiSig = rand+sha512.digest('hex');
        const url = `https://codeforces.com/api/${method}?${queryString.stringify(params)}`;
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
            keys.secret = secret;
        },
        blogEntry: {
            comments: function(blogEntryId) {
                if(typeof blogEntryId === 'number')
                    blogEntryId = {'blogEntryId': blogEntryId};
                if(typeof blogEntryId !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall("blogEntry.comments", blogEntryId);
            },
            view: function(blogEntryId) {
                if(typeof blogEntryId === 'number')
                    blogEntryId = {'blogEntryId': blogEntryId};
                if(typeof blogEntryId !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall("blogEntry.view", blogEntryId);
            }
        },
        contest: {
            hacks: function(contestId) {
                if(typeof contestId === 'number')
                    contestId = {'contestId': contestId}
                if(typeof contestId !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall("contest.hacks", contestId);
            },
            list: function(gym) {
                if(typeof gym === 'undefined')
                    gym = {};
                if(typeof gym === 'boolean')
                    gym = {'gym': gym}
                if(typeof gym !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall("contest.list", gym);
            },
            ratingChanges: function(contestId) {
                if(typeof contestId === 'number')
                    contestId = {'contestId': contestId}
                if(typeof contestId !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall("contest.ratingChanges", contestId);
            },
            standings: function(params) {
                if(typeof params !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall("contest.standings", params);
            },
            status: function(params) {
                if(typeof params !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall("contest.status", params);
            }
        }, 
        problemset: {
            problems: function(params) {
                if(typeof params === 'undefined')
                    params = {};
                if(typeof params !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                if(Array.isArray(params.tags)) 
                    params.tags = params.tags.join(';');
                return ApiCall('problemset.problems', params);
            },
            recentStatus: function(params) {
                if(typeof params !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall('problemset.recentStatus', params);
            }
        },
        recentAction: function(maxCount) {
            if(typeof maxCount === 'undefined')
                maxCount = 100;
            if(typeof maxCount === 'number')
                maxCount = {'maxCount': maxCount};
            if(typeof maxCount !== 'object')
                return new Promise((resolve, reject)=>
                    reject('Invalid Parameters')
                );
            return ApiCall('recentAction', maxCount);
        },
        user: {
            blogEntries: function(handle) {
                if(typeof handle === 'string')
                    handle = {'handle': handle};
                if(typeof handle !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall('user.blogEntries', handle);
            },
            friends: function(onlyOnline) {
                if(typeof onlyOnline === 'undefined')
                    onlyOnline = {};
                if(typeof onlyOnline === 'boolean')
                    onlyOnline = {'onlyOnline': onlyOnline}
                if(typeof onlyOnline !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall("user.friends", onlyOnline);
            },
            info: function(handles) {
                if(typeof handles === 'string') 
                    handles = {'handles': handles}
                if(Array.isArray(handles))
                    handles = {'handles': handles.join(';')}
                if(typeof handles !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall("user.info", handles);
            },
            ratedList: function(activeOnly) {
                if(typeof activeOnly === 'undefined')
                    activeOnly = {};
                if(typeof activeOnly === 'boolean')
                    activeOnly = {'activeOnly': activeOnly}
                if(typeof activeOnly !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall("user.ratedList", activeOnly);
            },
            rating: function(handle) {
                if(typeof handle === 'string')
                    handle = {'handle': handle};
                if(typeof handle !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall('user.rating', handle);
            },
            status: function(params) {
                if(typeof params !== 'object')
                    return new Promise((resolve, reject)=>
                        reject('Invalid Parameters')
                    );
                return ApiCall('user.status', params);
            }
        }
    };
};

module.exports =  new Codeforces();