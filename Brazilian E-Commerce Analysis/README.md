# Brazilian E-Commerce Analysis｜巴西电商分析

## 项目概况

基于 Olist 公开电商数据，分析订单规模、品类与卖家结构、客户复购、支付方式、履约时长和评价。项目以描述性分析与探索性分群为主；观察到的关联不等于因果影响。

[在线报告（默认逐张图表、英文全文、中文翻译、项目感受）](https://observl.github.io/BigDataAnalysisPortfolio/brazil/) · [分析 Notebook](./Brazil%20EC.ipynb)。项目感受档位暂未填写。

## 数据与分析口径

原始 CSV 应放在 `source_data/`，包括订单、订单商品、支付、评价、客户、商品、卖家、地理位置和品类翻译表。具体文件与连接键见 [数据说明](./source_data/README.md)。`source_data/brazil_boundary.geojson` 是地图边界辅助文件，不是 Olist 原始订单表。

分析区分订单、订单商品行与去重客户三个粒度。商品金额（`item-price GMV`）不含运费；支付金额、商品金额和运费不能未经对账直接互换。复购使用 `customer_unique_id` 识别同一消费者；履约与评价分析应注明订单状态、缺失日期及样本筛选。Notebook 中的预测图是历史回测示例，不是未来经营承诺。

## 分析内容

1. 检查数据表结构、缺失值、连接关系和订单状态，明确每张表的统计粒度。
2. 查看已交付订单的月度规模、商品金额、品类集中度与卖家竞争结构。
3. 用首次购买队列、复购率和 RFM 特征探索客户价值差异。
4. 对比地区需求、配送时长、运费负担、支付方式与评价结果。
5. 用有限的历史窗口制作三个月回测，展示预测误差与适用边界。

在线页面直接展示 Notebook 中已保存的图表和分析文字，可用于快速浏览；需要复核计算时应从源 CSV 按顺序运行 Notebook。

## 本地运行

```powershell
pip install -r requirements.txt
jupyter notebook "Brazil EC.ipynb"
```

在项目根目录启动 Notebook，保持 `source_data/` 的原始文件名与 Notebook 读取路径一致。原始 CSV 和本地数据库文件不随仓库提交；不要将网页中已保存的输出误认为当前源数据的实时结果。

## Power BI 与限制

`powerbi/` 保存 [BrazilEC BI.pbix](./powerbi/BrazilEC%20BI.pbix) 和单一聚合数据工作簿；导入方式与页面指标见 [Power BI 说明](./powerbi/README.md)。

数据缺少完整营销曝光、利润成本与退款链路，不能推导营销归因或净利润。复购、交付和评价结论只适用于该公开数据的观察期与筛选口径；地区差异、运费与评分关系均需要更多控制变量才能检验原因。
