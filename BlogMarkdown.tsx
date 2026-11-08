import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 文章內文的 Markdown 排版（文章標題已經是 h1，所以內文的 # 會以 h2 呈現）
const components: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ node, ...p }) => <h2 className="text-2xl md:text-3xl font-semibold text-primary mt-12 mb-5" {...p} />,
  h2: ({ node, ...p }) => <h2 className="text-2xl md:text-3xl font-semibold text-primary mt-12 mb-5" {...p} />,
  h3: ({ node, ...p }) => <h3 className="text-xl md:text-2xl font-semibold text-primary mt-8 mb-4" {...p} />,
  h4: ({ node, ...p }) => <h4 className="text-lg font-semibold text-primary mt-6 mb-3" {...p} />,
  p: ({ node, ...p }) => <p className="text-lg font-medium text-muted leading-relaxed mb-4" {...p} />,
  ul: ({ node, ...p }) => <ul className="list-disc pl-6 space-y-2 mb-4 font-semibold text-primary/90" {...p} />,
  ol: ({ node, ...p }) => <ol className="list-decimal pl-6 space-y-2 mb-4 font-semibold text-primary/90" {...p} />,
  li: ({ node, ...p }) => <li className="leading-relaxed" {...p} />,
  strong: ({ node, ...p }) => <strong className="font-bold text-primary" {...p} />,
  blockquote: ({ node, ...p }) => (
    <blockquote className="border-l-4 border-secondary/50 pl-6 my-6 text-muted font-medium italic" {...p} />
  ),
  a: ({ node, href, ...p }) => {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="text-secondary font-semibold underline underline-offset-4 hover:opacity-70"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...p}
      />
    );
  },
  img: ({ node, alt, ...p }) => (
    <img alt={alt || ""} loading="lazy" className="max-w-full h-auto rounded-2xl my-6" {...p} />
  ),
  hr: () => <hr className="my-10 border-primary/10" />,
  code: ({ node, className, children, ...p }) => (
    <code className={`${className || ""} bg-surface-low rounded px-1.5 py-0.5 text-[0.9em] font-mono`} {...p}>
      {children}
    </code>
  ),
  pre: ({ node, ...p }) => <pre className="bg-surface-low rounded-2xl p-5 my-6 overflow-x-auto text-sm" {...p} />,
  table: ({ node, ...p }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-left border-collapse" {...p} />
    </div>
  ),
  th: ({ node, ...p }) => <th className="border-b-2 border-primary/20 py-2 pr-4 font-semibold text-primary" {...p} />,
  td: ({ node, ...p }) => <td className="border-b border-primary/10 py-2 pr-4 text-muted font-medium" {...p} />,
};

const BlogMarkdown: React.FC<{ content: string }> = ({ content }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
    {content}
  </ReactMarkdown>
);

export default BlogMarkdown;
