# AI_USAGE.md

> 题目要求：说明**哪些部分由 AI 生成**，以及**所使用的环境与模型**。
> 补充建议：写成「模块 × 是否 AI 生成 × 我如何验证/修改」的表，比流水账可信，也方便面试时逐条讲。

## 使用环境与模型

| 项 | 内容 |
|---|---|
| 工具 | （例：Claude Code / Codex / Cursor / DeepSeek Harness） |
| 模型 | （例：Claude Opus 5.5、GPT-5.x、DeepSeek-V4） |
| 使用时间 | 2026-11-xx ~ 2026-12-0x |
| 操作系统 | Windows 11 |

## 逐模块记录

| 模块 / 文件 | 是否 AI 生成 | 用了什么 prompt / 方式 | 我做的验证与修改 | 最终是否由我理解并能解释 |
|---|---|---|---|---|
| `docs/ENVIRONMENT.md` | 是（草稿） | 让 AI 依据题目要求列出 Task 2 所需环境 | 逐条对照题目「技术限制」核对；删掉 conda/PyMOL 等无关项 | 是 |
| `prep/scripts/*.mjs` | 部分 | | | |
| `prep/contacts/*.json` | | | | |
| `src/*`（界面/样式） | | | | |
| `src/*`（3D 交互逻辑） | | | | |
| `build/build.mjs` | | | | |
| `index.html` | 构建产物 | | | |
| 配色方案 | | | | |
| README 三问的回答 | | | | |

## 踩过的坑（题目要求写「pitfalls encountered」）

1. （例）3Dmol.js 通过 CDN 引用后被判违规 → 改为读取 `node_modules/3dmol/build/3Dmol-min.js` 内联。
2. （例）`file://` 下 `fetch('data.json')` 失败 → 改为内联字符串常量。
3. （例）1BRS 的接触残基只算了单向，漏掉 D 链侧 → 改为双向遍历。
4. ……

## 最有效的 prompt（题目要求写「most effective prompts」）

1. （例）"我是 Windows，没有 Python 环境，请给我只用 Node 标准库完成 X 的脚本，不要第三方依赖。"
2. （例）"下面是 3Dmol.js 的官方 API 摘要：…… 请在不引入新库的前提下实现 X，并说明每个参数的含义。"
3. ……
