# Task 2 环境准备清单（Windows / 你本机的实际情况）

> 目标：把「交互式蛋白结构可视化单文件网页」这一任务需要的一切软件与运行环境备齐。
> 本文件是**可执行的核对表**，装完一项勾一项。
> 最后更新：见 git log。

---

## 0. 先看结论

这个任务只需要 **4 样东西**，其中 1 样你已经有了：

| # | 需要 | 状态（本机实测，2026-11-24） |
|---|---|---|
| 1 | **Node.js 20 LTS+（含 npm）** | ✅ 已装 `v26.13.1` / npm `11.20.0`（`C:\Program Files\nodejs`） |
| 2 | **VS Code** | ❌ 未装 —— 建议装（不装也能干活，用记事本会痛苦） |
| 3 | **Git** | ✅ 已有 `git 2.54.0.windows.1`（`D:\Git\cmd`），`user.name/email` 已配 |
| 4 | **Chrome / Edge** | ✅ 系统自带 Edge 即可 |

**明确不需要**（这是 Task 1 的东西，别去装，会浪费一整天）：
conda、PyMOL、AutoDock Vina、Open Babel、MGLTools、GPU、服务器、数据库。

---

## 1. 必装

### 1.1 Node.js LTS（含 npm）

**为什么必须**：整个流程都靠它——

- 拉取 3Dmol.js / pako（离线内联用）与 esbuild（打包压缩）；
- 用 Node 写 PDB 预处理脚本（解析原子、去水、算 5 Å 接触残基、输出 JSON）；
- 把 `src/` + 库 + 数据**内联打包**成那一个 `index.html`；
- 本地起调试服务器。

**版本要求**：**≥ 18**（脚本用了内置 `fetch`），推荐 **20 LTS 或 22 LTS**。本机已装 `v26.13.1`（LTS 线，满足要求）。

```powershell
winget install OpenJS.NodeJS.LTS     # ← 本机已完成
```

装完**关掉并重开终端**（PATH 才生效），然后：

```powershell
node -v      # ✅ 本机：v26.13.1
npm.cmd -v   # ✅ 本机：11.20.0
```

> ⚠️ **本机特有的坑：PowerShell 里 `npm` 会报"禁止运行脚本"**。
> 原因是 PowerShell 会把 `npm` 解析成 `C:\Program Files\nodejs\npm.ps1`，而本机执行策略禁止运行 `.ps1`。
> **解决办法：一律写 `npm.cmd`**（`cmd` 批处理不受执行策略限制）。
> ```powershell
> npm        # ❌ 报错：无法加载文件 npm.ps1 … 禁止运行脚本
> npm.cmd    # ✅ 正常
> ```
> 如果你想让 `npm` 直接可用，可以（可选、二选一）：
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned   # 放开当前用户的脚本执行
> ```
> 不改执行策略也完全能干活，本文档与脚本内都统一用 `npm.cmd` / `-ExecutionPolicy Bypass`。

### 1.2 编辑器

**本机已装 Visual Studio Community 2026（18.5.2）——可以直接用，不必再装别的东西。**

| 方案 | 说明 | 建议 |
|---|---|---|
| **A. 用已有的 Visual Studio 2026** | 免费、已装、能编辑 HTML/CSS/JS、内置终端与 Git | ✅ **零成本，先这么干** |
| B. 装 VS Code（约 100 MB） | 更轻、打开纯文件夹更顺手、扩展生态（Prettier 等）更好 | 可选，觉得 VS 卡了再装 |

**在 Visual Studio 里怎么打开这个项目（重要）**

- 菜单 `文件` → `打开` → **`文件夹…`**，选 `C:\Users\32240\Desktop\igem-drylab-2027-yangjiayue-task2`
- ⚠️ **不要**新建"项目/解决方案"。纯静态网页不需要 `.sln` / `.csproj`，生成了只会污染仓库，也和"单文件交付"无关。
- 终端：菜单 `视图` → `终端`（在里面跑 `node` / `git` 命令）
- 格式化：选中文件按 `Ctrl+K, Ctrl+D`（HTML/CSS/JS 都支持；缩进保持 **2 空格**，和仓库现有代码一致）

**VS 里干活要注意的 3 点**

1. **不要用 VS 打开 `spike/01-hello-3dmol.html` 或未来的 `index.html`**（190 KB ~ 2 MB 的构建产物，会明显卡）。
   改代码永远改 `src/` 下的源文件，`index.html` 由构建脚本生成。
2. **不要开"保存时自动格式化"**（会和 Prettier 冲突，也可能改动 PDB 数据行）。
3. 版本控制**用命令行**（`git add/commit/push`），不要用 VS 的团队资源管理器——两者混用容易出现意料外的暂存。

**如果你后来决定装 VS Code**（可选）：

```powershell
winget install Microsoft.VisualStudioCode
code --install-extension esbenp.prettier-vscode
code --install-extension EditorConfig.EditorConfig
code --install-extension usernamehw.errorlens
```

> 仓库根目录已放好 **`jsconfig.json`**，所以无论 VS 还是 VS Code，`src/` 里的 JS 都能拿到正常的类型提示与跳转（它只影响编辑器，不进入交付物）。

### 1.3 Git（已有，但要配一次身份）

```powershell
git --version                      # ✅ 2.54.0.windows.1
git config --global user.name  "你的名字"
git config --global user.email "你的邮箱"
git config --global core.autocrlf true   # Windows 上必配，否则换行符会污染 diff
```

### 1.4 浏览器

用 **Edge** 或 **Chrome** 都行，关键是用它的 DevTools：

- `F12` → **Network** 面板：提交前确认**没有任何一条网络请求**（离线硬约束）；
- `F12` → **Application / Performance**：看加载与渲染耗时；
- 无痕窗口（`Ctrl+Shift+N`）：验证"新用户第一次打开"的体验。

---

## 2. 建议装（不装也能干活）

| 工具 | 用途 | 形态 |
|---|---|---|
| **Figma**（网页版即可） | 配色板、图注排版、截图版面拼装 | 免费网页版 |
| **Inkscape**（可选） | 若想矢量修图 | `winget install Inkscape.Inkscape` |
| **Python 3.11**（可选） | 如果你想用 Biopython 写预处理 | `winget install Python.Python.3.12` |

> Python 是**可选**的：预处理用 Node 一样做（而且不必再装一套依赖）。**建议先用 Node 一条路走完。**

---

## 3. 项目内依赖（npm 包）

进入项目目录后执行：

```powershell
cd C:\Users\32240\Desktop\igem-drylab-2027-yangjiayue-task2
npm.cmd i 3dmol pako
npm.cmd i -D esbuild
```

**本机已执行完毕**，当前版本：

| 包 | 版本 | 位置 / 说明 |
|---|---|---|
| `3dmol` | `^3.0.0` | 内联用的文件是 **`node_modules/3dmol/build/3Dmol-min.js`（580 KB）** |
| `pako` | `^3.0.3` | 可选，数据 gzip 解压 |
| `esbuild` | `^0.28.2` | 打包压缩（注意 npm 提示其 postinstall 脚本未获批准，若 `npx esbuild` 报错再处理） |

> `3Dmol-min.js` 580 KB —— 内联进 HTML 完全可接受（最终单文件约 1–2 MB，取决于嵌入的结构数据量）。

| 包 | 类型 | 为什么 |
|---|---|---|
| `3dmol` | 运行时 | 分子渲染库本体（Task 2 允许的两个库之一）。安装后从 `node_modules/3dmol/build/3Dmol-min.js` 取，**内联进 HTML**，绝不走 CDN |
| `pako` | 运行时（可选） | 把内嵌的 PDB 数据 gzip 后 base64 存进 HTML，页面里解压。不装也能做，只是 HTML 会大 2–3 倍 |
| `esbuild` | 开发 | 把多文件源码打包、压缩成一个 `<script>` |
| `serve`（npx 临时用，不必装） | 开发 | 本地预览。**注意**：`file://` 下也要能跑，别依赖它 |

> **不要**装 React/Vue/Tailwind 之类框架。单文件 + 完全离线的约束下，原生 HTML/CSS/JS 最省心，构建产物也最小。

---

## 4. 数据（不是软件，但属于"环境"）

从 **RCSB PDB** 下载 3 个结构的 **PDB 格式**文件：

| PDB ID | 放进 | 说明 |
|---|---|---|
| `1EMA` | `prep/raw/1EMA.pdb` | GFP，发色团 `CRO` 共价嵌在链内 |
| `1M17` | `prep/raw/1M17.pdb` | EGFR + 厄洛替尼，配体 `AQ4` |
| `1BRS` | `prep/raw/1BRS.pdb` | Barnase–barstar，链 A 与 D |

两种方式任选：

```powershell
# 方式 A：跑仓库里的脚本（已写好，需 Node）
npm.cmd run fetch

# 方式 B：浏览器下载
# https://files.rcsb.org/download/1EMA.pdb
# https://files.rcsb.org/download/1M17.pdb
# https://files.rcsb.org/download/1BRS.pdb
```

**本机已下载完成**，结果已记入 [`prep/notes.md`](../prep/notes.md)：

| PDB | bytes | ATOM | HETATM |
|---|---|---|---|
| 1EMA | 190,188 | 1,717 | 149（CRO 22 + MSE 32 + HOH 95） |
| 1M17 | 252,720 | 2,511 | 49（AQ4 29 + HOH 20） |
| 1BRS | 466,965 | 4,640 | 513（全部是 HOH） |

> 📌 体检时发现的两个反直觉点（详见 `prep/notes.md`）：
> 1. **1EMA 的 `CRO` 和 `MSE` 都是 HETATM** —— 用"删所有 HETATM"的粗暴规则会把发色团和硒代甲硫氨酸一起删掉。
> 2. **1BRS 实际有 6 条链**（A/B/C 是 barnase，D/E/F 是 barstar），必须只留 A + D。

---

## 5. 验收（装完跑一次）

双击项目根目录的 **`check-env.cmd`**，或：

```powershell
npm run check
```

期望输出全部 `[OK]`。出现 `[MISSING]` 就回到对应小节补装。

> 本机已知限制：**PowerShell 执行策略禁止直接运行 `.ps1`**。
> 所以 `check-env.cmd` 是个包装器（内部用 `-ExecutionPolicy Bypass` 调用脚本）。
> 你自己写 `.ps1` 调试时也要这样调用，否则会报"在此系统上禁止运行脚本"。

---

## 6. 常见坑（提前知道能省几小时）

1. **`file://` 下不能 fetch 本地文件**。任何 `fetch('data.json')` 的写法，双击打开就废。
   数据必须以**内联字符串**（或 base64）形式写在 HTML/JS 里。
2. **CDN 引库 = 直接违规**。`<script src="https://...">`、Google Fonts、unpkg、jsdelivr 全部不行。
   字体也要自托管或改用系统字体栈。
3. **单文件 ≠ 单脚本**。最终提交物只能是**一个** `.html`；`src/`、`build/` 这些是仓库里的源文件，不算违规，但 `index.html` 必须自包含。
4. **npm 慢**：可临时用镜像 `npm config set registry https://registry.npmmirror.com`（提交前改回官方源，避免 lockfile 混乱）。
5. **Node 版本太低**（≤16）没有内置 `fetch`，预处理脚本会直接报错。
6. **别把 `node_modules/` 提交进仓库**（`.gitignore` 已处理）。
7. **Windows 换行**：`core.autocrlf=true`，否则提交的 diff 全是 `^M`。

---

## 7. 接下来的动手顺序（环境就绪之后）

| 阶段 | 产出 | 说明 |
|---|---|---|
| **P1 数据管道** | `prep/clean/*.pdb`、`prep/contacts/*.json` | 去水/裁链、抽配体、按 5 Å 算接触残基并落盘 |
| **P2 骨架跑通** | `index.html` 能切三个结构、四种表示 | 先丑后美，功能优先 |
| **P3 补齐约束** | 单文件内联、断网可用 | 打包脚本 + Network 面板自测 |
| **P4 视觉打磨** | 配色/字体/交互态/过渡 | 这是评分重头，**留足时间** |
| **P5 交付** | 截图、README、AI_USAGE.md、public repo | 提前 1 天冻结 |

时间线见根目录 `README.md`。
