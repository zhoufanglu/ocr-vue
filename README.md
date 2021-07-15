# vue-temp-2021-3-8

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### 全局样式入口
`src/assets/scss/entrance.scss`

### 路由
1、进行的模块划分 

2、权限设置   

```javascript
meta: {
      requireAuth: false // 在需要登录的路由的meta中添加响应的权限标识
    }
```

## element
1、配置文件`src/config/element.js` 

2、主题色`src/assets/scss/element/element-variables.scss` 


## vuex
1、vuex-persistedstate 刷新后不丢失插件 

2、模块划分


## 接口请求
1、目录 `src/request` 

2、src/request/http.js -- axios 配置文件 

3、src/request/api/module -- 接口模块 分类 

4、src/request/api/base -- 请求ip配置 

5、src/request/api/index.js -- 请求模块入口 

## 环境
1、analyzer          - 打包分析环境  
2、development       - 开发环境  
3、production        - 生产环境  
4、test              - 测试环境  



