export const WORKER_UPDATE = "@WORKER@-UPDATE";
const REDUCER_PREFIX = `
let store = {};
addEventListener("message", e => {
  actionEngine(e.data);
});

const actionEngine = ({ type, payload }) => {
  if (type === "@INIT@") {
    store = payload;
  } else {
    store = reducer(store, { type, payload });
  }
  postMessage(store);
};

const reducer = 
`;

export const createWorker = (code, initialState) => {
  const _worker = new Worker(
    URL.createObjectURL(
      new Blob([`${REDUCER_PREFIX}${code}`], { type: "text/javascript" })
    )
  );
  _worker.postMessage({ type: "@INIT@", payload: initialState });
  return _worker;
};

export const createReduxWorker = (code, initialState) => {
  const worker = createWorker(code, initialState);
  const runActionOnWorker = action =>
    new Promise((resolve, reject) => {
      const responseReceiver = result => {
        worker.removeEventListener("message", responseReceiver);
        const update = result.data;
        resolve(update);
      };
      worker.addEventListener("message", responseReceiver);
      worker.postMessage(action);
    });
  return store => next => action => {
    if (action.thread) {
      runActionOnWorker(action).then(update => {
        store.dispatch({
          type: WORKER_UPDATE,
          payload: {
            initiator: action,
            update
          }
        });
      });
    }
    next(action);
  };
};

export default createReduxWorker;
