'use client';

import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
// Simple error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { cn } from '@/lib/utils';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';

interface EditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

function OnChangeHandler({ onChange }: { onChange?: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  return (
    <OnChangePlugin
      onChange={() => {
        editor.update(() => {
          if (onChange) {
            const htmlString = $generateHtmlFromNodes(editor, null);
            onChange(htmlString);
          }
        });
      }}
    />
  );
}

function InitialValuePlugin({ value }: { value?: string }) {
  const [editor] = useLexicalComposerContext();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      if (value && value.trim() !== '') {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          
          // If it's HTML, parse it
          if (value.includes('<') && value.includes('>')) {
            const parser = new DOMParser();
            const dom = parser.parseFromString(value, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            root.append(...nodes);
          } else {
            // If it's plain text, create a simple paragraph
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(value));
            root.append(paragraph);
          }
        });
      }
    }
  }, [editor, value]);

  return null;
}

export default function Editor({
  value,
  onChange,
  placeholder,
  className,
  editable = true,
}: EditorProps) {
  const initialConfig = {
    namespace: 'agent-notes-editor',
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
    ],
    onError: (error: Error) => {
      console.error('Lexical Error:', error);
    },
    theme: {
      root: 'p-0',
      paragraph: 'mb-1',
      text: {
        bold: 'font-semibold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
        code: 'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono',
      },
      list: {
        nested: {
          listitem: 'list-none',
        },
        ol: 'list-decimal list-inside',
        ul: 'list-disc list-inside',
        listitem: 'ml-8',
      },
      heading: {
        h1: 'text-xl font-bold mb-2',
        h2: 'text-lg font-bold mb-2',
        h3: 'text-base font-bold mb-1',
      },
      quote: 'border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400',
      code: 'bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-sm overflow-x-auto',
      link: 'text-blue-600 dark:text-blue-400 underline hover:no-underline',
    },
    editable,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={cn(
          'relative rounded-md border border-input bg-background text-sm ring-offset-background',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          className
        )}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="min-h-[100px] resize-none px-3 py-2 text-sm focus:outline-none"
              style={{ outline: 'none' }}
            />
          }
          placeholder={
            <div className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
              {placeholder || 'Any additional notes or comments about this agent...'}
            </div>
          }
          ErrorBoundary={ErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <LinkPlugin />
        <AutoLinkPlugin matchers={[]} />
        <OnChangeHandler onChange={onChange} />
        <InitialValuePlugin value={value} />
      </div>
    </LexicalComposer>
  );
}