'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Image as ImageIcon } from 'lucide-react';
import { useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addImage = useCallback(() => {
    const url = window.prompt('URL de la imagen:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const buttonClass = (isActive: boolean) => 
    `p-2 border transition-all duration-300 ${isActive ? 'bg-champagne/20 text-champagne border-champagne/40' : 'bg-transparent text-mist/50 border-graphite hover:text-ivory hover:border-mist/30'}`;

  return (
    <div className="flex flex-wrap gap-2 mb-0 p-3 bg-graphite/30 border border-graphite border-b-0">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 1 }))}
        title="Título 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
        title="Título 2"
      >
        <Heading2 size={16} />
      </button>

      <div className="w-px h-8 bg-graphite mx-1 self-center"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        title="Negrita"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        title="Cursiva"
      >
        <Italic size={16} />
      </button>

      <div className="w-px h-8 bg-graphite mx-1 self-center"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        title="Lista"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        title="Lista Numerada"
      >
        <ListOrdered size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive('blockquote'))}
        title="Cita"
      >
        <Quote size={16} />
      </button>

      <div className="w-px h-8 bg-graphite mx-1 self-center"></div>

      <button
        type="button"
        onClick={addImage}
        className={buttonClass(false)}
        title="Añadir Imagen (URL)"
      >
        <ImageIcon size={16} />
      </button>
    </div>
  );
};

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'w-full h-auto border border-graphite my-8',
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[400px] p-6 bg-obsidian border border-graphite text-ivory',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="w-full">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="font-sans tiptap-oniria" />
      
      {/* Global styles for the editor content */}
      <style jsx global>{`
        .tiptap-oniria .ProseMirror > * + * {
          margin-top: 1.5em;
        }
        .tiptap-oniria h1 {
          font-size: 2rem;
          font-weight: 300;
          font-family: 'Cormorant Garamond', serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #2A2A2E;
          padding-bottom: 0.5rem;
          margin-top: 2rem;
          color: #F5F5F3;
        }
        .tiptap-oniria h2 {
          font-size: 1.5rem;
          font-weight: 300;
          font-family: 'Cormorant Garamond', serif;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-top: 1.5rem;
          color: #F5F5F3;
        }
        .tiptap-oniria p {
          font-size: 1rem;
          line-height: 1.8;
          color: #E8E8E6;
          font-family: 'Inter', sans-serif;
        }
        .tiptap-oniria blockquote {
          border-left: 2px solid #C6A56E;
          padding-left: 1.5rem;
          font-style: italic;
          font-size: 1.1rem;
          margin: 2rem 0;
          background-color: rgba(42, 42, 46, 0.3);
          padding: 1.5rem;
          color: #E8E8E6;
        }
        .tiptap-oniria ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          font-size: 1rem;
          color: #E8E8E6;
        }
        .tiptap-oniria ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          font-size: 1rem;
          color: #E8E8E6;
        }
        .tiptap-oniria img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 2rem auto;
        }
        .tiptap-oniria .ProseMirror:focus {
          border-color: rgba(198, 165, 110, 0.5);
        }
      `}</style>
    </div>
  );
}
