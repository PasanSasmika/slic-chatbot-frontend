"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";
import { Message } from "@/types";
import clsx from "clsx";

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isAI = message.role === "model";

  return (
    <div
      className={clsx(
        "w-full flex mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500",
        isAI ? "justify-start" : "justify-end"
      )}
    >
      <div className={clsx("flex max-w-[85%] md:max-w-[70%]", isAI ? "flex-row" : "flex-row-reverse")}>
        
        {/* Avatar Bubble */}
        <div className="shrink-0">
          <div
            className={clsx(
              "h-10 w-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border border-white/50",
              isAI 
                ? "bg-white/80 text-[#0dafbc]" 
                : "bg-gradient-to-br from-[#dfc550] to-orange-400 text-white"
            )}
          >
            {isAI ? <Bot size={20} /> : <User size={20} />}
          </div>
        </div>

        {/* Message Content */}
        <div
          className={clsx(
            "mx-3 px-6 py-4 shadow-xl backdrop-blur-xl border border-white/20",
            isAI
              ? "rounded-2xl rounded-tl-none bg-white/70 text-gray-800"
              : "rounded-2xl rounded-tr-none bg-gradient-to-br from-[#0dafbc] to-[#08919e] text-white"
          )}
        >
          {isAI ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              // className="prose prose-sm max-w-none prose-headings:text-[#0dafbc] prose-a:text-[#0dafbc]"
              components={{
                table: ({node, ...props}) => <div className="overflow-x-auto"><table className="min-w-full border-collapse my-2 bg-white/50 rounded-lg overflow-hidden" {...props} /></div>,
                th: ({node, ...props}) => <th className="bg-[#0dafbc]/10 p-2 text-left text-[#0dafbc]" {...props} />,
                td: ({node, ...props}) => <td className="p-2 border-t border-gray-100" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};