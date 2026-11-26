import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
const file = path.join(here, '..', 'clean', '1M17.pdb');
const text = fs.readFileSync(file, 'latin1');
const lines = text.split('\n');

// ---------- ① 解析：每行原子 → 一个对象 ----------
const atoms = [];
for (const line of lines) {
    if (line.length < 54) continue;
    const rec = line.substring(0, 6).trim();
    if (rec !== 'ATOM' && rec !== 'HETATM') continue;

    atoms.push({
        rec: rec,
        resn: line.substring(17, 20).trim(),
        ch: line.substring(21, 22),
        resi: parseInt(line.substring(22, 26), 10),
        el: line.substring(76, 78).trim(),
        x: parseFloat(line.substring(30, 38)),
        y: parseFloat(line.substring(38, 46)),
        z: parseFloat(line.substring(46, 54)),
    });
}
console.log('原子总数 =', atoms.length);

// ---------- ② 分成两组（只要重原子）----------
const targets = atoms.filter((a) => a.resn === 'AQ4' && a.el !== 'H');
const protein = atoms.filter((a) => a.resn !== 'AQ4' && a.el !== 'H');
console.log('目标原子 =', targets.length);
console.log('蛋白原子 =', protein.length);

// ---------- ③ 每个残基到目标的最小平方距离 ----------
const CUT = 5.0;
const CUT2 = CUT * CUT;
const best = {};

for (const p of protein) {
    const key = p.ch + '|' + p.resi + '|' + p.resn;
    for (const t of targets) {
        const dx = p.x - t.x;
        const dy = p.y - t.y;
        const dz = p.z - t.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (best[key] === undefined || d2 < best[key]) {
            best[key] = d2;
        }
    }
}

// ---------- ④ 筛出 ≤ 5 Å，按距离排序 ----------
const contacts = [];
for (const key of Object.keys(best)) {
    const d2 = best[key];
    if (d2 <= CUT2) {
        contacts.push({ key: key, dist: Math.sqrt(d2) });
    }
}
contacts.sort((a, b) => a.dist - b.dist);

console.log('接触残基 =', contacts.length);
console.log('------------------------');
for (const c of contacts) {
    console.log(c.key.padEnd(12), c.dist.toFixed(2));
}