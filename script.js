"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MyPromise_callbacks, _MyPromise_resolve, _MyPromise_reject, _MyPromise_settled;
const func = (res, rej) => {
    setTimeout(() => {
        res("error");
    }, 1000);
};
let count = 0;
// console.log(test);
class MyPromise {
    constructor(func) {
        _MyPromise_callbacks.set(this, void 0);
        _MyPromise_resolve.set(this, (value) => {
            if (this.state !== "pending")
                return;
            this.state = "fulfilled";
            this.result = value;
            __classPrivateFieldGet(this, _MyPromise_settled, "f").call(this, "onFulfilled");
        });
        _MyPromise_reject.set(this, (value) => {
            if (this.state !== "pending")
                return;
            this.state = "rejected";
            this.result = value;
            // console.log(this);
            __classPrivateFieldGet(this, _MyPromise_settled, "f").call(this, "onRejected");
        });
        _MyPromise_settled.set(this, (state) => {
            queueMicrotask(() => {
                for (const exec of __classPrivateFieldGet(this, _MyPromise_callbacks, "f")) {
                    try {
                        const result = exec[state](this.result);
                        exec.resolve(result);
                    }
                    catch (err) {
                        exec.reject(err);
                    }
                }
            });
        });
        this.state = "pending";
        this.result = null;
        __classPrivateFieldSet(this, _MyPromise_callbacks, [], "f");
        try {
            func(__classPrivateFieldGet(this, _MyPromise_resolve, "f").bind(this), __classPrivateFieldGet(this, _MyPromise_reject, "f").bind(this));
        }
        catch (err) {
            // console.log(err, "gggg");
            __classPrivateFieldGet(this, _MyPromise_reject, "f").call(this, err);
        }
    }
    then(onFulfilled, onRejected) {
        return new MyPromise((resolve, reject) => {
            __classPrivateFieldGet(this, _MyPromise_callbacks, "f").push({
                name: ++count,
                onFulfilled: onFulfilled ?? ((value) => value),
                onRejected: onRejected ??
                    ((err) => {
                        throw err;
                    }),
                resolve,
                reject,
            });
        });
    }
    catch(onRejected) {
        return this.then(null, onRejected);
    }
    static resolve(value) {
        return new MyPromise((res) => res(value));
    }
    static reject(value) {
        return new MyPromise((_, rej) => rej(value));
    }
    static all(arr) {
        let promiseArr = [];
        if (!Array.isArray(arr)) {
            throw new Error("expect an array");
        }
        return new MyPromise((resolve, reject) => {
            arr.forEach((el) => {
                if (!(el instanceof MyPromise)) {
                    Promise.resolve(el).then((el) => {
                        promiseArr.push(el);
                    });
                }
                else {
                    el.then((el) => {
                        // console.log(el);
                        promiseArr.push(el);
                        if (promiseArr.length === arr.length) {
                            resolve(promiseArr);
                        }
                    }).catch((el) => {
                        reject(el);
                    });
                }
            });
        });
    }
    static any(arr) {
        let faileddArr = [];
        if (!Array.isArray(arr)) {
            throw new Error("expect an array");
        }
        return new MyPromise((resolve, reject) => {
            if (arr.length === 0) {
                reject([]);
            }
            arr.forEach((el) => {
                if (el instanceof MyPromise) {
                    el.then((el) => {
                        resolve(el);
                    }).catch((err) => {
                        faileddArr.push(err);
                        if (faileddArr.length === arr.length) {
                            // const msg = new AggregateError("");
                            reject("AggregateError: All promises were failed");
                        }
                    });
                }
                else {
                    //for numberws,string
                    Promise.resolve(el).then((el) => {
                        resolve(el);
                    });
                }
            });
        });
    }
    static race(arr) {
        if (!Array.isArray(arr)) {
            throw new Error("Expects an array");
        }
        return new MyPromise((resolve, reject) => {
            if (arr.length === 0) {
                //leave it in pending mode
                return;
            }
            arr.forEach((el) => {
                if (el instanceof MyPromise) {
                    el.then((el) => {
                        resolve(el);
                    });
                    el.catch((el) => {
                        reject(el);
                    });
                }
                else {
                    Promise.resolve(el).then((el) => {
                        resolve(el);
                    });
                }
            });
        });
    }
    static allSettled(arr) {
        let promisedArr = [];
        if (!Array.isArray(arr)) {
            throw new Error("Expects an array");
        }
        return new MyPromise((resolve, reject) => {
            if (arr.length === 0) {
                resolve([]);
            }
            arr.forEach((el) => {
                if (el instanceof MyPromise) {
                    el.then((el) => {
                        promisedArr.push(el);
                        if (promisedArr.length === arr.length) {
                            resolve(promisedArr);
                        }
                    });
                    el.catch((err) => {
                        promisedArr.push(err);
                        if (promisedArr.length === arr.length) {
                            resolve(promisedArr);
                        }
                        // console.log(err, "err");
                    });
                }
                else {
                    Promise.resolve(el).then((el) => {
                        promisedArr.push(el);
                    });
                }
            });
        });
    }
}
_MyPromise_callbacks = new WeakMap(), _MyPromise_resolve = new WeakMap(), _MyPromise_reject = new WeakMap(), _MyPromise_settled = new WeakMap();
const test = Promise.allSettled([Promise.reject(1), Promise.reject(2)]);
console.log(test);
const see = MyPromise.all([
    MyPromise.resolve(30),
    MyPromise.reject(10),
    MyPromise.reject(20),
    MyPromise.resolve(88),
    MyPromise.reject(66),
    MyPromise.resolve(100),
]);
console.log(see, "see");
