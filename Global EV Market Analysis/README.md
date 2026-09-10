# EV Market Demand Forecast Dataset (Sales + Trends + Infrastructure)

## Overview
A comprehensive monthly dataset covering global electric vehicle (EV) market dynamics,
combining sales data, consumer interest signals, charging infrastructure, and fuel prices.
Designed for demand forecasting, market analysis, and time-series modeling.

## Dataset Statistics
- Rows: 420
- Countries: 8 (China, France, Germany, India, Netherlands, Norway, USA, United Kingdom)
- Period: 2019-01 to 2023-12
- Brands: All, BYD, Tesla, VW

## Files
| File | Description |
|------|-------------|
| ev_market_master.csv | Full merged dataset (primary file) |
| ev_sales_brands.csv | Brand-level sales (BYD, Tesla, VW) |
| ev_trends_monthly.csv | Google Trends scores per keyword |
| ev_charging_monthly.csv | Charging infrastructure by country |
| fuel_prices_monthly.csv | Gasoline prices USD/liter |

## Columns

### Core identifiers
- `country` — Country name
- `brand` — EV brand (BYD, Tesla, VW, All)
- `year`, `month`, `quarter`, `date_str` — Time dimensions

### Sales
- `units_sold` — Monthly EV units sold (estimated from quarterly where monthly unavailable)
- `drivetrain_type` — BEV, PHEV, or BEV+PHEV combined
- `frequency` — Data granularity (monthly / monthly_est / annual_interpolated)

### Google Trends (0–100 scale, relative search interest)
- `trend_electric_car` — Search interest: "electric car"
- `trend_byd` — Search interest: "BYD"
- `trend_tesla` — Search interest: "Tesla"
- `trend_ev_charging` — Search interest: "EV charging"
- `trend_electric_vehicle` — Search interest: "electric vehicle"

### Infrastructure
- `slow_chargers_cumulative` — Level 2 public chargers (year-end, interpolated monthly)
- `fast_chargers_cumulative` — DC fast chargers (year-end, interpolated monthly)
- `total_chargers_cumulative` — Combined

### Fuel prices
- `gasoline_price_usd_per_liter` — Monthly average gasoline price in USD/liter

### Engineered features (for ML/forecasting)
- `units_sold_lag1`, `lag3`, `lag12` — Lagged sales
- `units_sold_rolling3` — 3-month rolling average
- `units_sold_yoy_growth` — Year-over-year growth rate

## Sources
- IEA Global EV Outlook 2024 (https://www.iea.org/reports/global-ev-outlook-2024)
- Google Trends via pytrends
- BYD Co. Ltd monthly sales press releases
- Tesla IR quarterly reports
- AFDC (US DOE Alternative Fuels Station Locator)
- IEA Charging Infrastructure data
- GlobalPetrolPrices.com / IEA Energy Prices

## Use Cases
- EV demand forecasting (ARIMA, XGBoost, LSTM)
- Market penetration analysis
- Correlation: fuel price vs EV adoption
- Infrastructure readiness vs sales velocity
- Cross-country comparative analysis (China vs Europe vs USA)

## License
CC BY 4.0 — Attribution required. Cite sources above.
