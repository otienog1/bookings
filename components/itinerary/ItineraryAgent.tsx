'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot,
  Send,
  CheckCircle2,
  Lightbulb,
  FileText,
  Loader2,
  User,
  Sparkles,
  ArrowUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { config } from '@/config/environment';

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

interface ItineraryAgentProps {
  itineraryId: string;
  token: string | null;
}

export default function ItineraryAgent({ itineraryId, token: authToken }: ItineraryAgentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationReport, setValidationReport] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryType, setSummaryType] = useState<'overview' | 'daily' | 'highlights' | 'logistics'>('overview');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Using auth token:', !!authToken);

      const conversationHistory = messages.map(msg => ({
        [msg.role]: msg.content
      }));

      const response = await fetch(config.getApiUrl('/api/scraper/agent/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: input,
          itinerary_id: itineraryId,
          conversation_history: conversationHistory
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response statusText:', response.statusText);

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}`);
      }
      console.log('Parsed data:', data);

      if (data.success) {
        const agentMessage: Message = {
          role: 'agent',
          content: data.data.message,
          timestamp: data.data.timestamp
        };
        setMessages(prev => [...prev, agentMessage]);
      } else {
        console.error('API Error Response:', data);
        throw new Error(data.message || data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'agent',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Please try again.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateItinerary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        config.getApiUrl(`/api/scraper/agent/validate/${itineraryId}`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({})
        }
      );

      const data = await response.json();

      if (data.success) {
        setValidationReport(data.data.validation_report);
      } else {
        throw new Error(data.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Error validating itinerary:', error);
      setValidationReport('Failed to validate itinerary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getImprovements = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        config.getApiUrl(`/api/scraper/agent/improve/${itineraryId}`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({})
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.data.suggestions);
      } else {
        throw new Error(data.message || 'Failed to get suggestions');
      }
    } catch (error) {
      console.error('Error getting improvements:', error);
      setSuggestions('Failed to get improvement suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async (type: 'overview' | 'daily' | 'highlights' | 'logistics') => {
    setIsLoading(true);
    setSummaryType(type);
    try {
      const response = await fetch(
        config.getApiUrl(`/api/scraper/agent/summary/${itineraryId}`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ summary_type: type })
        }
      );

      const data = await response.json();

      if (data.success) {
        setSummary(data.data.summary);
      } else {
        throw new Error(data.message || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Itinerary Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Ask questions, validate, get suggestions, or generate summaries for this itinerary
        </p>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">
              <Bot className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="validate">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Validate
            </TabsTrigger>
            <TabsTrigger value="improve">
              <Lightbulb className="h-4 w-4 mr-2" />
              Improve
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            {messages.length > 0 && (
              <ScrollArea className="h-[400px] rounded-md border p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.role === 'agent' && (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.role === 'agent' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-sm">{children}</li>,
                                h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 first:mt-0">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-2 first:mt-0">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1 first:mt-0">{children}</h3>,
                                code: ({ children, className }) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="bg-muted-foreground/10 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                                  ) : (
                                    <code className={`${className} block bg-muted-foreground/10 p-2 rounded text-xs font-mono overflow-x-auto`}>{children}</code>
                                  );
                                },
                                pre: ({ children }) => <pre className="my-2 overflow-x-auto">{children}</pre>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <p className="text-sm text-muted-foreground">Thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            <div className="relative flex items-end gap-2 rounded-lg border bg-background shadow-sm p-2">
              <Textarea
                placeholder="What accommodations are included?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isLoading}
                className="min-h-[60px] resize-none border-0 bg-transparent p-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={2}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-8 w-8 rounded-full shrink-0 mb-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Validate Tab */}
          <TabsContent value="validate" className="space-y-4">
            <div className="flex flex-col gap-4">
              <Button onClick={validateItinerary} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Validate Itinerary
                  </>
                )}
              </Button>

              {validationReport && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Validation Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-2 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1 first:mt-0">{children}</h3>,
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-muted-foreground/10 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                            ) : (
                              <code className={`${className} block bg-muted-foreground/10 p-2 rounded text-xs font-mono overflow-x-auto`}>{children}</code>
                            );
                          },
                          pre: ({ children }) => <pre className="my-2 overflow-x-auto">{children}</pre>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                        }}
                      >
                        {validationReport}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Improve Tab */}
          <TabsContent value="improve" className="space-y-4">
            <div className="flex flex-col gap-4">
              <Button onClick={getImprovements} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Get Improvement Suggestions
                  </>
                )}
              </Button>

              {suggestions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Improvement Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-2 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1 first:mt-0">{children}</h3>,
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-muted-foreground/10 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                            ) : (
                              <code className={`${className} block bg-muted-foreground/10 p-2 rounded text-xs font-mono overflow-x-auto`}>{children}</code>
                            );
                          },
                          pre: ({ children }) => <pre className="my-2 overflow-x-auto">{children}</pre>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                        }}
                      >
                        {suggestions}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
