'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
// Create a simple error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// Node imports
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';

// Toolbar import
import ToolbarPlugin from './toolbar';

interface RichTextEditorProps {
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
      onChange={(editorState) => {
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
            try {
              const parser = new DOMParser();
              const dom = parser.parseFromString(value, 'text/html');
              const nodes = $generateNodesFromDOM(editor, dom);
              root.append(...nodes);
            } catch (error) {
              console.warn('Failed to parse HTML, treating as plain text');
              const paragraph = $createParagraphNode();
              paragraph.append($createTextNode(value));
              root.append(paragraph);
            }
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

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  editable = true,
}: RichTextEditorProps): JSX.Element {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialConfig = {
    namespace: 'rich-text-editor',
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
      paragraph: 'mb-2',
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
        code: 'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono',
        fontFamily: {
          system: '',
          Arial: 'font-family-arial',
          Helvetica: 'font-family-helvetica',
          'Times New Roman': 'font-family-times',
          Georgia: 'font-family-georgia',
          Verdana: 'font-family-verdana',
          'Trebuchet MS': 'font-family-trebuchet',
          'Courier New': 'font-family-courier',
          monospace: 'font-mono',
        },
      },
      list: {
        nested: {
          listitem: 'list-none',
        },
        ol: 'list-decimal list-inside ml-4',
        ul: 'list-disc list-inside ml-4',
        listitem: 'mb-1',
      },
      heading: {
        h1: 'text-xl font-bold mb-3 mt-2',
        h2: 'text-lg font-bold mb-2 mt-2',
        h3: 'text-base font-bold mb-2 mt-1',
      },
      quote: 'border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-2',
      code: 'bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-sm overflow-x-auto my-2',
      link: 'text-blue-600 dark:text-blue-400 underline hover:no-underline',
    },
    editable,
  };

  if (!isClient) {
    return (
      <div
        className={cn(
          'relative rounded-md border border-input bg-background text-sm ring-offset-background min-h-[200px]',
          className
        )}
      >
        <div className="p-2 border-b border-border bg-muted/50 h-12 flex items-center">
          <div className="text-muted-foreground text-sm">Loading editor...</div>
        </div>
        <div className="p-3">
          <div className="text-muted-foreground">
            {placeholder || 'Rich text editor loading...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-md border border-input bg-background text-sm ring-offset-background',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[150px] resize-none px-3 py-3 text-sm focus:outline-none"
                style={{ outline: 'none' }}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute left-3 top-3 text-sm text-muted-foreground">
                {placeholder || 'Start typing...'}
              </div>
            }
            ErrorBoundary={ErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangeHandler onChange={onChange} />
        <InitialValuePlugin value={value} />
      </LexicalComposer>
    </div>
  );
}