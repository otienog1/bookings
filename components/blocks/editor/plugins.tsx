import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import ContentEditable from './content-editable';
import Placeholder from './placeholder';
import { TRANSFORMERS } from '@lexical/markdown';

export default function EditorPlugins(): JSX.Element {
  return (
    <>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<Placeholder />}
        ErrorBoundary={({ children }) => <div>{children}</div>}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ListPlugin />
      <LinkPlugin />
      <AutoLinkPlugin matchers={[]} />
      <TablePlugin hasCellMerge={false} hasCellBackgroundColor={false} />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <CheckListPlugin />
      <ClickableLinkPlugin disabled={false} />
      <TabIndentationPlugin />
    </>
  );
}