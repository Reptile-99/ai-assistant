import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import ts from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import js from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import py from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RAGSource } from '@/services/ai.service';

SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', py);
SyntaxHighlighter.registerLanguage('css', css);

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  sources?: RAGSource[];
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, timestamp, sources, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
        !isUser ? "gradient-primary shadow-lg shadow-violet-500/25" : "bg-secondary border border-border"
      )}>
        {!isUser
          ? <Bot className="w-4 h-4 text-white" />
          : <User className="w-4 h-4 text-foreground" />
        }
      </div>
      <div className={cn(
        "max-w-[85%] lg:max-w-[75%] space-y-1.5 flex flex-col",
        isUser && "items-end"
      )}>
        <div className={cn(
          "px-5 py-4 text-sm leading-relaxed",
          isUser 
            ? "bg-violet-600 text-white rounded-[1.5rem] rounded-tr-sm shadow-md"
            : "glass rounded-[1.5rem] rounded-tl-sm border-border text-foreground/90 shadow-sm"
        )}>
          {isUser ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-p:text-foreground/90 prose-p:leading-relaxed
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:text-violet-300 prose-code:bg-violet-500/10
              prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs
              prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0"
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const inline = !match && !String(children).includes('\n');
                    return !inline && match ? (
                      <div className="rounded-xl overflow-hidden my-3 border border-border/50 shadow-lg">
                        <div className="flex items-center px-4 py-2 bg-secondary/80 border-b border-border/50 text-xs text-muted-foreground font-mono">
                          {match[1]}
                        </div>
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus as any}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, borderRadius: 0, background: 'rgba(0,0,0,0.3)', padding: '1rem' }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                  className="inline-block w-1.5 h-4 bg-violet-400 ml-1 align-middle rounded-full"
                />
              )}
            </div>
          )}
        </div>
        
        {/* Sources/Citations */}
        {!isUser && sources && sources.length > 0 && (
          <div className="flex gap-1.5 flex-wrap px-1 pt-1">
            {sources.map((s, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-[10px] bg-secondary/40 border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-default"
                title={s.text}
              >
                {s.documentTitle}{s.pageCount ? ` (p.${s.pageCount})` : ''}
              </Badge>
            ))}
          </div>
        )}
        
        {timestamp && (
          <p className="text-[10px] text-muted-foreground px-2">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
