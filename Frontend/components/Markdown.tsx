'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert prose-p:mb-1 prose-ul:mt-1 prose-ul:mb-1 prose-li:my-0 max-w-none text-[15px] leading-relaxed relative z-10 font-medium tracking-wide">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
