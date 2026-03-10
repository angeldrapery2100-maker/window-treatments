// 拆分 products-data.json 为：
// 1. products-index.json (列表页精简数据)
// 2. products/{slug}.json (每个产品完整数据)
//
// 使用方法: 在项目根目录运行 node scripts/split-products.js

const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'apps', 'web', 'public', 'hunter-douglas');
const inputPath = path.join(baseDir, 'products-data.json');
const productsDir = path.join(baseDir, 'products');

// 读取原始数据
const raw = fs.readFileSync(inputPath, 'utf-8');
const products = JSON.parse(raw);

console.log(`共 ${products.length} 个产品`);

// 检查重复 slug
const slugCount = {};
products.forEach(p => {
  slugCount[p.slug] = (slugCount[p.slug] || 0) + 1;
});
const dupes = Object.entries(slugCount).filter(([_, v]) => v > 1);
if (dupes.length > 0) {
  console.log('\n⚠️  发现重复 slug:');
  dupes.forEach(([slug, count]) => {
    console.log(`   "${slug}": 出现 ${count} 次`);
    products.forEach((p, i) => {
      if (p.slug === slug) console.log(`     索引 ${i}: id=${p.id}, name=${p.name}`);
    });
  });
  console.log('   → 重复的 slug 只保留第一个\n');
}

// 创建 products 目录
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// 去重：同 slug 只保留第一个
const seen = new Set();
const uniqueProducts = products.filter(p => {
  if (seen.has(p.slug)) return false;
  seen.add(p.slug);
  return true;
});

// 生成 products-index.json (只包含列表页需要的字段)
const index = uniqueProducts.map(p => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  cover_image: p.cover_image,
  stats: p.stats
}));

const indexPath = path.join(baseDir, 'products-index.json');
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
const indexSize = fs.statSync(indexPath).size;
console.log(`✅ products-index.json: ${(indexSize / 1024).toFixed(1)} KB (${uniqueProducts.length} 个产品)`);

// 生成每个产品的单独文件
let totalDetailSize = 0;
uniqueProducts.forEach(p => {
  const filePath = path.join(productsDir, `${p.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(p, null, 2));
  totalDetailSize += fs.statSync(filePath).size;
});

console.log(`✅ products/ 目录: ${uniqueProducts.length} 个文件, 共 ${(totalDetailSize / 1024).toFixed(1)} KB`);
console.log(`\n📊 对比:`);
console.log(`   原始文件: ${(fs.statSync(inputPath).size / 1024).toFixed(1)} KB`);
console.log(`   列表页只需加载: ${(indexSize / 1024).toFixed(1)} KB (减少 ${((1 - indexSize / fs.statSync(inputPath).size) * 100).toFixed(0)}%)`);
console.log(`\n🎉 拆分完成！`);
