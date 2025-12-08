import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, MessageRole, FileArtifact } from '../types';
import { FileArtifactCard } from './FileArtifactCard';
import { Bot, User, MapPin, ExternalLink, Coins } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onPreview: (artifact: FileArtifact) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onPreview }) => {
  const isModel = message.role === MessageRole.MODEL;

  // Estimate cost: ~$0.30 per 1M output tokens (Flash)
  const estimateCost = (tokens: number) => {
    const cost = (tokens / 1000000) * 0.30 * 32; // ~32 TWD per USD
    if (cost < 0.01) return '< 0.01';
    return cost.toFixed(2);
  };

  return (
    <div className={`flex w-full mb-6 animate-fade-in ${isModel ? 'justify-start' : 'justify-end'}`}>
      {isModel && (
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 mr-2 flex-shrink-0 shadow-sm self-start mt-1">
          <Bot className="w-6 h-6 text-line-dark" />
        </div>
      )}

      <div className={`flex flex-col max-w-[85%] sm:max-w-[80%]`}>
        {isModel && <span className="text-xs text-gray-500 mb-1 ml-1">AI Assistant</span>}
        
        <div
          className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
            ${
              isModel
                ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                : 'bg-line-bubble text-gray-900 rounded-tr-none'
            }
          `}
        >
            {/* Image Attachments Display (User sent) */}
            {message.attachments && message.attachments.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                    {message.attachments.map(att => (
                        att.mimeType.startsWith('image/') && (
                            <img 
                                key={att.id} 
                                src={`data:${att.mimeType};base64,${att.data}`} 
                                alt="attachment" 
                                className="max-w-full h-auto max-h-48 rounded-lg border border-black/10"
                            />
                        )
                    ))}
                </div>
            )}

            <div className="markdown-container overflow-hidden">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Code blocks
                        code({node, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '')
                            const isInline = !match && !String(children).includes('\n');
                            
                            return !isInline ? (
                                <code className={`${className} block bg-slate-800 text-slate-100 p-3 rounded-lg my-3 text-xs overflow-x-auto font-mono shadow-sm border border-slate-700`} {...props}>
                                    {children}
                                </code>
                            ) : (
                                <code className="bg-black/10 px-1.5 py-0.5 rounded text-[0.9em] font-mono text-inherit mix-blend-multiply" {...props}>
                                    {children}
                                </code>
                            )
                        },
                        // Headings
                        h1: ({children}) => <h1 className="text-lg font-bold mt-4 mb-2 border-b border-gray-200 pb-1">{children}</h1>,
                        h2: ({children}) => <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
                        // Lists
                        ul: ({children}) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="pl-1">{children}</li>,
                        // Paragraphs
                        p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        // Links
                        a: ({href, children}) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all inline-flex items-center gap-0.5">
                                {children} <ExternalLink size={10} />
                            </a>
                        ),
                        // Blockquotes
                        blockquote: ({children}) => (
                            <blockquote className="border-l-4 border-gray-300 pl-3 py-1 my-2 italic text-gray-600 bg-gray-50 rounded-r">
                                {children}
                            </blockquote>
                        ),
                        // Tables
                        table: ({children}) => (
                            <div className="overflow-x-auto my-3 rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200 bg-white">
                                    {children}
                                </table>
                            </div>
                        ),
                        thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
                        tbody: ({children}) => <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>,
                        tr: ({children}) => <tr className="hover:bg-gray-50 transition-colors">{children}</tr>,
                        th: ({children}) => (
                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                {children}
                            </th>
                        ),
                        td: ({children}) => (
                            <td className="px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap border-r border-gray-100 last:border-r-0">
                                {children}
                            </td>
                        ),
                        // Horizontal Rule
                        hr: () => <hr className="my-4 border-gray-200" />
                    }}
                >
                    {message.text}
                </ReactMarkdown>
            </div>
        </div>

        {/* Google Maps / Grounding Sources */}
        {message.groundingMetadata?.groundingChunks && (
            <div className="mt-2 flex flex-col gap-1">
                {message.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                    if (chunk.web?.uri) {
                         return (
                            <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="bg-white/80 p-2 rounded-lg text-xs text-blue-600 flex items-center gap-2 border border-blue-100 hover:bg-blue-50 transition-colors w-fit">
                                <ExternalLink size={12} />
                                {chunk.web.title || "Reference Source"}
                            </a>
                         )
                    }
                    return null;
                })}
            </div>
        )}

        {/* Render Artifacts (Files) below the message bubble if they exist */}
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.artifacts.map((artifact) => (
              <FileArtifactCard 
                  key={artifact.id} 
                  artifact={artifact} 
                  onPreview={onPreview}
              />
            ))}
          </div>
        )}

        <div className={`flex items-center gap-2 mt-1 ${isModel ? 'ml-1' : 'justify-end mr-1'}`}>
            <span className="text-[10px] text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {/* Cost Transparency */}
            {message.usage && (
                <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-black/5 px-1.5 py-0.5 rounded-full">
                    <Coins size={8} />
                    {message.usage.totalTokens} tokens (~NT${estimateCost(message.usage.totalTokens)})
                </span>
            )}
        </div>
      </div>

      {!isModel && (
         <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center ml-2 flex-shrink-0 overflow-hidden self-start mt-1">
             <User className="w-6 h-6 text-gray-500" />
         </div>
      )}
    </div>
  );
};
