# igem-drylab-2027-<pinyin-name>-task2

> iGEM 2027 赛季（JLU-CP Dry Lab）技术评估 · **Task 2：交互式蛋白结构可视化网页**
> 提交物：**一个**双击即可打开、**完全离线**的 `index.html`。

---

## 现在这个仓库的状态

**阶段：P0 环境准备（已完成）**

- [x] 目录结构搭好
- [x] Node.js `v26.13.1` / npm `11.20.0` 安装完成（见 [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md)）
- [x] 依赖安装：`3dmol@3.0.0`、`pako@3.0.3`、`esbuild@0.28.2`
- [x] 三个 PDB 文件下载到 `prep/raw/`（版本与 sha256 记入 [`prep/notes.md`](prep/notes.md)）
- [ ] 数据预处理（裁链 / 去水 / 抽配体 / 算接触残基）　← **下一步**
- [ ] `index.html` 功能跑通
- [ ] 单文件内联 + 断网自测
- [ ] 视觉打磨
- [ ] 截图 + 文档 + 提交

> 环境自检：双击根目录 `check-env.cmd`，或 `npm.cmd run check`。
> 环境准备的完整核对表在 **[docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)**。

---

## 目录结构

```
igem-drylab-2027-<pinyin-name>-task2/
├── README.md              本文件：如何打开、用了哪个库、做了哪些预处理 + 三问回答
├── AI_USAGE.md            AI 使用记录（必交）
├── index.html             最终交付物：单文件、离线可用（由 build 脚本生成）
├── screenshots/           成品应用 2–3 张截图
├── docs/
│   └── ENVIRONMENT.md     软件与运行环境清单
├── prep/
│   ├── raw/               从 RCSB 下载的原始 PDB（不进 git）
│   ├── clean/             裁剪后的 PDB（去水、留指定链）
│   ├── contacts/          预计算的接触残基 JSON
│   ├── scripts/           预处理脚本（Node，无第三方依赖优先）
│   └── notes.md           数据版本、SHA-256、处理决策记录
├── vendor/                3Dmol.js / pako 的本地副本（内联打包用）
├── src/                   开发用源码（html 模板 / css / js / data）
└── build/                 内联打包脚本：src + vendor + data → index.html
```

---

## 如何打开

（阶段 P3 完成后填写）

1. 双击 `index.html`；
2. 不需要联网、不需要本地服务器、不需要安装任何东西。

---

## 使用的库

（待定：3Dmol.js 或 NGL。默认倾向 **3Dmol.js**——体积更小、API 更简单、更容易内联进单文件。）

---

## 预处理做了什么

| PDB | 保留 | 删除 | 高亮目标 |
|---|---|---|---|
| `1EMA` | Chain A（含 `MSE` 硒代甲硫氨酸、`CRO` 发色团，二者均为 HETATM） | 水分子 | 发色团 `CRO`（共价残基，位于链内 A/66） |
| `1M17` | Chain A + 配体 `AQ4` | 水分子 | 配体 `AQ4`（A/999） |
| `1BRS` | Chain A + Chain D（共 6 条链，其余 B/C/E/F 删） | 水分子、其余 4 条链 | A↔D 双向接触残基 |

**统一接触判据**：残基任一重原子（不含氢）与高亮目标任一重原子距离 **≤ 5 Å**。

---

## README 三问（题目要求，待填）

### 1. 所高亮残基的生物学意义

- **1EMA / `CRO`**：（待写）Ser65–Tyr66–Gly67 环化形成的对羟基苄叉咪唑啉酮发色团……
- **1M17 / `AQ4`**：（待写）厄洛替尼作为 EGFR ATP 竞争性抑制剂……
- **1BRS / A–D 界面**：（待写）barnase–barstar 超强亲和识别……

### 2. 视觉设计取舍

（待写：约束 → 选择 → 代价 的句式，说明配色、布局、默认相机角度、默认表示方式）

### 3. 最耗时的一步与解决方式

（待写：写真实遇到的坑与替代方案）

---

## 开发命令

```powershell
npm run fetch     # 下载 3 个 PDB 到 prep/raw/
npm run check     # 环境自检
npm run dev       # 本地预览（可选）
```
