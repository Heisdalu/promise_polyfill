const func = (res, rej) => {
  setTimeout(() => {
    res("error");
  }, 1000);
};

let count = 0;
// console.log(test);

class MyPromise {
  state: "pending" | "fulfilled" | "rejected";
  result: null | any;
  #callbacks: any[];
  constructor(func: any) {
    this.state = "pending";
    this.result = null;
    this.#callbacks = [];

    try {
      func(this.#resolve.bind(this), this.#reject.bind(this));
    } catch (err) {
      // console.log(err, "gggg");
      this.#reject(err);
    }
  }

  #resolve = (value: any) => {
    if (this.state !== "pending") return;
    this.state = "fulfilled";
    this.result = value;
    this.#settled("onFulfilled");
  };

  #reject = (value: any) => {
    if (this.state !== "pending") return;
    this.state = "rejected";
    this.result = value;
    // console.log(this);
    this.#settled("onRejected");
  };

  #settled = (state: any) => {
    queueMicrotask(() => {
      for (const exec of this.#callbacks) {
        try {
          const result = exec[state](this.result);
          exec.resolve(result);
        } catch (err) {
          exec.reject(err);
        }
      }
    });
  };

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this.#callbacks.push({
        name: ++count,
        onFulfilled: onFulfilled ?? ((value: any) => value),
        onRejected:
          onRejected ??
          ((err: any) => {
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

  finally(onFunc: any) {
    return this.then(onFunc, onFunc);
  }

  static resolve(value: any) {
    return new MyPromise((res: any) => res(value));
  }
  static reject(value: any) {
    return new MyPromise((_, rej: any) => rej(value));
  }

  static all(arr: any[]) {
    let promiseArr = [];

    if (!Array.isArray(arr)) {
      throw new Error("expect an array");
    }

    return new MyPromise((resolve, reject) => {
      if (arr.length === 0) {
        resolve([]);
      }

      arr.forEach((el) => {
        if (!(el instanceof MyPromise)) {
          Promise.resolve(el).then((el) => {
            promiseArr.push(el);
          });
        } else {
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

  static any(arr: any[]) {
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
          el.then((el: any) => {
            resolve(el);
          }).catch((err: any) => {
            faileddArr.push(err);
            if (faileddArr.length === arr.length) {
              // const msg = new AggregateError("");
              reject("AggregateError: All promises were failed");
            }
          });
        } else {
          //for numberws,string
          Promise.resolve(el).then((el) => {
            resolve(el);
          });
        }
      });
    });
  }

  static race(arr: any[]) {
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
        } else {
          Promise.resolve(el).then((el) => {
            resolve(el);
          });
        }
      });
    });
  }
  static allSettled(arr: any[]) {
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
        } else {
          Promise.resolve(el).then((el) => {
            promisedArr.push(el);
          });
        }
      });
    });
  }
}

// const test = Promise.allSettled([Promise.reject(1), Promise.reject(2)]);
// console.log(test);

// const see = MyPromise.all([
//   MyPromise.resolve(30),
//   MyPromise.reject(10),
//   MyPromise.reject(20),
//   MyPromise.resolve(88),
//   MyPromise.reject(66),
//   MyPromise.resolve(100),
// ]);

// console.log(see, "see");
