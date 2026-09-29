import json
from pathlib import Path

import numpy as np
import pandas as pd


PROJECT = Path(__file__).resolve().parents[1]
SOURCE = PROJECT / "source_data"

total = pd.read_excel(SOURCE / "中国汽车总体销量.xlsx")
auto = pd.read_excel(SOURCE / "中国汽车每月销售表.xlsx")
ev = pd.read_excel(SOURCE / "中国电动车每月销售表.xlsx")

print("TOTAL_COLUMNS", total.columns.tolist(), total.shape)
print("AUTO_COLUMNS", auto.columns.tolist(), auto.shape)
print("EV_COLUMNS", ev.columns.tolist(), ev.shape)
print("TOTAL_HEAD", total.head().to_dict("records"))
print("AUTO_HEAD", auto.head().to_dict("records"))
print("EV_HEAD", ev.head().to_dict("records"))

total["year"] = total["时间"].dt.year
total["month"] = total["时间"].dt.month

common = (
    total[["year", "month"]]
    .drop_duplicates()
    .merge(ev[["年份", "月份"]].drop_duplicates(), left_on=["year", "month"], right_on=["年份", "月份"])
    [["year", "month"]]
)

v = total.merge(common, on=["year", "month"])
e = ev.merge(common, left_on=["年份", "月份"], right_on=["year", "month"])

v_year = v.groupby("year", as_index=False)["销量"].sum().rename(columns={"销量": "整体汽车销量"})
e_year = e.groupby("year", as_index=False)["销量"].sum().rename(columns={"销量": "新能源汽车销量"})
annual = v_year.merge(e_year, on="year").sort_values("year")
annual["months"] = annual["year"].map(common.groupby("year")["month"].nunique())
annual["factor"] = 12 / annual["months"]
annual["整体汽车销量"] *= annual["factor"]
annual["新能源汽车销量"] *= annual["factor"]
annual["新能源渗透率"] = annual["新能源汽车销量"] / annual["整体汽车销量"]
annual["EV同比"] = annual["新能源汽车销量"].pct_change()
annual["整体同比"] = annual["整体汽车销量"].pct_change()

brand = e.groupby(["year", "厂商"], as_index=False)["销量"].sum()
brand["factor"] = brand["year"].map(annual.set_index("year")["factor"])
brand["销量"] *= brand["factor"]
brand["份额"] = brand["销量"] / brand.groupby("year")["销量"].transform("sum")
brand["排名"] = brand.groupby("year")["销量"].rank(method="dense", ascending=False).astype(int)

models = e.groupby(["year", "厂商", "车型"], as_index=False)["销量"].sum()
models["factor"] = models["year"].map(annual.set_index("year")["factor"])
models["销量"] *= models["factor"]

maker = pd.DataFrame({
    "year": sorted(set(auto["年份"]).intersection(ev["年份"])),
})
maker["整体厂商数"] = maker["year"].map(auto.groupby("年份")["厂商"].nunique())
maker["新能源厂商数"] = maker["year"].map(ev.groupby("年份")["厂商"].nunique())
maker["占比"] = maker["新能源厂商数"] / maker["整体厂商数"]

price = e.copy()
parts = price["售价（万元）"].astype(str).str.extract(r"([0-9.]+)\s*-\s*([0-9.]+)").astype(float)
price["最低价"] = parts[0]
price["最高价"] = parts[1]
price = price[(price["最低价"] > 0) & (price["最高价"] > 0)]
price["low_w"] = price["最低价"] * price["销量"]
price["high_w"] = price["最高价"] * price["销量"]
price_year = price.groupby("year", as_index=False).agg(sales=("销量", "sum"), low_w=("low_w", "sum"), high_w=("high_w", "sum"))
price_year["加权最低价"] = price_year["low_w"] / price_year["sales"]
price_year["加权最高价"] = price_year["high_w"] / price_year["sales"]

latest = int(annual["year"].max())
latest_brand = brand.query("year == @latest").sort_values("销量", ascending=False)
latest_models = models.query("year == @latest").sort_values("销量", ascending=False)
tesla = brand.query("厂商 == '特斯拉中国'").sort_values("year")
tesla_models = models.query("year == @latest and 厂商 == '特斯拉中国'").sort_values("销量", ascending=False)

print("ANNUAL", annual.round(6).to_dict("records"))
print("MAKER", maker.round(6).to_dict("records"))
print("TOP_BRANDS", latest_brand.head(10).round(6).to_dict("records"))
print("CR", {n: round(latest_brand.head(n)["份额"].sum(), 6) for n in (3, 5, 10)})
print("TOP_MODELS", latest_models.head(10).round(6).to_dict("records"))
print("PRICE", price_year.round(4).to_dict("records"))
print("TESLA", tesla.round(6).to_dict("records"))
print("TESLA_MODELS", tesla_models.round(6).to_dict("records"))

months_2023 = sorted(common.query("year == 2023")["month"].unique())
current = ev.query("年份 == 2023 and 月份 in @months_2023").groupby("厂商", as_index=False)["销量"].sum().rename(columns={"销量": "当期销量"})
previous = ev.query("年份 == 2022 and 月份 in @months_2023").groupby("厂商", as_index=False)["销量"].sum().rename(columns={"销量": "上年同期销量"})
quad = current.merge(previous, on="厂商", how="left")
quad["份额"] = quad["当期销量"] / quad["当期销量"].sum()
quad["增长率"] = quad["当期销量"] / quad["上年同期销量"] - 1
quad["新增"] = quad["上年同期销量"].isna() | quad["上年同期销量"].eq(0)
growth_cut = current["当期销量"].sum() / previous["上年同期销量"].sum() - 1
share_cut = 1 / len(current)
high_g = quad["新增"] | quad["增长率"].ge(growth_cut)
high_s = quad["份额"].ge(share_cut)
quad["分类"] = np.select([high_g & high_s, high_g & ~high_s, ~high_g & high_s], ["明星企业", "新兴企业", "老牌企业"], default="尾部企业")
print("QUAD_CUT", {"growth": round(growth_cut, 6), "share": round(share_cut, 6)})
print("QUAD_TOP", {c: quad.query("分类 == @c").nlargest(5, "份额")[["厂商", "份额", "增长率"]].round(6).to_dict("records") for c in ["明星企业", "新兴企业", "老牌企业", "尾部企业"]})
print("TESLA_QUAD", quad.query("厂商 == '特斯拉中国'")[["厂商", "当期销量", "上年同期销量", "份额", "增长率", "分类"]].round(6).to_dict("records"))
print("TESLA_PRICES", ev.query("年份 == 2023 and 厂商 == '特斯拉中国'")[["车型", "售价（万元）"]].drop_duplicates().to_dict("records"))
