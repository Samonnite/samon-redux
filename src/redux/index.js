
/**
 * @param {reducer}
 * @return store
 */
function createStore(reducer, enhancer) {
    // 先处理enhancer
    // 如果enhancer存在并且是函数
    // 我们将createStore作为参数传给他
    // 他应该返回一个新的createStore给我
    // 我在拿这个createStore执行，得到一个store并返回
    let state; // state记录所有状态
    let listeners = []; // 保存所有注册的回调

    if (enhancer && typeof enhanced === 'function') {
        const newCreateStore = enhancer(createStore);
        const newStore = newCreateStore(reducer);
        return newStore;
    }

    function subscribe(callback) {
        listeners.push(callback); // 保存所有回调
    }

    // 将所有的回调拿出来依次执行
    function dispatch(action) {
        // reducer的作用是在发布事件的时候改变state
        state = reducer(state, action)
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            listener();
        }
    }

    function getState() {
        return state;
    }

    // 用store包装前面的方法
    const store = {
        subscribe,
        dispatch,
        getState,
    }

    return store;
};


function combineReducers() { };

function compose(...funcs) {
    return funcs.reduce((a, b) => (...args) => a(b(...args)))

};

function applyMiddleware(middlewares) {
    function enhancer(createStore) {
        function newCreateStore(reducer) {
            const store = createStore(reducer);

            // 多个middleware，先解构出dispatch => newDispatch的结构
            const chain = middlewares.map(middleware => middleware(store));
            // 解构出原始的dispatch
            const { dispatch } = store;

            // 用compose得到一个组合了所newDispatch的函数
            const newDispatchGen = compose(...chain);

            const newDispatch = newDispatchGen(dispatch);

            return { ...store, dispatch: newDispatch }
        }

        return newCreateStore;
    }
    return enhancer;
};

export { createStore, combineReducers, applyMiddleware, compose };