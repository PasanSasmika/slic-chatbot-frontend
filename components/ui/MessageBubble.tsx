import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For Tables support
import { Bot, User } from 'lucide-react';
import { Message } from '@/types';
import clsx from 'clsx';

interface Props {
  message: Message;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const isAi = message.role === 'model';

  return (
    <div className={clsx("flex w-full mb-4", isAi ? "justify-start" : "justify-end")}>
      <div className={clsx("flex max-w-[80%] md:max-w-[70%]", isAi ? "flex-row" : "flex-row-reverse")}>
        
        {/* Avatar */}
        <div className={clsx(
          " h-10 w-10 rounded-full flex items-center justify-center mx-2",
          isAi ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"
        )}>
          {isAi ? <Bot size={20} /> : <User size={20} />}
        </div>

        {/* Bubble Content */}
        <div className={clsx(
          "p-4 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden",
          isAi ? "bg-white border border-gray-200 text-gray-800" : "bg-blue-600 text-white"
        )}>
          {isAi ? (
            // Render Markdown for AI (Tables, Lists, Bold)
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
            //   className="prose prose-sm max-w-none"
              components={{
                table: ({node, ...props}) => <table className="min-w-full border-collapse border border-gray-300 my-2" {...props} />,
                th: ({node, ...props}) => <th className="bg-gray-100 border border-gray-300 px-2 py-1" {...props} />,
                td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            // Plain text for User
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};