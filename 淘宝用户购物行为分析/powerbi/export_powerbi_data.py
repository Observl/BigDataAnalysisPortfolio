"""Export compact, dashboard-ready tables from the existing DuckDB analysis database.

The source database is read-only. This script only writes CSV files to powerbi/data.
Run: python powerbi/export_powerbi_data.py
"""
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
import duckdb  # noqa: E402

OUTPUT = Path(__file__).resolve().parent
OUTPUT.mkdir(exist_ok=True)
db_path = PROJECT / "UserBehavior.db"

queries = {
    "淘宝用户购物行为分析_核心指标.csv": """
        SELECT
            COUNT(DISTINCT user_id) AS 总用户数,
            COUNT(*) FILTER (WHERE act = 'pv') AS 总浏览次数,
            COUNT(*) FILTER (WHERE act = 'fav') AS 总收藏次数,
            COUNT(*) FILTER (WHERE act = 'cart') AS 总购物车次数,
            COUNT(*) FILTER (WHERE act IN ('fav', 'cart')) AS 总喜爱次数,
            COUNT(*) FILTER (WHERE act = 'buy') AS 总购买次数,
            COUNT(*) FILTER (WHERE act = 'buy')
              - COUNT(DISTINCT (user_id, good_id)) FILTER (WHERE act = 'buy') AS 总复购次数,
            ROUND(COUNT(*) FILTER (WHERE act = 'fav') * 100.0 /
                  NULLIF(COUNT(*) FILTER (WHERE act = 'pv'), 0), 2) AS 浏览转收藏比,
            ROUND(COUNT(*) FILTER (WHERE act = 'cart') * 100.0 /
                  NULLIF(COUNT(*) FILTER (WHERE act = 'pv'), 0), 2) AS 浏览转购物车比,
            ROUND(COUNT(*) FILTER (WHERE act = 'buy') * 100.0 /
                  NULLIF(COUNT(*) FILTER (WHERE act = 'fav'), 0), 2) AS 收藏转购买比,
            ROUND(COUNT(*) FILTER (WHERE act = 'buy') * 100.0 /
                  NULLIF(COUNT(*) FILTER (WHERE act = 'cart'), 0), 2) AS 购物车转购买比,
            ROUND(COUNT(*) FILTER (WHERE act = 'buy') * 100.0 /
                  NULLIF(COUNT(*) FILTER (WHERE act = 'pv'), 0), 2) AS 浏览转购买比
        FROM Cleaned
    """,
    "淘宝用户购物行为分析_每日行为趋势.csv": """
        SELECT
            CAST(to_timestamp(ts) AT TIME ZONE 'Asia/Shanghai' AS DATE) AS 日期,
            COUNT(*) FILTER (WHERE act = 'pv') AS 浏览次数,
            COUNT(*) FILTER (WHERE act = 'fav') AS 收藏次数,
            COUNT(*) FILTER (WHERE act = 'cart') AS 加购次数,
            COUNT(*) FILTER (WHERE act = 'buy') AS 购买次数,
            ROUND(COUNT(*) FILTER (WHERE act = 'buy') * 100.0 /
                  NULLIF(COUNT(*) FILTER (WHERE act = 'pv'), 0), 2) AS 浏览与购买行为次数比
        FROM Cleaned
        GROUP BY 1
        ORDER BY 1
    """,
    "淘宝用户购物行为分析_小时行为趋势.csv": """
        SELECT
            EXTRACT(HOUR FROM to_timestamp(ts) AT TIME ZONE 'Asia/Shanghai') AS 小时,
            COUNT(*) FILTER (WHERE act = 'pv') AS 浏览次数,
            COUNT(*) FILTER (WHERE act = 'fav') AS 收藏次数,
            COUNT(*) FILTER (WHERE act = 'cart') AS 加购次数,
            COUNT(*) FILTER (WHERE act = 'buy') AS 购买次数,
            ROUND(COUNT(*) FILTER (WHERE act = 'buy') * 100.0 /
                  NULLIF(COUNT(*) FILTER (WHERE act = 'pv'), 0), 2) AS 浏览与购买行为次数比
        FROM Cleaned
        GROUP BY 1
        ORDER BY 1
    """,
    "淘宝用户购物行为分析_类目转化漏斗.csv": """
        WITH category_metrics AS (
            SELECT
                prop_id AS 商品类目id,
                COUNT(DISTINCT user_id) FILTER (WHERE act = 'pv') AS 独立浏览用户数,
                COUNT(DISTINCT user_id) FILTER (WHERE act IN ('fav', 'cart')) AS 独立意向用户数,
                COUNT(DISTINCT user_id) FILTER (WHERE act = 'buy') AS 独立购买用户数
            FROM Cleaned
            GROUP BY 1
        )
        SELECT
            *,
            ROUND(独立意向用户数 * 100.0 / NULLIF(独立浏览用户数, 0), 2) AS 浏览转意向率,
            ROUND(独立购买用户数 * 100.0 / NULLIF(独立浏览用户数, 0), 2) AS 浏览转购买率
        FROM category_metrics
        WHERE 独立浏览用户数 > 5000
        ORDER BY 浏览转购买率 DESC NULLS LAST
    """,
}

with duckdb.connect(str(db_path), read_only=True) as conn:
    for filename, query in queries.items():
        data = conn.execute(query).fetchdf()
        data.to_csv(OUTPUT / filename, index=False, encoding="utf-8-sig")
        print(f"Exported {len(data):,} rows: {filename}")
