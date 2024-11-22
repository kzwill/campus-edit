import axios from 'axios';

//设置请求超时的时间
axios.defaults.timeout = 10 * 1000;
//设置访问的域名前缀
axios.defaults.baseURL = '';
// 请求接口及耗时统计
// const apiLog = useStorage('api-log-storage', {})
const apiLog = null

//http request 拦截器
axios.interceptors.request.use(
  config => {
    // const token = getCookie('名称');
    config.data = JSON.stringify(config.data);
    //设置请求头
    config.headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    // if(token){
    //   config.params = {'token':token}
    // }
    return config;
  },
  error => {
    return Promise.reject(err);
  }
);

//http response 拦截器
axios.interceptors.response.use(
  response => {
    if (response.data.errCode == 2) {

    }
    return response;
  },
  error => {
    return Promise.reject(error)
  }
);

/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */
export function get(url, params = {}, name = '') {
  const start = performance.now();
  const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss')
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(response => {
        if (apiLog) {
          const end = performance.now();
          apiLog.value[`${name} [${url}]`] = `[${formatted.value}] 用时: ${end - start} ms`;
        }
        resolve(response.data);
      })
      .catch(err => {
        if (apiLog) {
          apiLog.value[`${name} [${url}]`] = `[${formatted.value}] 错误: ${err.message}`;
        }
        console.error(err);
        reject(err)
      })
  })
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function post(url, data = {}, name = '') {
  const start = performance.now(); // 记录请求开始时间
  const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss'); // 格式化当前时间

  return new Promise((resolve, reject) => {
    axios.post(url, data)
      .then(response => {
        if (apiLog) { // 如果开启日志记录
          const end = performance.now(); // 记录结束时间
          apiLog.value[`${name} [${url}]`] = `[${formatted.value}] 用时: ${end - start} ms`;
        }
        resolve(response.data); // 返回响应数据
      })
      .catch(err => {
        if (apiLog) { // 如果开启日志记录
          apiLog.value[`${name} [${url}]`] = `[${formatted.value}] 错误: ${err.message}`;
        }
        console.error(err); // 输出错误日志
        reject(err); // 抛出错误
      });
  });
}
