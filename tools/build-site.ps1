param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
$docs = Join-Path $Root 'docs'
$projects = @(
    @{ Slug = 'taobao'; Folder = '淘宝用户购物行为分析'; Notebook = '淘宝用户购物行为分析.ipynb'; Title = '淘宝用户购物行为分析'; Lang = 'zh-CN'; Banner = '../assets/banners/taobao-user-behavior.png' },
    @{ Slug = 'nev'; Folder = '新能源汽车经营分析'; Notebook = '新能源汽车经营分析.ipynb'; Title = '新能源汽车经营分析'; Lang = 'zh-CN'; Banner = '../assets/banners/nev-operations.png' },
    @{ Slug = 'brazil'; Folder = 'Brazilian E-Commerce Analysis'; Notebook = 'Brazil EC.ipynb'; Title = 'Brazil E-Commerce Analysis'; Lang = 'en'; Banner = '' }
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
<main>
  <a class="home-return" href="../index.html">← 返回主页</a>
  <div class="report-top">$banner
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
