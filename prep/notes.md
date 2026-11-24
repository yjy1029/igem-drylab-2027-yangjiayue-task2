# 数据与处理决策记录

## 数据来源与版本

| PDB | 下载日期 | bytes | ATOM | HETATM | sha256(前16位) |
|---|---|---|---|---|---|
| 1EMA | | | | | |
| 1M17 | | | | | |
| 1BRS | | | | | |

> 记录 sha256 的原因：RCSB 会修订条目，有了哈希才能证明"我处理的是哪个版本的数据"。

## 预处理决策

### 1EMA（GFP）
- 保留 Chain A；删除 HOH。
- **注意**：发色团 `CRO` 是**共价残基**，出现在 `ATOM` 记录中（不是 HETATM），去杂原子时**不能删掉它**。
- 高亮目标 = `CRO`。

### 1M17（EGFR + 厄洛替尼）
- 保留 Chain A；删除 HOH 及其他无关杂原子（保留配体 `AQ4`）。
- 高亮目标 = `AQ4`。

### 1BRS（Barnase–barstar）
- 仅保留 Chain A 与 Chain D；删除 HOH。
- 高亮目标 = **对侧链**（A↔D 双向），接触残基要算两次：A 中靠近 D 的、D 中靠近 A 的。

## 接触残基判据（题目原文）
> 残基任一重原子（不含氢）与高亮目标任一重原子距离 ≤ 5 Å。

实现约定：
- 重原子 = 元素不为 `H`（PDB 的 element 列，或按原子名推断）。
- 距离按欧氏距离，单位 Å；比较时用平方距离避免开方。
- 输出：每个结构一份 `prep/contacts/<ID>.json`，字段 `{pdb, target, criterion:"5A", residues:[{chain, resi, resn, minDist}]}`。