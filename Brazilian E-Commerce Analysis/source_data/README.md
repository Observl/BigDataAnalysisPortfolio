# 数据说明

| 文件 | 粒度 | 主键/连接键 | 用途 |
|---|---|---|---|
| `olist_orders_dataset.csv` | 订单 | `order_id`、`customer_id` | 订单状态与时间线 |
| `olist_order_items_dataset.csv` | 订单商品行 | `order_id`、`product_id`、`seller_id` | 商品金额、运费与卖家 |
| `olist_order_payments_dataset.csv` | 支付记录 | `order_id` | 支付方式与支付金额 |
| `olist_order_reviews_dataset.csv` | 订单评价 | `order_id` | 评价与体验 |
| `olist_customers_dataset.csv` | 客户订单映射 | `customer_id`、`customer_unique_id` | 去重客户与地区 |
| `olist_products_dataset.csv` | 商品 | `product_id` | 品类与商品属性 |
| `olist_sellers_dataset.csv` | 卖家 | `seller_id` | 卖家地区与结构 |

运行前保留 `source_data/archive/` 原始文件。所有派生表写入 `outputs/`，不覆盖源数据。
