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
    <div className="w-full flex justify-center">
      <div
        className={clsx(
          "relative max-w-[700px] w-full px-4 flex",
          isAI ? "justify-start" : "justify-end"
        )}
      >
        {/* Bubble */}
        <div
          className={clsx(
            "rounded-3xl px-6 py-4 mb-8 shadow-xl backdrop-blur-xl",
            "transition-transform duration-300 hover:scale-[1.01]",
            isAI
              ? "bg-white/60 text-gray-900 border border-white/40"
              : "bg-indigo-600 text-white shadow-indigo-300/40"
          )}
        >
          {isAI ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              // className="prose prose-sm max-w-none text-gray-800"
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Avatar */}
        <div
          className={clsx(
            "absolute top-0",
            isAI ? "-left-10" : "-right-10"
          )}
        >
          <div
            className={clsx(
              "h-10 w-10 rounded-2xl shadow-lg flex items-center justify-center backdrop-blur-xl",
              isAI ? "bg-white/70 text-indigo-600" : "bg-indigo-600 text-white"
            )}
          >
            {isAI ? <Bot size={18} /> : <User size={18} />}
          </div>
        </div>
      </div>
    </div>
  );
};
