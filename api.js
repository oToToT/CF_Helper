const fetch = require('node-fetch');
const queryString = require('query-string');
const randomstring = require('randomstring');
const crypto = require('crypto');

const CfCache = function() {
    let dataStore = {}, CACHED_TIME = 600000;
    return {
        setCacheTime: function(time) {
            CACHED_TIME = time;
        },
        check: function(key) {
            if(typeof dataStore[key] === 'undefined') return false;
            const curTime = new Date();
            if(curTime - dataStore[key].updTime >= CACHED_TIME) {
                delete dataStore[key];
                return false;
            }
            return true;
        },
        get: function(key) {
            return dataStore[key].value;
        },
        update: function(key, data) {
            const curTime = new Date();
            dataStore[key] = { 'updTime': curTime, 'value': data };
        }
    }
}

const cfcache = new CfCache();

const Codeforces = function() {
    let keys = {
        key: "",
        secret: ""
    };
    async function ApiCall(method, params) {
        // check cache
        const cache_key = `${method}?${queryString.stringify(params)}`;
        if(cfcache.check(cache_key))
            return cfcache.get(cache_key);
        // authorize cf api
        const rand = randomstring.generate(6);
        params.apiKey = keys.key;
        params.time = Math.floor(Date.now() / 1000);
        const hasher = crypto.createHash('sha512');
        hasher.update(`${rand}/${method}?${queryString.stringify(params)}#${keys.secret}`);
        params.apiSig = rand+hasher.digest('hex');
        // fetch data
        const url = `https://codeforces.com/api/${method}?${queryString.stringify(params)}`;
        console.log(`fetching ${url}`);
        const result = await fetch(url, {
            method: 'GET', 
            cache: 'reload',
            referrer: 'no-referrer'
        }).then((res)=>res.json());
        // check result type
        if(result.status === "FAILED") {
            throw new Error(result.comment);
        } else if(result.status === "OK") {
            cfcache.update(cache_key, result.result);
            console.log("success");
            return result.result;
        } else {
            throw new Error("fail calling api with unknown reason");
        }
    }
    return {
        setApiKeys: async function(key, secret) {
            keys.key = key;
            keys.secret = secret;
        },
        blogEntry: {
            comments: async function(blogEntryId) {
                if(typeof blogEntryId === 'number')
                    blogEntryId = {'blogEntryId': blogEntryId};
                if(typeof blogEntryId !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall("blogEntry.comments", blogEntryId);
            },
            view: async function(blogEntryId) {
                if(typeof blogEntryId === 'number')
                    blogEntryId = {'blogEntryId': blogEntryId};
                if(typeof blogEntryId !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall("blogEntry.view", blogEntryId);
            }
        },
        contest: {
            hacks: async function(contestId) {
                if(typeof contestId === 'number')
                    contestId = {'contestId': contestId}
                if(typeof contestId !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall("contest.hacks", contestId);
            },
            list: async function(gym) {
                if(typeof gym === 'undefined')
                    gym = {};
                if(typeof gym === 'boolean')
                    gym = {'gym': gym}
                if(typeof gym !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall("contest.list", gym);
            },
            ratingChanges: async function(contestId) {
                if(typeof contestId === 'number')
                    contestId = {'contestId': contestId}
                if(typeof contestId !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall("contest.ratingChanges", contestId);
            },
            standings: async function(params) {
                if(typeof params !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall("contest.standings", params);
            },
            status: async function(params) {
                if(typeof params !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall("contest.status", params);
            }
        }, 
        problemset: {
            problems: async function(params) {
                if(typeof params === 'undefined')
                    params = {};
                if(typeof params !== 'object')
                    throw new Error('Invalid Parameters');
                if(Array.isArray(params.tags)) 
                    params.tags = params.tags.join(';');
                return ApiCall('problemset.problems', params);
            },
            recentStatus: async function(params) {
                if(typeof params !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall('problemset.recentStatus', params);
            }
        },
        recentAction: async function(maxCount) {
            if(typeof maxCount === 'undefined')
                maxCount = 100;
            if(typeof maxCount === 'number')
                maxCount = {'maxCount': maxCount};
            if(typeof maxCount !== 'object')
                throw new Error('Invalid Parameters');
            return ApiCall('recentAction', maxCount);
        },
        user: {
            blogEntries: async function(handle) {
                if(typeof handle === 'string')
                    handle = {'handle': handle};
                if(typeof handle !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall('user.blogEntries', handle);
            },
            friends: async function(onlyOnline) {
                if(typeof onlyOnline === 'undefined')
                    onlyOnline = {};
                if(typeof onlyOnline === 'boolean')
                    onlyOnline = {'onlyOnline': onlyOnline}
                if(typeof onlyOnline !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall("user.friends", onlyOnline);
            },
            info: async function(handles) {
                if(typeof handles === 'string') 
                    handles = {'handles': handles}
                if(Array.isArray(handles))
                    handles = {'handles': handles.join(';')}
                if(typeof handles !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall("user.info", handles);
            },
            ratedList: async function(activeOnly) {
                if(typeof activeOnly === 'undefined')
                    activeOnly = {};
                if(typeof activeOnly === 'boolean')
                    activeOnly = {'activeOnly': activeOnly}
                if(typeof activeOnly !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall("user.ratedList", activeOnly);
            },
            rating: async function(handle) {
                if(typeof handle === 'string')
                    handle = {'handle': handle};
                if(typeof handle !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall('user.rating', handle);
            },
            status: async function(params) {
                if(typeof params !== 'object')
                    throw new Error('Invalid Parameters');
                return ApiCall('user.status', params);
            }
        },
        external: {
            setCacheTime: function(time) {
                if(typeof time !== 'number')
                    throw new Error('cache time should be a number');
                cfcache.setCacheTime(time);
            }
        }
    };
};

module.exports =  new Codeforces();