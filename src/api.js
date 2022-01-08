import axios from 'axios';
const currentUrl = new URL(window.location.href);

const api = axios.create();
api.defaults.baseURL = `${currentUrl.protocol}//${currentUrl.hostname}`;
api.defaults.baseURL = "https://uat.globalimpact.world"



api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token){
        config.headers.authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  })

  failedQueue = [];
}

api.interceptors.response.use(
    (config) => {
      const newToken = config.headers['x-jwt'] || '';
      if (newToken !== '') {
        localStorage.setItem('token', newToken);
      }
      return config;
    },
    (error) => {
      const originalRequest = error.config;
      let refreshToken = localStorage.getItem("refreshtoken");
      if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry && refreshToken !== null) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          })
        }
        originalRequest._retry = true
        isRefreshing = true;
        return axios
        .post(`${api.defaults.baseURL}/api/users/newToken`, { refreshToken: refreshToken })
        .then((res) => {
          if (res.status === 200) {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("refreshtoken", res.data.refreshtoken);
            processQueue(null, res.data.token);
            isRefreshing = false;
            return axios(originalRequest);
          } else {
          }
        });
      } else if (error.response.status === 401 && currentUrl.pathname !== "/organisation-sign-up") {
      }
      return Promise.reject(error);
    });

export default api;
