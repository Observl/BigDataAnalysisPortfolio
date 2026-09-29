"""Create small Power BI import tables from the project workbooks.

The original Excel files are never modified. Outputs are written to powerbi/data.
Run: python powerbi/export_powerbi_data.py
"""
from pathlib import Path
import pandas as pd

PROJECT = Path(__file__).resolve().parents[1]
OUTPUT = Path(__file__).resolve().parent
OUTPUT.mkdir(exist_ok=True)

total = pd.read_excel(PROJECT / "source_data" / "中国汽车总体销量.xlsx")
auto = pd.read_excel(PROJECT / "source_data" / "中国汽车每月销售表.xlsx")
ev = pd.read_excel(PROJECT / "source_data" / "中国电动车每月销售表.xlsx")

total["时间"] = pd.to_datetime(total["时间"])
total.to_csv(OUTPUT / "新能源汽车经营分析_整体市场月度销量.csv", index=False, encoding="utf-8-sig")

for data, name in [
    (auto, "新能源汽车经营分析_汽车车型月度销量.csv"),
    (ev, "新能源汽车经营分析_新能源车型月度销量.csv"),
]:
    data = data.copy()
    data["时间"] = pd.to_datetime(dict(year=data["年份"], month=data["月份"], day=1))
    data.to_csv(OUTPUT / name, index=False, encoding="utf-8-sig")

ev["时间"] = pd.to_datetime(dict(year=ev["年份"], month=ev["月份"], day=1))
annual_market = (
    ev.groupby("年份", as_index=False)["销量"].sum()
    .rename(columns={"销量": "新能源汽车车型样本销量"})
)
annual_market.to_csv(OUTPUT / "新能源汽车经营分析_新能源年度市场概览.csv", index=False, encoding="utf-8-sig")

brand_annual = (
    ev.groupby(["年份", "厂商"], as_index=False)["销量"].sum()
    .sort_values(["年份", "销量"], ascending=[True, False])
)
brand_annual["年度厂商样本份额"] = brand_annual["销量"] / brand_annual.groupby("年份")["销量"].transform("sum")
brand_annual.to_csv(OUTPUT / "新能源汽车经营分析_新能源厂商年度表现.csv", index=False, encoding="utf-8-sig")

quality = pd.DataFrame([
    {"表": "总体市场月度销量", "记录数": len(total), "缺失值数": int(total.isna().sum().sum()), "说明": "来源于中国汽车总体销量.xlsx"},
    {"表": "汽车车型月度销量", "记录数": len(auto), "缺失值数": int(auto.isna().sum().sum()), "说明": "车型销量为样本口径，不能替代全市场总销量"},
    {"表": "新能源汽车车型月度销量", "记录数": len(ev), "缺失值数": int(ev.isna().sum().sum()), "说明": "车型销量为样本口径，不能替代全市场总销量"},
])
quality.to_csv(OUTPUT / "新能源汽车经营分析_数据质量摘要.csv", index=False, encoding="utf-8-sig")
print(f"Exported Power BI tables to {OUTPUT}")
