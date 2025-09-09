'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  $isListNode,
  $isListItemNode,
  insertList,
  removeList,
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode } from 'lexical';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


export default function ToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');

  // Map block type to display values to avoid DOM issues
  const getBlockTypeForDisplay = (type: string): string => {
    switch (type) {
      case 'ul':
      case 'ol':
        return 'paragraph'; // Lists show as paragraph in heading selector
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return type;
      case 'paragraph':
      default:
        return 'paragraph';
    }
  };
  const [fontFamily, setFontFamily] = useState('system');

  const updateToolbar = useCallback(() => {
    try {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setIsBold(selection.hasFormat('bold'));
        setIsItalic(selection.hasFormat('italic'));
        setIsUnderline(selection.hasFormat('underline'));
        setIsStrikethrough(selection.hasFormat('strikethrough'));

        const anchorNode = selection.anchor.getNode();
        let element;
        try {
          element = anchorNode.getKey() === 'root'
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow();
        } catch {
          // If we can't get the element, fallback to paragraph
          setBlockType('paragraph');
          return;
        }

        const elementKey = element.getKey();
        const elementDOM = editor.getElementByKey(elementKey);

        if (elementDOM !== null && element.isAttached()) {
          if ($isListNode(element)) {
            const parentList = element.getParent();
            let type;
            if (parentList && $isListNode(parentList)) {
              type = parentList.getListType();
            } else {
              type = element.getListType();
            }
            // Ensure we have a valid list type, fallback to 'ul' if empty
            setBlockType(type || 'ul');
          } else if ($isListItemNode(element)) {
            // If we're in a list item, find the parent list
            const parentList = element.getParent();
            if (parentList && $isListNode(parentList)) {
              setBlockType(parentList.getListType() || 'ul');
            } else {
              setBlockType('paragraph');
            }
          } else {
            const type = $isHeadingNode(element)
              ? element.getTag()
              : element.getType();
            // Ensure we have a valid block type, fallback to 'paragraph' if empty
            setBlockType(type || 'paragraph');
          }
        } else {
          // Element not found or detached, fallback to paragraph
          setBlockType('paragraph');
        }
      }
    } catch {
      console.warn('Toolbar update error');
      setBlockType('paragraph');
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatText = useCallback(
    (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor]
  );

  const applyFontFamily = useCallback(
    (font: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Apply inline style for font family
          const nodes = selection.getNodes();
          nodes.forEach((node) => {
            if (node.getType() === 'text') {
              const element = editor.getElementByKey(node.getKey());
              if (element) {
                if (font === 'system') {
                  element.style.fontFamily = '';
                } else {
                  element.style.fontFamily = font;
                }
              }
            }
          });
        }
      });
    },
    [editor]
  );

  const formatHeading = useCallback(
    (headingSize: HeadingTagType | 'paragraph') => {
      if (blockType !== headingSize) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            if (headingSize === 'paragraph') {
              $setBlocksType(selection, () => $createParagraphNode());
            } else {
              $setBlocksType(selection, () => $createHeadingNode(headingSize));
            }
          }
        });
      }
    },
    [blockType, editor]
  );

  const formatBulletList = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType !== 'ul') {
          insertList(editor, 'bullet');
        } else {
          removeList(editor);
        }
      }
    });
  }, [blockType, editor]);

  const formatNumberedList = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType !== 'ol') {
          insertList(editor, 'number');
        } else {
          removeList(editor);
        }
      }
    });
  }, [blockType, editor]);

  const handleFontChange = useCallback((font: string) => {
    setFontFamily(font);
    applyFontFamily(font);
  }, [applyFontFamily]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/50">
      {/* Font Selection */}
      <Select
        value={fontFamily}
        onValueChange={handleFontChange}
      >
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue placeholder="Font Family" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="system">System Default</SelectItem>
          <SelectItem value="Arial">Arial</SelectItem>
          <SelectItem value="Helvetica">Helvetica</SelectItem>
          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          <SelectItem value="Georgia">Georgia</SelectItem>
          <SelectItem value="Verdana">Verdana</SelectItem>
          <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
          <SelectItem value="Courier New">Courier New</SelectItem>
          <SelectItem value="monospace">Monospace</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Formatting */}
      <Button
        type="button"
        variant={isBold ? 'default' : 'outline'}
        size="sm"
        onClick={() => formatText('bold')}
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={isItalic ? 'default' : 'outline'}
        size="sm"
        onClick={() => formatText('italic')}
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={isUnderline ? 'default' : 'outline'}
        size="sm"
        onClick={() => formatText('underline')}
        className="h-8 w-8 p-0"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={isStrikethrough ? 'default' : 'outline'}
        size="sm"
        onClick={() => formatText('strikethrough')}
        className="h-8 w-8 p-0"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Block Type */}
      <Select
        value={getBlockTypeForDisplay(blockType)}
        onValueChange={(value) => formatHeading(value as HeadingTagType | 'paragraph')}
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Normal</SelectItem>
          <SelectItem value="h1">Heading 1</SelectItem>
          <SelectItem value="h2">Heading 2</SelectItem>
          <SelectItem value="h3">Heading 3</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <Button
        type="button"
        variant={blockType === 'ul' ? 'default' : 'outline'}
        size="sm"
        onClick={formatBulletList}
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={blockType === 'ol' ? 'default' : 'outline'}
        size="sm"
        onClick={formatNumberedList}
        className="h-8 w-8 p-0"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
}