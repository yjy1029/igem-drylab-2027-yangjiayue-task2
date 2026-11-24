# Task 2 开工前准备 · 分步执行手册

> 用法：**从上往下做，不要跳步**。每一步都有「验收标准」——不达标不要往后走，
> 因为后面所有工作都建立在前一步之上。
> 预计总耗时：**3–5 小时**（拆成 2–3 天做完全没问题）。

---

## 总览

| 步骤 | 内容 | 预计 | 依赖 |
|---|---|---|---|
| S1 | 编辑器就位（VS Code + 扩展） | 15 min | — |
| S2 | GitHub 账号 + 公开仓库 + 首次 push | 20 min | S1 |
| S3 | 把题目硬约束变成自己的自检清单 | 15 min | — |
| S4 | 三个结构的生物学内容预研 | 45 min | S2 |
| S5 | **技术预研 A**：3Dmol.js 离线能渲染 | 20 min | S1 |
| S6 | **技术预研 B**：PDB → JSON 数据管道 | 60 min | S1 |
| S7 | **技术预研 C**：库+数据内联成单文件 | 40 min | S5、S6 |
| S8 | 设计方向预研（参考图 + 色板 + 字体） | 45 min | — |
| S9 | 交付规范准备（截图/文档/命名） | 20 min | S3 |
| S10 | 时间表与提交动作清单 | 15 min | 全部 |

> **为什么先做 S5–S7 三个技术预研？**
> 因为它们覆盖了本任务全部三个「可能翻车」的技术假设：
> ①库能不能离线跑 ②数据能不能安全地变成 JSON ③能不能打成单文件。
> 三个假设任何一个不成立，整个方案都要改——所以必须在写界面**之前**验证掉。
> 这在工程上叫 **spike（技术探针）**，是最省时间的一步。

---

## S1　编辑器就位

**目标**：有一个能舒服打开 580 KB JS 文件的编辑器。

**方案 A（推荐，零成本）：直接用已经装好的 Visual Studio Community 2026**

- `文件` → `打开` → **`文件夹…`** → 选项目目录
- ⚠️ **不要**新建"项目/解决方案"（不需要 `.sln`/`.csproj`，只会污染仓库）
- 终端：`视图` → `终端`
- 格式化：`Ctrl+K, Ctrl+D`（缩进保持 **2 空格**）
- **不要**直接打开 `spike/*.html` 或未来的 `index.html`（大文件会卡），只编辑 `src/`

**方案 B（可选）：装 VS Code**

```powershell
winget install Microsoft.VisualStudioCode
code --install-extension esbenp.prettier-vscode
code --install-extension EditorConfig.EditorConfig
code --install-extension usernamehw.errorlens
code "C:\Users\32240\Desktop\igem-drylab-2027-task2"
```

在 VS Code 里按 `Ctrl+Shift+P` → `Format Document With` → 选 Prettier → 设为默认。

**验收**
- [ ] 能用编辑器打开项目目录，并看到 `main` 分支
- [ ] 打开 `prep/raw/1EMA.pdb` 不卡死
- [ ] 知道终端在哪、怎么跑 `node` / `git`

**坑**
- VS 里若提示"没有 intellisense"，确认根目录 `jsconfig.json` 存在（已备好）。
- 别装"分子可视化"类插件，这个任务不需要。

---

## S2　GitHub 账号 + 公开仓库 + 首次 push

**目标**：仓库地址先存在。之后每完成一步就 push，永远不会有"最后一晚 push 失败"。

**前置**：确认拼音姓名（用于仓库命名），本手册先假设为 `yangjiayue`。

**操作 ①：在 GitHub 建仓库**

1. 登录 github.com（没有就注册，邮箱用你简历上的邮箱）
2. 右上角 `+` → **New repository**
3. 填：
   - Repository name：`igem-drylab-2027-yangjiayue-task2`
   - 选 **Public**（必须，私有＝没交）
   - **不要**勾 "Add a README file"（本地已有）
4. **Create repository** → 复制页面上的 `https://github.com/<你>/igem-drylab-2027-yangjiayue-task2.git`

**操作 ②：本地改名 + 关联远程 + 推送**

```powershell
cd C:\Users\32240\Desktop
Rename-Item "igem-drylab-2027-task2" "igem-drylab-2027-yangjiayue-task2"
cd igem-drylab-2027-yangjiayue-task2

git remote add origin https://github.com/<你的用户名>/igem-drylab-2027-yangjiayue-task2.git
git branch -M main
git push -u origin main
```

首次 push 会弹浏览器让你登录授权（Git Credential Manager），登录一次以后就记住了。

**验收**
- [ ] 浏览器打开 `https://github.com/<你>/igem-drylab-2027-yangjiayue-task2` 能看到文件
- [ ] **打开一个无痕窗口**（`Ctrl+Shift+N`）也能看到 → 证明"免登录可访问"
- [ ] `git log --oneline` 至少有 2 条提交

**坑**
- push 报 `remote: Support for password authentication was removed` → 不能用账号密码，要用弹窗里的浏览器授权（或 PAT）。
- 仓库名写错 → 改本地文件夹名和 `git remote set-url origin <新地址>` 即可。
- 别急着把 `.gitignore` 删掉，`node_modules/` 绝不进仓库。

---

## S3　把题目硬约束抄成自己的自检清单

**目标**：把"题目要求"从 PDF 变成你会真的去看的 checklist。

**操作**：新建 `docs/REQUIREMENTS.md`，只抄**可判定真假**的条款（不要抄描述性文字），每条留一个空勾选框。至少要覆盖：

```markdown
## 硬约束（一条不过就废）
- [ ] 提交物是**一个** .html 文件，双击即可打开
- [ ] 完全离线：无 CDN、无运行时网络请求、无外部链接
- [ ] 三个结构：1EMA / 1M17 / 1BRS，可无缝切换
- [ ] 至少 4 种表示方式（cartoon/stick/ball-and-stick/sphere/surface/wireframe）
- [ ] 表示方式**可组合**（例：半透明 surface + 球棍配体）
- [ ] 接触残基高亮 + 标签（残基名 + 编号）
- [ ] 接触判据：重原子、5 Å、1BRS 双向
- [ ] 三个结构的预处理按要求（1EMA 留 A 链去水；1M17 留 A 链去水；1BRS 只留 A、D）
- [ ] README.md 含三问回答
- [ ] AI_USAGE.md
- [ ] screenshots/ 2–3 张截图
- [ ] prep/ 里有可复现的数据处理说明或脚本

## 加分项（有余力再做）
- [ ] 点击残基弹窗（名称/编号/最小距离）
- [ ] 任意两原子测距
- [ ] 一键导出 PNG
- [ ] 移动端响应式
- [ ] 色盲友好 / 可切换配色
```

**验收**
- [ ] 这份清单里的每一条，你都能用一句话说出"怎么验证它是真的"

---

## S4　三个结构的生物学内容预研

**目标**：README 第一问（"所高亮残基的生物学意义"）**提前写好**，不要留到最后抄。

**操作**：每个结构查 3 个问题，答案用自己的话写 3–5 句，存到 `docs/BIOLOGY.md`。

### 1EMA / GFP / 发色团 CRO
查：
1. 发色团由哪三个残基形成？（提示：65–67）
2. 它需要氧气参与的自催化环化——这对"合成生物学元件"意味着什么？
3. 吸收/发射波长各是多少？为什么它被用作报告基因？

### 1M17 / EGFR + 厄洛替尼 AQ4
查：
1. 厄洛替尼结合在 EGFR 的哪个结构域/口袋？（ATP 口袋）
2. 它与哪个残基形成关键氢键？（找 Met769 或相邻铰链残基）
3. 为什么它是"靶向药"——抑制激酶活性会阻断什么信号通路？

### 1BRS / Barnase–barstar
查：
1. Barnase 是什么酶？barstar 的作用是什么？
2. 这个复合物的亲和力量级（Kd）是多少？为什么这么强？
3. 界面上的互补电荷/形状匹配具体指什么？

**验收**
- [ ] `docs/BIOLOGY.md` 里有三段话，每段都能**不看资料讲出来**
- [ ] 能指出 1M17 里参与氢键的那个残基编号

**坑**：不要复制维基百科段落——面试会问"这段是你写的吗"。用自己的话，哪怕不完美。

---

## S5　技术预研 A：3Dmol.js 能离线渲染

**目标**：验证最核心的假设——**库 + 内嵌数据 + 断网 = 能看能转**。

**已备好探针**：`spike/01-hello-3dmol.html`（已生成，内嵌了 1EMA 的真实数据）。

**操作**
1. **先断网**（关 Wi-Fi 或拔网线）
2. 双击 `spike\01-hello-3dmol.html`
3. 鼠标拖动旋转、滚轮缩放
4. 按 `F12` → **Network** 面板 → 刷新 → 确认**列表为空**（没有任何网络请求）

**验收**
- [ ] 断网状态下能看到绿色 cartoon 蛋白并可交互
- [ ] 控制台（Console）无红色报错
- [ ] Network 面板 0 条请求

**坑**
- 如果一片空白：`F12` 看 Console。常见是路径错（探针引用了 `../node_modules/3dmol/build/3Dmol-min.js`，所以必须保持目录结构）。
- 如果旋转卡顿：正常，1EMA 只有 1700 个原子，说明是机器慢，后面注意减少 surface 计算。

---

## S6　技术预研 B：PDB → JSON 数据管道

**目标**：把"原始 PDB"变成"网页能直接吃的干净数据"，并**能自查正确性**。

**要做的两件事**

1. **裁剪**（`prep/scripts/clean-pdb.mjs`）→ 输出 `prep/clean/*.pdb`
   - 1EMA：留 A 链 ATOM + `CRO` + `MSE`，删 `HOH`
   - 1M17：留 A 链 ATOM + `AQ4`，删 `HOH`
   - 1BRS：只留链 A、D，删 `HOH` 和 B/C/E/F

2. **算接触残基**（`prep/scripts/compute-contacts.mjs`）→ 输出 `prep/contacts/*.json`
   - 判据：重原子（元素 ≠ H）之间 **≤ 5.0 Å**
   - 1BRS 双向

**验收（这是重点，必须逐条对）**

| 检查 | 期望 |
|---|---|
| 1EMA 原子数 | 1717（ATOM）− 0 + 22（CRO）+ 32（MSE）= **1771** |
| 1EMA 是否含 `CRO` | 是，残基号 66 |
| 1M17 是否含 `AQ4` | 是，A/999，29 个原子 |
| 1BRS 链 | 只有 A、D |
| 1M17 接触残基里是否有 Met769 | **应该有**（若没有，判据实现错了） |
| 1BRS 接触残基 | A 链和 D 链**都有**（双向），数量级相仿 |

**坑**
- 用 `substring(17,3)` 之类硬编码列位置时，**PDB 是定宽格式**，一定要按列切，不要按空格 split（残基名/链号可能紧邻）。
- `MSE` 在 3Dmol 里默认可能被当杂原子渲染，后面要单独指定 style。
- 距离比较用**平方**，别每对原子都 `Math.sqrt`（25 万次开方会明显拖慢）。

---

## S7　技术预研 C：库 + 数据内联成单文件

**目标**：验证最终交付形态可行——**一个 HTML，没有任何外部依赖**。

**操作思路**（S5/S6 之后再动手）
1. 把 `node_modules/3dmol/build/3Dmol-min.js`（580 KB）读成字符串，塞进 `<script>…</script>`
2. 把 `prep/clean/*.pdb` 的三个内容塞成 JS 常量
3. 生成 `index.html`，体积目标 **≤ 2.5 MB**

**验收**
- [ ] `index.html` 单个文件，复制到**另一个文件夹**（比如桌面新建 test 目录）双击仍能打开
- [ ] 断网可用
- [ ] `F12` → Network：**0 请求**
- [ ] 体积 ≤ 2.5 MB（1–1.5 MB 是理想值）

**坑**
- 内联时 JS 字符串里如果出现 `</script>`，会**提前闭合标签**把页面搞坏。数据里含 `<` 都要转义，或改用 base64。
- PDB 文本里有反斜杠/引号会破坏模板字符串 → 用 `JSON.stringify()` 生成安全字面量。
- 别用 `<script src="data:text/javascript;base64,...">` 这种取巧写法，部分浏览器对大小有限制。

---

## S8　设计方向预研

**目标**：动手写 CSS 之前就知道"我要长什么样"。

**操作**
1. **收集 3 张参考图**（存 `docs/refs/`）：
   - RCSB PDB 的结构详情页（信息布局参考）
   - Mol* / NGL demo 的界面（交互参考）
   - 任意一个你觉得"高级"的数据工具界面（视觉参考，如 Linear、Raycast、Arc）
2. **定 5 个颜色**（写成变量，后面不临时改）：

```css
:root{
  --bg:      /* 背景 */;
  --panel:   /* 面板 */;
  --ink:     /* 主文字 */;
  --muted:   /* 次要文字 */;
  --accent:  /* 唯一强调色，只给"高亮目标" */;
}
```

3. **定 2 个字体**：一个 UI 字体 + 一个等宽字体（给残基编号、距离数值）
   - 提示：**不能用 Google Fonts**（离线约束）。要么用系统字体栈，要么把字体文件 base64 内联（会显著增大体积，慎用）。
   - 推荐直接用系统栈：`system-ui, "Segoe UI", "Microsoft YaHei"` + `Consolas, "Cascadia Mono"`。

**验收**
- [ ] 能用一句话描述界面："左侧结构列表 + 中间 3D 视图 + 右侧接触残基面板，深灰蓝底、青色强调"
- [ ] 色板 5 个色值写进 `src/tokens.css`

---

## S9　交付规范准备

**操作**
- 建 `screenshots/`，约定文件名 `01-overview.png`、`02-ligand.png`、`03-contacts.png`
- 截图分辨率：**1920×1080 或更高**，用浏览器 `F12` → `Ctrl+Shift+P` → `Capture full size screenshot`
- 确认 `README.md`、`AI_USAGE.md` 的模板已在仓库里（已备好）

**验收**
- [ ] 三个文件名想好了
- [ ] 知道怎么截"整页高清图"

---

## S10　时间表与提交动作清单

**建议节奏（截止 12/9 23:59，务必 12/8 就完成主体）**

| 日期 | 事 |
|---|---|
| 11/24–25 | S1–S4（编辑器、仓库、约束、生物） |
| 11/26–27 | S5–S7（三个技术探针） |
| 11/28–12/2 | 功能全实现（P2） |
| 12/3–12/5 | 视觉打磨（P4，最重要） |
| 12/6–12/7 | 截图 + 文档 + 断网复测 |
| **12/8** | 冻结提交，push 完成 |
| 12/9 | 只做看，不改 |

**提交动作清单（12/8 做一遍）**
- [ ] 仓库 public、无痕可访问
- [ ] `index.html` 双击可用、断网可用、Network 0 请求
- [ ] README 三问**全部写完**（不是 TODO）
- [ ] AI_USAGE.md 写完（含 pitfalls + 最有效 prompt）
- [ ] 截图 2–3 张已提交
- [ ] 简历里链接**红色高亮**
- [ ] 简历发至 `JLU-CP_iGEM@outlook.com`

---

## 准备阶段「不需要做」的 5 件事

1. ❌ 不要先学 Three.js / WebGL —— 题目允许直接用库。
2. ❌ 不要搭后端 / 数据库 —— 一切都在前端、单文件里。
3. ❌ 不要纠结 React/Vue —— 原生 JS 产物最小、最不容易踩打包坑。
4. ❌ 不要写 20 页设计文档 —— 一页色板 + 一句话描述就够。
5. ❌ 不要"等学会了再开始" —— 边做边查，本任务考的就是这个。

---

## 现在从哪开始

**今天只做 S1 → S2 → S3**（约 50 分钟），做完回来报一句：
1. 仓库 URL 是什么
2. `check-env.cmd` 是不是全绿
3. 仓库名用的拼音对不对

然后我们进入 S4（生物学）和 S5–S7（三个技术探针）。
