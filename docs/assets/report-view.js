(function () {
  var brazilTerms = {
    'Olist CSV Column Relationships': 'Olist CSV 字段关系',
    'Olist Marketplace GMV and Order Scale': 'Olist 平台商品交易额与订单规模',
    'Monthly GMV and Delivered Orders Growth Trend': '月度商品交易额与已交付订单增长趋势',
    'Order Outcomes and Non-Delivered Status Breakdown': '订单结果与未交付状态分布',
    'Payment Behavior and Consumer Spending': '支付方式与消费者支出',
    'Review Score Distribution | Average Score: 4.09': '评价分数分布｜平均分：4.09',
    'Olist Delivered-Item GMV Share by Category': 'Olist 已交付商品交易额的品类占比',
    'Monthly Olist Delivered-Item GMV: Five Leading Categories': 'Olist 月度已交付商品交易额：前五品类',
    'Olist GMV Pareto: 23.3% of Named Categories Reach 80% of Classified GMV': 'Olist 商品交易额帕累托：23.3% 的已命名品类贡献分类交易额的 80%',
    'Category Pricing and Freight Burden': '品类定价与运费负担',
    'Product Portfolio Breadth and Seller Competition': '商品组合广度与卖家竞争',
    'Delivered-Order GMV by Customer State': '各客户州的已交付订单商品交易额',
    'Regional Demand and Logistics Coverage': '地区需求与物流覆盖',
    'Concentration of Sellers Serving Each Customer State': '各客户州卖家集中度',
    'Customer-State Review Scores | Olist Delivered Mean 4.16, 1 SD 0.116': '各客户州评价分数｜已交付订单均值 4.16，标准差 0.116',
    'Delivery Time and Review Outcomes': '配送时长与评价结果',
    'Delivered-Order Reach by Purchase Threshold': '不同购买门槛下的已交付订单客户覆盖',
    'Customer Value Quadrant: Spending vs Repeat Purchase': '客户价值四象限：支出与复购',
    '2017 First-Purchase Cohorts: Monthly Delivered-Order Repeat Rate': '2017 年首购队列：月度已交付订单复购率',
    'RFM Segment Quadrant: Recency vs Purchase Frequency': 'RFM 客群四象限：最近购买时间与购买频次',
    'Customer Value Tier Composition and Share Ratio': '客户价值层级构成与份额比',
    'Three-Month Historical Forecast from August 2018': '以 2018 年 8 月为起点的三个月历史回测',
    'GMV (R$ millions)': '商品交易额（百万雷亚尔）', 'GMV (R$)': '商品交易额（雷亚尔）',
    'Delivered-Item GMV (R$)': '已交付商品交易额（雷亚尔）', 'Item-Price GMV (R$)': '商品金额（雷亚尔）',
    'Total Payment Value (R$)': '支付总额（雷亚尔）', 'Median Item Price (R$)': '商品价格中位数（雷亚尔）',
    'Average Delivered-Order Spend per Consumer (R$)': '每位消费者平均已交付订单支出（雷亚尔）',
    'Orders': '订单数', 'Delivered Orders': '已交付订单数', 'Reviewed Orders': '有评价的订单数',
    'Customer State': '客户所在州', 'Active Sellers Serving State': '服务该州的活跃卖家数',
    'Customer Value Tier': '客户价值层级', 'Product Category': '商品品类', 'Payment Method': '支付方式',
    'Month': '月份', 'Purchase Month': '购买月份', 'First-Purchase Cohort': '首次购买队列',
    'Calendar Months After First Purchase': '首购后的日历月数', 'Repeat Purchase Rate': '复购率',
    'Average Delivered Orders per Consumer': '每位消费者平均已交付订单数',
    'Average Days Since Last Purchase (lower is more recent)': '距上次购买的平均天数（越低越近）',
    'Purchase-to-Delivery Days': '下单至交付天数', 'Mean Review Score (1-5)': '平均评价分数（1—5）',
    'Review Score': '评价分数', 'Seller HHI (0-1)': '卖家集中度 HHI（0—1）',
    'Cumulative Classified GMV Share': '已分类商品交易额累计占比', 'Share of Total': '总体占比',
    'Freight-to-Price Ratio': '运费 / 商品价格', 'Spend Share / Customer Share (×)': '支出占比 / 客户占比（倍）',
    'Unique Products': '不同商品数', 'Unique Sellers (log scale)': '不同卖家数（对数刻度）',
    'log10(Consumers + 1)': 'log10（消费者数 + 1）',
    'Health Beauty': '健康美容', 'Bed Bath Table': '家居床浴', 'Computers Accessories': '电脑配件',
    'Sports Leisure': '运动休闲', 'Watches Gifts': '手表礼品',
    'Category GMV': '品类商品交易额', 'GMV': '商品交易额',
    'Cumulative Classified GMV Share': '分类交易额累计占比',
    'Customer Share': '客户占比', 'Spend Share': '支出占比',
    'Spend Share / Customer Share': '支出占比 / 客户占比',
    'Daily mean review': '每日平均评价', '95% Mean CI': '均值的 95% 置信区间',
    'GMV Regression Trend': '商品交易额回归趋势', 'Delivered Orders Regression Trend': '已交付订单回归趋势',
    'Forecast Delivered Orders': '预测已交付订单数', 'Forecast Gmv': '预测商品交易额',
    'Observed Delivered Orders': '实际已交付订单数', 'Observed Gmv': '实际商品交易额',
    'Champions': '核心客户', 'Loyal Customers': '忠诚客户', 'At-Risk Repeat Buyers': '有流失风险的复购客户',
    'Promising One-Time Buyers': '有潜力的一次购买客户', 'Other One-Time Buyers': '其他一次购买客户',
    'High Value': '高价值', 'Mid Value': '中价值', 'Low Value': '低价值', 'Premium': '高端',
    'Entity key': '实体键', 'Order key': '订单键', 'Category key': '品类键', 'Postal prefix': '邮编前缀',
    'Dataset': '数据集', 'Total Rows': '总行数', 'Columns': '列数', 'Nulls': '缺失值',
    'Delivered': '已交付', 'Cancelled': '已取消', 'Unavailable': '不可用', 'Invoiced': '已开票',
    'Shipped': '已发货', 'Processing': '处理中', 'Approved': '已批准', 'Created': '已创建'
  };
  function localizeFigure(figure) {
    var copy = JSON.parse(JSON.stringify(figure));
    function translate(value) { return typeof value === 'string' ? (brazilTerms[value] || value) : value; }
    function title(node) { if (node && typeof node.text === 'string') node.text = translate(node.text); }
    var layout = copy.layout || {};
    title(layout.title);
    Object.keys(layout).forEach(function (key) {
      if (/^[xy]axis\d*$/.test(key)) title(layout[key].title);
    });
    (layout.annotations || []).forEach(function (item) { item.text = translate(item.text); });
    (copy.data || []).forEach(function (trace) {
      trace.name = translate(trace.name);
      ['labels', 'text'].forEach(function (key) {
        if (Array.isArray(trace[key])) trace[key] = trace[key].map(translate);
        else trace[key] = translate(trace[key]);
      });
      if (trace.marker && trace.marker.colorbar) title(trace.marker.colorbar.title);
    });
    return copy;
  }
  function localizeTables(panel) {
    if (!panel) return;
    panel.querySelectorAll('.output-table th, .output-table td').forEach(function (cell) {
      if (cell.children.length) return;
      var original = cell.textContent.trim();
      if (brazilTerms[original]) cell.textContent = brazilTerms[original];
    });
  }
  function resizeCharts(root) {
    if (!window.Plotly) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.querySelectorAll('.plotly-graph-div').forEach(function (graph) {
          if (!graph._fullLayout) return;
          if (document.body.classList.contains('view-charts')) {
            window.Plotly.relayout(graph, { height: 370 });
          }
          window.Plotly.Plots.resize(graph);
        });
      });
    });
  }

  function init() {
    var full = document.getElementById('full-panel');
    var charts = document.getElementById('charts-panel');
    var grid = document.getElementById('charts-grid');
    var translated = document.getElementById('zh-panel');
    var feelings = document.getElementById('feelings-panel');
    if (!full || !charts || !grid) return;
    var cards = Array.from(full.querySelectorAll('.chart-output'));
    var locations = new Map();
    var figures = new Map();
    cards.forEach(function (card) {
      var marker = document.createComment('Original chart location: ' + card.id);
      card.before(marker);
      locations.set(card.id, marker);
      var title = card.getAttribute('data-chart-title') || '图表';
      card.setAttribute('aria-label', title);
    });

    function renderPlotlyData() {
      cards.forEach(function (card) {
        var script = card.querySelector('script[type="application/json"]');
        var graph = card.querySelector('.plotly-graph-div');
        if (!script || !graph || !window.Plotly) return;
        try {
          var figure = JSON.parse(script.textContent);
          figures.set(card.id, figure);
          var layout = Object.assign({}, figure.layout || {});
          delete layout.width;
          layout.autosize = true;
          window.Plotly.newPlot(graph, figure.data || [], layout, { responsive: true, displaylogo: false });
        } catch (error) {
          graph.textContent = '图表加载失败，请查看原始 Notebook。';
          console.error('Plotly render failed', card.id, error);
        }
      });
    }

    function setMode(mode) {
      if (mode === 'zh' && !translated) mode = 'full';
      if (!['charts', 'full', 'zh', 'feelings'].includes(mode)) mode = 'charts';
      document.querySelectorAll('.view-switch button').forEach(function (button) {
        var selected = button.dataset.view === mode;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      full.hidden = mode !== 'full';
      charts.hidden = mode !== 'charts';
      if (translated) translated.hidden = mode !== 'zh';
      if (feelings) feelings.hidden = mode !== 'feelings';
      document.body.classList.toggle('view-charts', mode === 'charts');
      document.body.classList.toggle('view-zh', mode === 'zh');
      document.documentElement.lang = mode === 'zh' ? 'zh-CN' : (translated ? 'en' : 'zh-CN');
      cards.forEach(function (card) {
        if (mode === 'charts') grid.appendChild(card);
        else if (mode === 'zh') {
          var slot = translated.querySelector('[data-chart-slot="' + card.id + '"]');
          if (slot) slot.appendChild(card);
        } else {
          locations.get(card.id).after(card);
        }
      });
      if (translated) {
        cards.forEach(function (card) {
          var figure = figures.get(card.id);
          var graph = card.querySelector('.plotly-graph-div');
          if (!figure || !graph || !window.Plotly) return;
          var shown = mode === 'zh' ? localizeFigure(figure) : figure;
          var layout = Object.assign({}, shown.layout || {});
          delete layout.width;
          layout.autosize = true;
          window.Plotly.react(graph, shown.data || [], layout, { responsive: true, displaylogo: false });
        });
      }
      var url = new URL(location.href);
      if (mode === 'charts') url.searchParams.delete('view');
      else url.searchParams.set('view', mode);
      history.replaceState(null, '', url);
      resizeCharts(document.querySelector('main'));
    }

    document.querySelectorAll('.view-switch button').forEach(function (button) {
      button.addEventListener('click', function () { setMode(button.dataset.view); });
      button.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        var buttons = Array.from(document.querySelectorAll('.view-switch button'));
        var step = event.key === 'ArrowRight' ? 1 : -1;
        var next = buttons[(buttons.indexOf(button) + step + buttons.length) % buttons.length];
        next.focus();
        setMode(next.dataset.view);
      });
    });
    renderPlotlyData();
    localizeTables(translated);
    setMode(new URL(location.href).searchParams.get('view') || 'charts');
    window.addEventListener('resize', function () { resizeCharts(document.querySelector('main')); });
    if (window.hljs) document.querySelectorAll('pre code.language-python').forEach(function (code) { window.hljs.highlightElement(code); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
