"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, ThumbsUp, ThumbsDown, RefreshCw,
  Share2, Volume2, ChevronDown, Download, Check
} from "lucide-react";
import type { ChatMessage } from "./types";
import { renderMarkdown } from "@/utils/renderMarkdown";

interface AIMessageProps {
  message: ChatMessage;
  index: number;
  isDark: boolean;
  isStreaming?: boolean;
  streamingText?: string;
  onRegenerate?: () => void;
}

// ─── AI Message action bar ────────────────────────────────────────────────────

function ActionBar({
  isDark,
  content,
  onRegenerate,
}: {
  isDark: boolean;
  content: string;
  onRegenerate?: () => void;
}) {
  const [liked, setLiked] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const actions = [
    {
      icon: copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />,
      label: copied ? "Copied" : "Copy",
      onClick: handleCopy,
      active: copied,
    },
    {
      icon: <ThumbsUp className="w-3.5 h-3.5" />,
      label: "Like",
      onClick: () => setLiked(true),
      active: liked === true,
      activeColor: "#22c55e",
    },
    {
      icon: <ThumbsDown className="w-3.5 h-3.5" />,
      label: "Dislike",
      onClick: () => setLiked(false),
      active: liked === false,
      activeColor: "#ef4444",
    },
    {
      icon: <RefreshCw className="w-3.5 h-3.5" />,
      label: "Regenerate",
      onClick: onRegenerate,
    },
    {
      icon: <Share2 className="w-3.5 h-3.5" />,
      label: "Share",
      onClick: () => {},
    },
    {
      icon: <Volume2 className="w-3.5 h-3.5" />,
      label: "Speak",
      onClick: () => {
        const utterance = new SpeechSynthesisUtterance(content.slice(0, 300));
        window.speechSynthesis.speak(utterance);
      },
    },
  ];

  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "#5f6368";

  return (
    <motion.div
      className="flex items-center gap-0.5 mt-3 ml-10"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      {actions.map((action, i) => (
        <motion.button
          key={i}
          onClick={action.onClick}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] transition-colors"
          style={{
            color: action.active ? (action.activeColor || "#f59e0b") : textMuted,
          }}
          whileHover={{
            scale: 1.05,
            color: action.activeColor || "#f59e0b",
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          }}
          whileTap={{ scale: 0.92 }}
          title={action.label}
        >
          {action.icon}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ─── Main AI Message component ────────────────────────────────────────────────

export function AIMessage({
  message,
  index,
  isDark,
  isStreaming,
  streamingText,
  onRegenerate,
}: AIMessageProps) {
  const content = isStreaming ? (streamingText || "") : message.content;
  const [showCursor] = useState(true);

  return (
    <motion.div
      className="flex gap-3 mb-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.03,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {/* AI Avatar */}
      <motion.div
        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.06))",
          border: "1px solid rgba(245,158,11,0.3)",
          boxShadow: "0 0 14px rgba(245,158,11,0.15)",
        }}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
      >
        <svg width="14" height="14" viewBox="0 0 44 44" fill="none">
          <path d="M22 6L28 18H16L22 6Z" fill="rgba(245,158,11,0.9)" />
          <path d="M16 18L10 30H22L16 18Z" fill="rgba(245,158,11,0.6)" />
          <path d="M28 18L22 30H34L28 18Z" fill="rgba(245,158,11,0.75)" />
          <circle cx="22" cy="22" r="3" fill="white" opacity="0.9" />
        </svg>
      </motion.div>

      {/* Message content */}
      <div className="flex-1 min-w-0 max-w-[85%]">
        {/* Rendered markdown */}
        <div className="text-sm leading-relaxed">
          {renderMarkdown(content, isDark)}
          {/* Blinking cursor while streaming */}
          {isStreaming && (
            <motion.span
              className="inline-block w-0.5 h-4 ml-0.5 align-text-bottom rounded-full"
              style={{ background: "#f59e0b" }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>

        {/* Action bar (only for completed messages) */}
        {!isStreaming && (
          <ActionBar isDark={isDark} content={content} onRegenerate={onRegenerate} />
        )}
      </div>
    </motion.div>
  );
}

