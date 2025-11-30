/**
 * RefereeChat - Quick communication with referees
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChatMessage {
  id: string
  userId: string
  username: string
  userRole: 'ORGANIZER' | 'REFEREE' | 'ADMIN'
  message: string
  createdAt: string
  avatar?: string
}

export interface RefereeChatProps {
  messages: ChatMessage[]
  currentUserId: string
  onSendMessage?: (message: string) => void
  className?: string
}

export function RefereeChat({
  messages,
  currentUserId,
  onSendMessage,
  className,
}: RefereeChatProps) {
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (messageInput.trim() && onSendMessage) {
      onSendMessage(messageInput.trim())
      setMessageInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getRoleColor = (role: ChatMessage['userRole']) => {
    switch (role) {
      case 'ORGANIZER':
        return 'text-primary'
      case 'REFEREE':
        return 'text-orange-500'
      case 'ADMIN':
        return 'text-destructive'
    }
  }

  const getRoleBadge = (role: ChatMessage['userRole']) => {
    switch (role) {
      case 'ORGANIZER':
        return 'ORG'
      case 'REFEREE':
        return 'REF'
      case 'ADMIN':
        return 'ADM'
    }
  }

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Referee Chat
        </CardTitle>
        <span className="text-xs text-muted-foreground">{messages.length} messages</span>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-auto px-4 py-2 space-y-3">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isCurrentUser = msg.userId === currentUserId

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2',
                    isCurrentUser && 'flex-row-reverse'
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={msg.avatar} alt={msg.username} />
                    <AvatarFallback className="text-xs">
                      {getRoleBadge(msg.userRole)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      'flex flex-col gap-1 max-w-[75%]',
                      isCurrentUser && 'items-end'
                    )}
                  >
                    {/* Username & Role */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={cn('font-semibold', getRoleColor(msg.userRole))}>
                        {msg.username}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm',
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start a conversation with referees</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!messageInput.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
