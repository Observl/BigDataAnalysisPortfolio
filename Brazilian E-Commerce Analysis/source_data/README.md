# 数据文件与连接关系

将 Olist 原始 CSV 放在本目录，保留原始文件名，不要覆盖源数据。仓库默认不提交这些体积较大的 CSV；本目录的 `brazil_boundary.geojson` 仅用于地区地图展示。

| 文件 | 粒度 | 主要连接键 | 主要用途 |
|---|---|---|---|
| `olist_orders_dataset.csv` | 订单 | `order_id`、`customer_id` | 订单状态与时间线 |
| `olist_order_items_dataset.csv` | 订单商品行 | `order_id`、`product_id`、`seller_id` | 商品金额、运费与卖家 |
| `olist_order_payments_dataset.csv` | 支付记录 | `order_id` | 支付方式与支付金额 |
| `olist_order_reviews_dataset.csv` | 订单评价 | `order_id` | 评价与体验 |
| `olist_customers_dataset.csv` | 客户订单映射 | `customer_id`、`customer_unique_id` | 去重客户与地区 |
| `olist_products_dataset.csv` | 商品 | `product_id` | 品类与商品属性 |
| `olist_sellers_dataset.csv` | 卖家 | `seller_id` | 卖家地区与结构 |
| `olist_geolocation_dataset.csv` | 邮编前缀坐标记录 | `geolocation_zip_code_prefix` | 地理位置辅助匹配 |
| `product_category_name_translation.csv` | 每个葡语品类 | `product_category_name` | 品类英文名称 |

订单与订单商品、支付、评价之间可能是一对多关系，直接拼接会重复放大订单数或金额。应先明确统计粒度并检查键的覆盖率。商品金额 `price` 不含运费 `freight_value`；金额、订单数和去重客户数应分别计算。具体处理步骤和结果以项目根目录的 `Brazil EC.ipynb` 为准。
