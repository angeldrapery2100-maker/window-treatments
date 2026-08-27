#!/usr/bin/env node
'use strict';
/**
 * #24-3 守卫 —— AI 客服的失败必须分层。
 *
 *   node --experimental-strip-types scripts/check-assistant-failure-codes.js
 *
 * 两部分:
 *   ① 真执行:把 assistantFailure.ts 直接跑起来,对着一批真实的上游状态码
 *      和异常验分类结果。纯文本断言证明不了分类器是对的。
 *   ② 源码级:证明 route.ts 里**没有任何**失败出口绕过 failAssistant ——
 *      这正是 #24-3 的病根(四个出口共用一句话)。覆盖率断言在这儿最关键:
 *      以后有人加第五个出口、忘了带码,守卫要变红,而不是默默放过。
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + (extra !== undefined ? '  (= ' + String(extra) + ')' : '')); }
}
function eq(name, got, want) { check(name, got === want, JSON.stringify(got)); }

(async () => {
  // ── ① 真执行 ──────────────────────────────────────────────────────────
  console.log('\n① 分类器真执行(不是文本断言)');
  const F = await import(path.join(root, 'apps/web/src/lib/assistantFailure.ts'));

  eq('429 → 限流',                F.classifyUpstreamFailure(429, ''), 'API_RATE_LIMIT');
  eq('529 → 过载',                F.classifyUpstreamFailure(529, ''), 'API_OVERLOADED');
  eq('503 → 过载',                F.classifyUpstreamFailure(503, ''), 'API_OVERLOADED');
  eq('401 → 鉴权',                F.classifyUpstreamFailure(401, ''), 'API_AUTH');
  eq('504 → 超时',                F.classifyUpstreamFailure(504, ''), 'AI_TIMEOUT');
  eq('★ 状态码归不了类时看响应体', F.classifyUpstreamFailure(500, '{"type":"overloaded_error"}'), 'API_OVERLOADED');
  eq('  响应体也认 rate_limit',    F.classifyUpstreamFailure(500, 'rate_limit_error'), 'API_RATE_LIMIT');
  eq('  都认不出来才 API_ERROR',   F.classifyUpstreamFailure(500, 'boom'), 'API_ERROR');
  eq('  状态码优先于响应体',       F.classifyUpstreamFailure(429, 'overloaded'), 'API_RATE_LIMIT');

  const abort = new Error('The operation was aborted'); abort.name = 'AbortError';
  eq('★★ AbortError 是超时,不是我们的 bug', F.classifyThrownFailure(abort), 'AI_TIMEOUT');
  /* ★ 上面那条是**两条路都能过**的:AbortError 这个名字能过,'aborted' 这个词
     也能过。只写它,等于两条分支都没被单独测到 —— 我把 name 分支写死成 false,
     测试照样全绿。下面两条把两条分支拆开各测一次。 */
  const nameOnly = new Error('signal'); nameOnly.name = 'AbortError';
  eq('  ★ 只靠 name 认(消息里一个 abort 字都没有)', F.classifyThrownFailure(nameOnly), 'AI_TIMEOUT');
  eq('  ★ 只靠消息认(name 是普通 Error)', F.classifyThrownFailure(new Error('socket timed out')), 'AI_TIMEOUT');
  eq('  TypeError 才算 FUNCTION_ERROR', F.classifyThrownFailure(new TypeError('x is not a function')), 'FUNCTION_ERROR');
  eq('  null 也别炸',                    F.classifyThrownFailure(null), 'FUNCTION_ERROR');

  check('★ 对客文案带参考码(截图就能定位到层)',
    F.assistantFailMessage('AI_TIMEOUT').includes('(Ref: AI_TIMEOUT)'));
  check('  原来那句话一个字没改',
    F.assistantFailMessage('API_ERROR').startsWith('The assistant is having trouble right now.'));
  check('★ 文案里不许带内部细节(状态码/堆栈/key)',
    F.ASSISTANT_FAIL_CODES.every((c) => !/api[_-]?key|stack|http|\d{3}/i.test(F.assistantFailMessage(c).replace(/626-451-9841/g, ''))));
  eq('我们自己抛的算 500', F.assistantFailHttpStatus('FUNCTION_ERROR'), 500);
  eq('上游的算 502',       F.assistantFailHttpStatus('API_OVERLOADED'), 502);
  check('★ 定价工具认得出来',
    F.isPricingTool('reference_estimate') && F.isPricingTool('save_estimate') && !F.isPricingTool('get_home_project'));

  // ── ② 源码级:没有出口绕过 failAssistant ────────────────────────────────
  console.log('\n② route.ts 没有失败出口绕过分层');
  const rp = path.join(root, 'apps/web/src/app/api/store/assistant/route.ts');
  const src = fs.readFileSync(rp, 'utf8');

  check('★★ 没有任何写死的「having trouble」文案留在路由里',
    src.indexOf('having trouble') < 0);
  check('★★ 每个失败出口都带码(failAssistant 的调用数 ≥ 出口数)',
    (src.match(/failAssistant\(/g) || []).length >= 5,
    (src.match(/failAssistant\(/g) || []).length);
  check('★ 上游非 2xx 走分类器,不是硬编码',
    /classifyUpstreamFailure\(res\.status, detail\)/.test(src));
  check('★★ 兜底 catch 走分类器(否则超时会被误报成我们的 bug)',
    /classifyThrownFailure\(e\)/.test(src));
  check('★★ 上游 fetch 有超时闸',
    /new AbortController\(\)/.test(src) && /signal: ctrl\.signal/.test(src)
    && /setTimeout\(\(\) => ctrl\.abort\(\), UPSTREAM_TIMEOUT_MS\)/.test(src));
  check('  闸一定关掉(finally 里 clearTimeout)',
    /} finally \{\s*\n\s*clearTimeout\(timer\)/.test(src));
  check('★ 定价工具失败单独打 QUOTE_TOOL_ERROR',
    /isPricingTool\(block\.name\) \? QUOTE_TOOL_ERROR/.test(src)
    && /isPricingTool\(block\?\.name\) \? QUOTE_TOOL_ERROR/.test(src));

  /* ★ 覆盖率:union 里声明的码,每一个都得真有人用 —— 否则就是写了一排
     好看的常量,实际全走 API_ERROR。反过来,用了一个 union 里没有的码,
     TS 会拦,但守卫也顺手确认一遍。 */
  const declared = F.ASSISTANT_FAIL_CODES;
  const libSrc = fs.readFileSync(path.join(root, 'apps/web/src/lib/assistantFailure.ts'), 'utf8');
  const usedInLib = declared.filter((c) => (libSrc.match(new RegExp("'" + c + "'", 'g')) || []).length > 1);
  const usedInRoute = declared.filter((c) => src.indexOf("'" + c + "'") >= 0);
  const covered = declared.filter((c) => usedInLib.includes(c) || usedInRoute.includes(c));
  check('★★ 每一个声明的错误码都真的有人产出(不是一排好看的常量)'
    + '(' + covered.length + '/' + declared.length + ')',
    covered.length === declared.length,
    declared.filter((c) => !covered.includes(c)).join(',') || '(无遗漏)');

  // ── ③ 前端把码显示出来 ────────────────────────────────────────────────
  console.log('\n③ 前端不吞掉服务端给的那句话');
  const cli = fs.readFileSync(path.join(root, 'apps/web/src/components/StoreAssistant.tsx'), 'utf8');
  check('★ 错误气泡显示服务端 error 原文(参考码就在里面)',
    /typeof json\?\.error === 'string' && json\.error/.test(cli));

  console.log('\n' + (fail ? '❌ ' : '✅ ') + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('HARNESS CRASH', e); process.exit(1); });
