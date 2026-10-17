param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    [string[]]$Only = @()
)

$ErrorActionPreference = 'Stop'
$docs = Join-Path $Root 'docs'
$projects = @(
    @{ Slug = 'taobao'; Folder = '淘宝用户购物行为分析'; Notebook = '淘宝用户购物行为分析.ipynb'; Title = '淘宝用户购物行为分析'; Index = '01 / 04'; Deck = '从购物行为出发，观察用户路径与商品偏好。'; Lang = 'zh-CN'; Banner = '../assets/portfolio/taobao-shopping-journey.jpg' },
    @{ Slug = 'nev'; Folder = '新能源汽车经营分析'; Notebook = '新能源汽车经营分析.ipynb'; Title = '新能源汽车经营分析'; Index = '02 / 04'; Deck = '从销量、厂商、车型与价格，理解国内新能源汽车市场。'; Lang = 'zh-CN'; Banner = '../assets/portfolio/nev-china-market-v3.png' },
    @{ Slug = 'brazil'; Folder = 'Brazilian E-Commerce Analysis'; Notebook = 'Brazil EC.ipynb'; Title = 'Brazil E-Commerce Analysis'; Index = '03 / 04'; Deck = 'Orders, customers, products and delivery across the Olist dataset.'; Lang = 'en'; Banner = '../assets/portfolio/brazil-commerce-v2.jpg' },
    @{ Slug = 'clickstream'; Folder = 'Online-Shopping Clickstream Analysis'; Notebook = 'Clickstream 中文分析.ipynb'; Title = '在线购物点击流分析'; Index = '04 / 04'; Deck = '追踪服饰商品浏览路径，比较推荐排序的离线表现。'; Lang = 'zh-CN'; Banner = '../assets/portfolio/clickstream-editorial.webp' }
)

function Html([string]$value) { return [System.Net.WebUtility]::HtmlEncode($value) }
function Markdown([string]$value) { return (ConvertFrom-Markdown -InputObject $value).Html }
function TextOf($value) {
    if ($null -eq $value) { return '' }
    if ($value -is [string]) { return $value }
    return ($value -join '')
}
function SafeJson($value) {
    return (($value | ConvertTo-Json -Depth 100 -Compress) -replace '<', '\u003c' -replace '>', '\u003e' -replace '&', '\u0026')
}
function RenderOutput($output, [int]$cellIndex, [int]$outputIndex, [bool]$translated) {
    $id = "chart-$cellIndex-$outputIndex"
    $data = $output.data
    if ($data -and $data.Contains('application/vnd.plotly.v1+json')) {
        if ($translated) { return "<div class=`"chart-slot`" data-chart-slot=`"$id`"></div>" }
        $figure = $data['application/vnd.plotly.v1+json']
        $title = [string]$figure.layout.title.text -replace '<[^>]+>', ''
        if (-not $title) { $title = "图表 $cellIndex" }
        $json = SafeJson $figure
        return "<section class=`"cell-output chart-output`" id=`"$id`" data-chart-title=`"$(Html $title)`"><div class=`"plotly-graph-div`" id=`"$id-plot`"></div><script type=`"application/json`" id=`"$id-data`">$json</script></section>"
    }
    if ($data -and $data.Contains('text/html')) {
        $html = TextOf $data['text/html']
        # Notebook's first Plotly output can contain a full duplicate Plotly bundle.
        if ($html.Length -gt 1000000 -and $html -match 'PlotlyConfig') { return '' }
        $html = $html -replace '(?is)<script\b[^>]*\bsrc=[^>]*>\s*</script>', ''
        $html = $html -replace '(?is)<script>\s*if \(window\.MathJax.*?</script>', ''
        if ($html -match 'plotly-graph-div') {
            if ($translated) { return "<div class=`"chart-slot`" data-chart-slot=`"$id`"></div>" }
            return "<section class=`"cell-output chart-output`" id=`"$id`" data-chart-title=`"图表 $cellIndex`">$html</section>"
        }
        return "<div class=`"cell-output output-table`">$html</div>"
    }
    if ($data -and $data.Contains('image/png')) {
        if ($translated) { return "<div class=`"chart-slot`" data-chart-slot=`"$id`"></div>" }
        $png = TextOf $data['image/png']
        return "<section class=`"cell-output chart-output`" id=`"$id`" data-chart-title=`"图表 $cellIndex`"><img class=`"output-image`" alt=`"Notebook 图表 $cellIndex`" src=`"data:image/png;base64,$png`"></section>"
    }
    if ($data -and $data.Contains('text/plain')) {
        $plain = TextOf $data['text/plain']
        if ($plain.Length -gt 12000) { $plain = $plain.Substring(0, 12000) + "`n…（长输出已截断，请查看 Notebook）" }
        return "<div class=`"cell-output output-fence`"><span class=`"fence-label`">输出</span><pre>$(Html $plain)</pre></div>"
    }
    if ($output.text) {
        $plain = TextOf $output.text
        if ($plain.Length -gt 12000) { $plain = $plain.Substring(0, 12000) + "`n…（长输出已截断，请查看 Notebook）" }
        return "<div class=`"cell-output output-fence`"><span class=`"fence-label`">输出</span><pre>$(Html $plain)</pre></div>"
    }
    return ''
}

foreach ($project in $projects) {
    if ($Only.Count -gt 0 -and $project.Slug -notin $Only) { continue }
    $notebookPath = Join-Path (Join-Path $Root $project.Folder) $project.Notebook
    $notebook = Get-Content -LiteralPath $notebookPath -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable -DateKind String
    $translations = @{}
    if ($project.Slug -eq 'brazil') {
        $translationText = Get-Content -LiteralPath (Join-Path $docs 'assets/brazil-zh.md') -Raw -Encoding UTF8
        foreach ($match in [regex]::Matches($translationText, '(?ms)^<!-- cell:(\d+) -->\s*\r?\n(.*?)(?=^<!-- cell:\d+ -->|\z)')) {
            $translations[$match.Groups[1].Value] = $match.Groups[2].Value.Trim()
        }
    }
    $full = [System.Text.StringBuilder]::new()
    $zh = [System.Text.StringBuilder]::new()
    $chartCount = 0
    for ($i = 0; $i -lt $notebook.cells.Count; $i++) {
        $cell = $notebook.cells[$i]
        if ($cell.cell_type -eq 'markdown') {
            $source = TextOf $cell.source
            [void]$full.AppendLine("<section class=`"markdown`" data-cell=`"$i`">$(Markdown $source)</section>")
            if ($project.Slug -eq 'brazil') {
                if (-not $translations.Contains([string]$i)) { throw "Missing Chinese translation for Markdown cell $i" }
                [void]$zh.AppendLine("<section class=`"markdown`" data-cell=`"$i`">$(Markdown $translations[[string]$i])</section>")
            }
            continue
        }
        if ($cell.cell_type -ne 'code') { continue }
        $code = TextOf $cell.source
        if ($code.Trim()) {
            $block = "<details class=`"code`"><summary>Python 代码</summary><pre><code class=`"language-python`">$(Html $code)</code></pre></details>"
            [void]$full.AppendLine($block)
            if ($project.Slug -eq 'brazil') { [void]$zh.AppendLine($block) }
        }
        $outputs = @($cell.outputs)
        for ($k = 0; $k -lt $outputs.Count; $k++) {
            $rendered = RenderOutput $outputs[$k] $i $k $false
            if ($rendered) {
                [void]$full.AppendLine($rendered)
                if ($rendered -match 'chart-output') { $chartCount++ }
                if ($project.Slug -eq 'brazil') {
                    $translatedOutput = RenderOutput $outputs[$k] $i $k $true
                    if ($translatedOutput) { [void]$zh.AppendLine($translatedOutput) }
                }
            }
        }
    }
    $languageButton = if ($project.Slug -eq 'brazil') { '<button type="button" role="tab" aria-selected="false" data-view="zh">中文翻译</button>' } else { '' }
    $translatedPanel = if ($project.Slug -eq 'brazil') { "<div id=`"zh-panel`" class=`"report-panel`" hidden>$zh</div>" } else { '' }
    $banner = if ($project.Banner) { "<div class=`"report-banner`"><img src=`"$($project.Banner)`" alt=`"$($project.Title) 项目横幅`"></div>" } else { '<div class="report-banner report-banner--text"><span>OLIST · BRAZILIAN E-COMMERCE</span><strong class="banner-en">Brazil E-Commerce Analysis</strong><strong class="banner-zh">巴西电商分析</strong><small class="banner-en">Orders · Customers · Products · Delivery</small><small class="banner-zh">订单 · 客户 · 商品 · 履约</small></div>' }
    $projectSummary = if ($project.Slug -eq 'clickstream') { @'
    <section class="report-facts" aria-label="点击流项目概览">
      <div><strong>165,474</strong><span>商品点击</span></div>
      <div><strong>24,026</strong><span>会话</span></div>
      <div><strong>+9.24 pp</strong><span>历史回测 Hit@3 差值</span></div>
    </section>
    <p class="report-facts-note">2008 年 4 月 1 日至 8 月 13 日的服装网店日志。推荐差值仅为离线回测结果，不代表线上转化提升；A/B 测试方案已设计，真实实验尚未运行。</p>
'@ } else { '' }
    $page = @"
<!doctype html>
<html lang="$($project.Lang)">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="$($project.Title)——基于项目最新 Notebook 已保存输出的交互式报告。">
  <title>$($project.Title)｜交互式报告</title>
  <link rel="stylesheet" href="../assets/report.css">
  <link rel="stylesheet" href="../assets/project-outline.css">
  <script src="../taobao/assets/plotly-2.35.2.min.js"></script>
  <script src="../taobao/assets/highlight-11.12.0.min.js"></script>
  <script src="../assets/report-view.js" defer></script>
  <script src="../assets/project-outline.js" defer></script>
</head>
<body data-project="$($project.Slug)">
<a class="report-skip" href="#report-content">跳到报告内容</a>
<header class="report-shell">
  <nav class="report-nav" aria-label="项目导航">
    <a class="report-brand" href="../index.html" aria-label="ObservL，返回主页">ObservL<span aria-hidden="true">.</span></a>
    <span>DATA ANALYSIS / PORTFOLIO</span>
    <a class="report-nav-home" href="../index.html#work">全部项目 <span aria-hidden="true">↗</span></a>
  </nav>
  <div class="report-hero">
    <div class="report-hero-copy">
      <p class="report-kicker">$($project.Index) <span aria-hidden="true">/</span> CASE STUDY</p>
      <p class="report-hero-title">$($project.Title)</p>
      <p class="report-deck">$($project.Deck)</p>
      <a class="report-down" href="#report-content">查看分析 <span aria-hidden="true">↘</span></a>
    </div>
    $banner
  </div>
</header>
<main id="report-content">
  <div class="report-top">
    $projectSummary
    <nav class="view-switch" role="tablist" aria-label="报告显示方式">
      <button type="button" role="tab" aria-selected="false" data-view="charts">图表</button>
      <button type="button" role="tab" aria-selected="true" data-view="full">全文</button>
      $languageButton
      <button type="button" role="tab" aria-selected="false" data-view="feelings">项目感受</button>
    </nav>
  </div>
  <div id="full-panel" class="report-panel">$full</div>
  <div id="charts-panel" class="report-panel" hidden><p class="view-note">共 $chartCount 个图表 · 来自项目 Notebook 的已保存输出</p><div id="charts-grid" class="charts-grid"></div></div>
  $translatedPanel
  <div id="feelings-panel" class="report-panel feelings-panel" hidden><h1>项目感受</h1><p>待补充</p></div>
</main>
</body>
</html>
"@
    $outDir = Join-Path $docs $project.Slug
    if (-not (Test-Path -LiteralPath $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
    $page = $page -replace '(?m)[ \t]+$', ''
    [System.IO.File]::WriteAllText((Join-Path $outDir 'index.html'), $page, [System.Text.UTF8Encoding]::new($false))
    Write-Host "$($project.Slug): $chartCount charts, $($notebook.cells.Count) cells"
}
