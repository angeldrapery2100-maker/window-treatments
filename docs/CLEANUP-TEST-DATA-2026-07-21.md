# 测试脏数据清理指引（P0-5 后续，2026-07-21）

7/20–7/21 两轮黑盒测试通过真实业务通道产生了假客户/假线索/持久化测试数据。分两侧清理。
以后测试一律使用 **555-01xx 电话 + @example.com 邮箱** —— W6 部署后这类身份会被服务端直接拦截（`test_identity_blocked`），不再产生任何真实副作用。

## 一、AAPP 侧（Firebase，Eddie 在 AAPP 后台/console 操作）

按电话/邮箱找到并删除**客户档案 + 关联 inquiry/线索**（注意 Taylor 已被标为 "existing client"，说明进了客户库不只是 inquiry 列表）：

- `Taylor Nguyen` / `323-555-0148`（7/21 测试身份，触发过 2 条内部提醒短信 + 2 次客户短信发送尝试）
- `Test Customer` / `555-0100` / `test-f@example.com`（7/20 测试身份，至少 2 封发往 @example.com 的邮件尝试）
- 稳妥起见：搜索 7/20–7/21 期间创建、电话匹配 `*555-01*` 的所有线索/客户，逐一确认删除。
- 顺带检查这些假线索是否触发了任何待跟进任务/回拨队列，一并取消。

## 二、网站侧（Postgres，psql 连生产库执行）

先看数量再删（每条 DELETE 前面都给了对应 SELECT 预检）：

```sql
-- 1) 游客聊天历史存量（游客读写已在 991fbf9 移除，旧行只剩泄露风险，全部清掉；u: 开头的登录用户行保留）
SELECT count(*) FROM assistant_chat WHERE owner_key LIKE 'a:%';
DELETE FROM assistant_chat WHERE owner_key LIKE 'a:%';

-- 2) 测试期间的 lead 事件（按时间窗，PT 7/20 00:00 起）
SELECT type, count(*) FROM lead_events
 WHERE created_at >= '2026-07-20 07:00:00+00' GROUP BY type ORDER BY 2 DESC;
-- 确认数量符合测试规模后：
DELETE FROM lead_events WHERE created_at >= '2026-07-20 07:00:00+00';
-- （如测试期间有真实客户流量，请改为按测试时段/已知测试 anon_id 精确删除，不要整窗清。）

-- 3) 测试产生的测量表窗口（label/notes 含测试痕迹的先看一眼）
SELECT id, label, created_at FROM measured_windows
 WHERE created_at >= '2026-07-20 07:00:00+00' ORDER BY created_at;
DELETE FROM measured_windows WHERE created_at >= '2026-07-20 07:00:00+00';

-- 4) 测试产生的 Home Project（notes 里可能存有 Jamie/Taylor 的姓名电话——这就是 F6 泄露源）
SELECT p.id, p.name, p.created_at, count(i.id) AS items
  FROM home_projects p LEFT JOIN project_items i ON i.project_id = p.id
 WHERE p.created_at >= '2026-07-20 07:00:00+00' GROUP BY p.id ORDER BY p.created_at;
DELETE FROM project_items WHERE project_id IN
  (SELECT id FROM home_projects WHERE created_at >= '2026-07-20 07:00:00+00');
DELETE FROM home_projects WHERE created_at >= '2026-07-20 07:00:00+00';

-- 5) 测试产生的售后工单（先看，确认全是测试单再删）
SELECT id, ticket_type, created_at, left(message, 60) FROM support_tickets
 WHERE created_at >= '2026-07-20 07:00:00+00' ORDER BY created_at;
-- DELETE FROM support_tickets WHERE id IN (…确认后的 id 列表…);

-- 6) 存量 PII 扫尾：老的 project notes / 测量表里残留的电话邮箱（W6 起写入时已剥离，这里清历史存量）
SELECT id, notes FROM project_items WHERE notes ~ '\d{3}[-. )]?\d{3}[-. ]?\d{4}' OR notes ILIKE '%@%';
-- 逐条人工确认后 UPDATE project_items SET notes = regexp_replace(...) 或直接清空 notes。
```

执行时段建议避开客户活跃时间；`assistant_chat` 那条无脑执行即可（游客行已无任何读取方）。
