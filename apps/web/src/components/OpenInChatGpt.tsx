'use client'

import { useState } from 'react'
import { tr, type UiLanguage } from '@/lib/uiLanguage'
import { customerGptUrl, referralOpeningLine, copyText, logGptOpen } from '@/lib/customerGpt'

/**
 * 「在 ChatGPT 里打开」(P3 §B-6)。
 *
 * 归因不能靠 URL 参数 —— 见 lib/customerGpt.ts 顶部那段实测结论。所以这个按钮
 * 干三件事:复制带 token 的开场口令 → 开 GPT → 在页面上明说「请粘贴发送」。
 * 复制失败(Safari 权限、非安全上下文)也要看得见:口令原样显示在一个可选中的
 * 框里,长按就能拷。**绝不因为复制失败就不给开链接**。
 */
export default function OpenInChatGpt({
  token, language, className = '', variant = 'primary',
}: {
  token: string
  language: UiLanguage
  className?: string
  /** 落地页上主 CTA 是「预约免费量窗」,这个按钮别抢戏 —— 用 secondary。 */
  variant?: 'primary' | 'secondary'
}) {
  const url = customerGptUrl()
  const line = referralOpeningLine(token, language === 'zh' ? 'zh' : 'en')
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle')
  if (!url) return null

  const onClick = () => {
    logGptOpen()
    if (!line) return                       // 没有可用 token:就是一个普通的「打开 GPT」
    // 剪贴板写入必须留在用户手势里,所以这里同步发起、不 await。
    copyText(line).then((ok) => setState(ok ? 'copied' : 'manual'))
  }

  return (
    <div className={className}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={
          variant === 'secondary'
            ? 'block w-full rounded-full border border-gray-400 px-5 py-2.5 text-center text-[14px] text-[#12141C] transition-colors hover:border-[#12141C] hover:bg-[#12141C] hover:text-white'
            : 'inline-block rounded-full border border-[#12141C] px-6 py-2.5 text-[14px] transition-colors hover:bg-[#12141C] hover:text-white'
        }
      >
        {tr(language, 'Open in ChatGPT', '在 ChatGPT 里打开')}
      </a>

      {line && state !== 'idle' && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-left">
          <p className="text-[13px] font-medium text-[#12141C]">
            {state === 'copied'
              ? tr(language,
                  'Opening line copied — paste it as your first message in ChatGPT and send.',
                  '开场口令已复制 —— 请在 ChatGPT 里粘贴发送。')
              : tr(language,
                  'Copy this line and send it as your first message in ChatGPT:',
                  '请复制下面这句话，在 ChatGPT 里作为第一条消息发送：')}
          </p>
          <p className="mt-2 select-all break-all rounded-lg bg-white px-3 py-2 font-mono text-[12px] text-gray-700">
            {line}
          </p>
          <p className="mt-2 text-[12px] text-gray-500">
            {tr(language,
                'It tells the advisor who referred you, so your friend still gets credit.',
                '它是用来告诉顾问是谁推荐你来的，朋友的推荐才算数。')}
          </p>
        </div>
      )}

      {line && state === 'idle' && (
        <p className="mt-2 text-[12px] text-gray-500">
          {tr(language,
              'We will copy a short opening line for you — paste it in ChatGPT so your referral counts.',
              '点击后会复制一句开场口令 —— 在 ChatGPT 里粘贴发送，推荐才算数。')}
        </p>
      )}
    </div>
  )
}
