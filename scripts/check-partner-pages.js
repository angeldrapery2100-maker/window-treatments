#!/usr/bin/env node
'use strict';
/**
 * 整改 #24-1 / #24-2 守卫。
 *
 *   node scripts/check-partner-pages.js
 *
 * #24-2 的病根是「客户扫码时可能看到 Agent 的后台信息」。拆成两层之后,
 * 最容易发生的回归是**有人把某一块又加回第一层**(或者新加一块 Agent
 * 专属信息时顺手加错页)。所以这里不写「不许出现 W-9」这种一次性断言,
 * 而是维护一张 AGENT_ONLY 清单:每一项都必须**在第二层出现、在第一层
 * 不出现**。加新块的人只要把标记加进清单,守卫就替他盯着。
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + (extra !== undefined ? '  (= ' + String(extra) + ')' : '')); }
}
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const SHARE   = 'apps/web/src/app/partner/[token]/PartnerClient.tsx';
const DETAILS = 'apps/web/src/app/partner/[token]/details/PartnerDetailsClient.tsx';
const DPAGE   = 'apps/web/src/app/partner/[token]/details/page.tsx';
const SPAGE   = 'apps/web/src/app/partner/[token]/page.tsx';
const LANDING = 'apps/web/src/app/r/[token]/ReferralLanding.tsx';

const share = read(SHARE), details = read(DETAILS);

/* ★ 负向断言必须跑在**去掉注释**的源码上。
   我在第一层留了一句注释解释「W-9 / 佣金搬去 details 了」—— 那是给下一个
   改这页的人看的,不是渲染出来的文案。拿原文断言会把这句注释判成「泄露」,
   于是守卫开始对着一个不存在的问题变红,真出问题时反而没人信它。
   (这两个页面里的注释全是块注释,所以只剥块注释就够,不去碰 // ——
    免得把 https:// 这种也剥掉。) */
function stripComments(src) {
  return src.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}
const shareCode = stripComments(share);
const detailsCode = stripComments(details);

console.log('\n① #24-2 Agent 后台信息不许留在「递给客户扫」的那一屏');
/* 每一项:第二层必须有,第一层必须没有。加新的 Agent 专属块 → 往这加一行。 */
const AGENT_ONLY = [
  ['推荐/成交计数',   'stats.referredLeads'],
  ['「你的推荐」标题', 'Your referrals'],
  ['已成交计数',      'stats.signed'],
  ['W-9 标题',        'Tax form (W-9)'],
  ['W-9 上传大小闸',  'W9_MAX_BYTES'],
  ['W-9 上传接口',    '/api/referral/w9'],
  ['佣金口径那句话',  'Commission cannot be paid'],
  ['佣金答疑那句话',  'your commission'],
];
AGENT_ONLY.forEach(([label, marker]) => {
  check('★ ' + label + ':第二层有',   details.indexOf(marker) >= 0, marker);
  check('★★ ' + label + ':第一层没有', shareCode.indexOf(marker) < 0, marker);
});
check('★★ 第一层一个「佣金 / commission」字都不出现',
  !/commission/i.test(shareCode) && shareCode.indexOf('佣金') < 0);
check('★ 第一层还留着真正该给客户看的东西(QR + 链接 + 推荐码)',
  share.indexOf('portal.shareUrl') > 0 && share.indexOf('portal.referralCode') > 0
  && share.indexOf('qr') > 0);
check('★ 第一层有通往第二层的入口(不然 Agent 再也看不到自己的数据)',
  /href=\{`\/partner\/\$\{portal\.token\}\/details`\}/.test(share));
check('★★ 那个入口的文案是中性的(写成「还差 W-9」等于把它又贴回客户眼前)',
  !/W-?9/i.test(shareCode));
check('★ 第二层能一步回到分享页',
  /href=\{`\/partner\/\$\{portal\.token\}`\}/.test(details));

console.log('\n② 两层都不许出现金额,两层都 noindex');
[[SHARE, shareCode], [DETAILS, detailsCode]].forEach(([rel, src]) => {
  const nm = rel.split('/').pop();
  check('★★ ' + nm + ' 没有美元金额',
    !/\$\s?\d/.test(src.replace(/\$\{[^}]*\}/g, '')));
  check('  ' + nm + ' 没有费率字段', src.indexOf('defaultCommissionPct') < 0 && src.indexOf('commissionPct') < 0);
});
check('★ Share 页 noindex',   /robots: \{ index: false, follow: false \}/.test(read(SPAGE)));
check('★★ Details 页 noindex', /robots: \{ index: false, follow: false \}/.test(read(DPAGE)));
check('★ Details 页同样卡 token 合法性与 partner 类型',
  /isValidReferralToken\(token\)/.test(read(DPAGE)) && /PARTNER_TYPES\.includes\(portal\.type\)/.test(read(DPAGE)));

console.log('\n③ #24-1 推荐落地页:浏览产品是主路径,不是页尾的文字链接');
const land = read(LANDING);
const iIntro = land.indexOf('made in our own Los Angeles workroom');
const iBrowse = land.indexOf("href=\"/products\"");
const iSteps = land.indexOf('{/* ── Three steps');
check('★★ 「浏览产品」排在公司介绍之后、三步卡片之前',
  iIntro > 0 && iBrowse > iIntro && iSteps > iBrowse,
  'intro=' + iIntro + ' browse=' + iBrowse + ' steps=' + iSteps);
check('★★ 全页只有一个「浏览产品」入口(出现两次,上面那个就不像主路径了)',
  (land.match(/href="\/products"/g) || []).length === 1,
  (land.match(/href="\/products"/g) || []).length);
check('★ 它是个按钮不是灰色文字链接(有描边 + 44px 以上触控目标)',
  /border-2 border-\[#12141C\][\s\S]{0,200}?min-h-\[48px\]|min-h-\[48px\][\s\S]{0,200}?border-2 border-\[#12141C\]/.test(land));
/* 主路径顺序:公司介绍 → 浏览产品 → 量窗 → 问 AI → 免费上门量窗 */
const order = ['量窗户', '问 AI', '免费上门量窗'].map((t) => land.indexOf("'" + t + "'"));
check('★ 三步卡片顺序仍是 量窗 → 问 AI → 免费上门量窗',
  order.every((n) => n > 0) && order[0] < order[1] && order[1] < order[2], order.join(','));
check('  实心深色主按钮仍然留给「问 AI 顾问」(别让浏览产品盖过出线索的那一步)',
  /bg-\[#12141C\][^"]*"\s*>\s*\{tr\(language, 'Ask our AI consultant'/.test(land)
  || land.indexOf("Ask our AI consultant") > 0);

console.log('\n' + (fail ? '❌ ' : '✅ ') + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
