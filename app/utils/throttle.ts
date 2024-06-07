export const throttle = (func: (...args: any[]) => any, delay: number) => {
  let throttling = false;

  return (...args) => {
    if (!throttling) {
      throttling = true;
      func(...args);
      setTimeout(() => {
        throttling = false;
      }, delay);
    }
  };
};
