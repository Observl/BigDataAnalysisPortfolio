# 大数据分析作品集

面向数据分析实习展示的个人作品集，聚焦大规模行为数据处理、汽车行业经营分析、交互式可视化与业务解释。

## 在线入口

[访问 GitHub Pages 作品集首页](https://observl.github.io/BigDataAnalysisPortfolio/)

## 当前项目

| 项目 | 分析内容 | 技术 | 入口 |
|---|---|---|---|
| 淘宝用户购物行为分析 | 行为结构、日期/星期/小时规律、商品分层与用户分群 | Python、DuckDB、SQL、Plotly、K-Means、Power BI | [在线报告](https://observl.github.io/BigDataAnalysisPortfolio/taobao/) · [项目说明](./淘宝用户购物行为分析/README.md) · [Power BI 说明](./淘宝用户购物行为分析/powerbi/README.md) |
| 新能源汽车经营分析 | 市场趋势、品牌格局、车型结构、价格区间与特斯拉案例 | Python、Pandas、DuckDB、Plotly、Excel、Power BI | [Notebook](./新能源汽车经营分析/新能源汽车经营分析.ipynb) · [项目说明](./新能源汽车经营分析/README.md) · [Power BI 说明](./新能源汽车经营分析/powerbi/README.md) |
| Brazilian E-Commerce Analysis | Olist 订单、商品、支付与评价数据的可复现分析 | Python、Pandas、CSV、Power BI | [项目说明](./Brazilian%20E-Commerce%20Analysis/README.md) · [Power BI 说明](./Brazilian%20E-Commerce%20Analysis/powerbi/README.md) |

## 使用说明

- 各项目的分析口径、数据范围、运行方法和局限性见项目目录内 README。
- 原始 CSV、Excel 与 DuckDB 数据库文件体积较大，不随 Git 仓库提交；请按各项目说明准备本地数据后再运行 Notebook。
- 所有分析结论均基于对应样本与观察窗口，属于描述性或探索性发现，不直接代表长期趋势、经营因果或营收结果。
- Power BI 的 `.pbix` 文件保存在相应项目目录；其数据准备脚本和可复核的页面说明位于每个项目的 `powerbi` 目录。
