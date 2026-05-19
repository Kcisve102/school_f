import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Settings, Trash2 } from 'lucide-react';
import { chatService, ChatMessage } from '../services/chat.service';
import toast from 'react-hot-toast';

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Add welcome message on mount
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content:
          '你好！👋 我是工厂技能AI助手。\n\n我可以帮助您了解：\n• 流水线操作与维护\n• 工业设备使用方法\n• 安全规范和程序\n• 质量控制技术\n• 机械设备（齿轮、工具等）\n• 故障排除\n\n请问有什么我可以帮助您的吗？',
      },
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send to backend with conversation history
      const response = await chatService.sendMessage(
        userMessage.content,
        messages
      );

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error('发送消息失败，请重试');

      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Refocus input after sending
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '聊天记录已清空。有什么我可以帮助您的吗？',
      },
    ]);
    toast.success('聊天记录已清空');
  };

  return (
    <div className="min-h-screen bg-[#0a0a1f] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 shadow-2xl">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                  <Settings className="w-8 h-8 text-white animate-spin-slow" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-purple-600 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  工厂技能AI助手
                </h1>
                <p className="text-purple-100 text-sm md:text-base">
                  Factory Skills AI Assistant - 专注于流水线技能培训
                </p>
              </div>
            </div>
            {/* <button
              onClick={() => navigate('/')}
              className="p-3 hover:bg-white/10 rounded-lg transition-colors"
              title="返回首页"
            >
              <Home className="w-6 h-6 text-white" />
            </button> */}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-5xl w-full mx-auto">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              } animate-fadeIn`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600'
                    : 'bg-gradient-to-br from-orange-500 to-red-500'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-6 h-6 text-white" />
                ) : (
                  <Bot className="w-6 h-6 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[70%] rounded-2xl px-6 py-4 shadow-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/5 text-gray-200 border border-white/10 backdrop-blur-sm'
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-4 animate-fadeIn">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-sm text-gray-400">AI正在思考中...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[#0f0f23] border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            {/* Quick Actions */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">
                提示：您可以用中文或英文提问，AI将用中文回答
              </p>
              <button
                onClick={handleClearChat}
                className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                title="清空聊天记录"
              >
                <Trash2 className="w-3 h-3" />
                <span>清空</span>
              </button>
            </div>

            {/* Input Box */}
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题... (按 Enter 发送，Shift+Enter 换行)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none text-sm md:text-base"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl px-6 py-4 transition-all flex items-center justify-center shadow-lg hover:shadow-purple-500/50 disabled:shadow-none"
                aria-label="发送消息"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-600 mt-3 text-center">
              🤖 AI助手由 Google Gemini 提供支持 · 回答可能不完全准确，请注意核实
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
