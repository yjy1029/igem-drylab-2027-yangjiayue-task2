# Task 2 环境自检脚本（Windows PowerShell 5.1+）
# 直接运行可能被执行策略拦截，请用根目录的 check-env.cmd，或：
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\check-env.ps1

$ErrorActionPreference = 'SilentlyContinue'
$root = Split-Path -Parent $PSScriptRoot
$fail = 0
$warn = 0

function Line($state, $name, $detail) {
    $color = switch ($state) {
        'OK'    { 'Green' }
        'MISS'  { 'Red' }
        'WARN'  { 'Yellow' }
        default { 'Gray' }
    }
    Write-Host ('[{0,-4}] ' -f $state) -NoNewline -ForegroundColor $color
    Write-Host ('{0,-22}' -f $name) -NoNewline
    Write-Host $detail -ForegroundColor DarkGray
    if ($state -eq 'MISS') { $script:fail++ }
    if ($state -eq 'WARN') { $script:warn++ }
}

Write-Host ''
Write-Host '=== iGEM 2027 Task 2 · 环境自检 ===' -ForegroundColor Cyan
Write-Host ("项目目录: {0}" -f $root) -ForegroundColor DarkGray
Write-Host ''

# ---------- 1. 运行时 ----------
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    $v = (& node -v) 2>$null
    $major = 0
    if ($v -match 'v(\d+)') { $major = [int]$Matches[1] }
    if ($major -ge 18) { Line 'OK' 'Node.js' $v }
    else { Line 'WARN' 'Node.js' "$v 版本过低，需 >= 18（内置 fetch）" }
} else {
    Line 'MISS' 'Node.js' '未安装 → winget install OpenJS.NodeJS.LTS'
}

$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if ($npm) { Line 'OK' 'npm' ((& npm.cmd -v) 2>$null) }
elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    Line 'WARN' 'npm' 'PowerShell 里 npm 会命中 npm.ps1 被执行策略拦截，请写 npm.cmd'
} else { Line 'MISS' 'npm' '随 Node.js 一起安装，重开终端再试' }

$ep = Get-ExecutionPolicy -Scope CurrentUser
if ($ep -in @('Restricted', 'AllSigned')) {
    Line 'WARN' '执行策略' "CurrentUser=$ep → .ps1 不能直跑，用 .cmd 包装器 / npm.cmd"
} else {
    Line 'OK' '执行策略' "CurrentUser=$ep"
}

# ---------- 2. 版本管理 / 编辑器 ----------
$git = Get-Command git -ErrorAction SilentlyContinue
if ($git) {
    Line 'OK' 'Git' ((& git --version) 2>$null)
    $uname = (& git config --global user.name) 2>$null
    if ([string]::IsNullOrWhiteSpace($uname)) { Line 'WARN' 'git user.name' '未配置 → git config --global user.name "..."' }
    else { Line 'OK' 'git user.name' $uname }
    $uemail = (& git config --global user.email) 2>$null
    if ([string]::IsNullOrWhiteSpace($uemail)) { Line 'WARN' 'git user.email' '未配置 → git config --global user.email "..."' }
    else { Line 'OK' 'git user.email' $uemail }
} else {
    Line 'MISS' 'Git' '未安装 → winget install Git.Git'
}

$code = Get-Command code -ErrorAction SilentlyContinue
if ($code) {
    Line 'OK' '编辑器: VS Code' $code.Source
} else {
    # 退而求其次：Visual Studio（2022/2026）也能用「打开文件夹」模式干活
    $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
    $vsPath = $null
    if (Test-Path $vswhere) {
        $vsPath = (& $vswhere -latest -products * -property installationPath) 2>$null
    }
    if ($vsPath) {
        Line 'OK' '编辑器: Visual Studio' $vsPath
        Line 'WARN' '建议装 VS Code' 'VS 较重、大文件略卡，但完全可用（详见 docs/ENVIRONMENT.md）'
    } else {
        Line 'WARN' '编辑器' '未找到 VS Code / Visual Studio → winget install Microsoft.VisualStudioCode'
    }
}

# ---------- 3. 浏览器 ----------
$edge = Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'
$edge2 = Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'
$chrome = Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'
$chrome2 = Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'
if ((Test-Path $edge) -or (Test-Path $edge2)) { Line 'OK' 'Edge' '可用于 DevTools / 离线自测' }
else { Line 'WARN' 'Edge' '未找到' }
if ((Test-Path $chrome) -or (Test-Path $chrome2)) { Line 'OK' 'Chrome' '可用于 DevTools / 离线自测' }
else { Line 'OK' 'Chrome' '未安装（有 Edge 即可）' }

# ---------- 4. 项目依赖 ----------
$nm = Join-Path $root 'node_modules'
if (Test-Path $nm) {
    if (Test-Path (Join-Path $nm '3dmol')) { Line 'OK' 'npm: 3dmol' '已安装（内联用）' }
    else { Line 'MISS' 'npm: 3dmol' '→ npm i 3dmol pako' }

    if (Test-Path (Join-Path $nm 'pako')) { Line 'OK' 'npm: pako' '已安装（数据压缩，可选）' }
    else { Line 'WARN' 'npm: pako' '可选 → npm i pako' }

    if (Test-Path (Join-Path $nm 'esbuild')) { Line 'OK' 'npm: esbuild' '已安装（打包）' }
    else { Line 'WARN' 'npm: esbuild' '→ npm i -D esbuild' }
} else {
    Line 'MISS' 'node_modules' '尚未安装依赖 → npm i 3dmol pako && npm i -D esbuild'
}

# ---------- 5. 数据 ----------
$raw = Join-Path $root 'prep\raw'
$need = @('1EMA', '1M17', '1BRS')
foreach ($id in $need) {
    $f = Join-Path $raw "$id.pdb"
    if (Test-Path $f) {
        $kb = [math]::Round((Get-Item $f).Length / 1KB, 1)
        Line 'OK' "PDB: $id" "$kb KB"
    } else {
        Line 'MISS' "PDB: $id" "缺失 → npm run fetch"
    }
}

# ---------- 6. 交付物 ----------
$idx = Join-Path $root 'index.html'
if (Test-Path $idx) { Line 'OK' 'index.html' '已存在' }
else { Line 'WARN' 'index.html' '还没生成（P2/P3 阶段产出）' }

Write-Host ''
if ($fail -eq 0 -and $warn -eq 0) {
    Write-Host '全部就绪，可以开始 P1 数据管道。' -ForegroundColor Green
} elseif ($fail -eq 0) {
    Write-Host "核心环境已就绪，有 $warn 项建议项未完成（不影响开工）。" -ForegroundColor Yellow
} else {
    Write-Host "有 $fail 项必需项缺失，请回到 docs/ENVIRONMENT.md 对应小节补装。" -ForegroundColor Red
}
Write-Host ''
