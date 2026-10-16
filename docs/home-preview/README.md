# 首页动效预览

此目录保留新版首页的设计预览和动效源码。正式首页 `../index.html` 复用本目录的 `preview.css` 与 `motion.bundle.js`；动效依赖通过 npm 安装到本目录，访客不需要连接外部 CDN。

- GSAP + ScrollTrigger：首屏编排、阅读进度、轻微视差、项目图片揭示、技能区与页尾的分段入场。
- GSAP ScrollToPlugin：只在向下接近指定吸附点时提供短距离阻尼与吸附；向上滚动、触屏和键盘保持原生滚动。
- Anime.js 与 Motion 仍作为本地依赖保留，但当前首页不再混用动画引擎控制同一元素。
- React Bits：已通过官方组件目录安装免费 `FadeContent` 源码至 `react-components/FadeContent.jsx`。React 与 React DOM 也已安装，但现有首页仍是原生 HTML/JS；该 React 组件尚未接入页面，避免未经确认就迁移或替换首页。

React Bits 安装器已在本目录配置。以后要按需添加免费组件，可运行 `npx jsrepo add https://reactbits.dev/r/<组件名称>-JS-CSS --yes`。21st 是需要逐个选择组件的源码目录，官方 CLI 安装要求会员密钥；本地未配置密钥，也没有安装付费组件。

修改 `motion-source.js` 后，在本目录运行 `npm install`、`npm run build`，然后用本地 HTTP 服务打开 `index.html`。依赖版本固定在 `package-lock.json`；不要把 `node_modules/` 上传到 GitHub。

