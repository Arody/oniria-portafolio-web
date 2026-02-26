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
    `p-2 border-2 transition-colors ${isActive ? 'bg-black text-white border-black' : 'bg-white text-black border-black hover:bg-gray-100'}`;

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-100 border-2 border-black">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 1 }))}
        title="Título 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
        title="Título 2"
      >
        <Heading2 size={18} />
      </button>

      <div className="w-px h-8 bg-gray-400 mx-2 self-center"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        title="Negrita"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        title="Cursiva"
      >
        <Italic size={18} />
      </button>

      <div className="w-px h-8 bg-gray-400 mx-2 self-center"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        title="Lista"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        title="Lista Numerada"
      >
        <ListOrdered size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive('blockquote'))}
        title="Cita"
      >
        <Quote size={18} />
      </button>

      <div className="w-px h-8 bg-gray-400 mx-2 self-center"></div>

      <button
        type="button"
        onClick={addImage}
        className={buttonClass(false)}
        title="Añadir Imagen (URL)"
      >
        <ImageIcon size={18} />
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
          class: 'w-full h-auto border-4 border-black grayscale my-8',
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4 bg-white border-2 border-black shadow-[4px_4px_0_0_#000]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="w-full">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="font-serif tiptap-brutalist" />
      
      {/* Global styles for the editor content */}
      <style jsx global>{`
        .tiptap-brutalist .ProseMirror > * + * {
          margin-top: 1.5em; /* Spacing between blocks */
        }
        .tiptap-brutalist h1 {
          font-size: 2.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.05em;
          border-bottom: 4px solid black;
          padding-bottom: 0.5rem;
          margin-top: 2rem;
        }
        .tiptap-brutalist h2 {
          font-size: 1.8rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-top: 1.5rem;
        }
        .tiptap-brutalist p {
          font-size: 1.25rem;
          line-height: 1.7;
          color: #1a1a1a;
        }
        .tiptap-brutalist blockquote {
          border-left: 8px solid black;
          padding-left: 1rem;
          font-style: italic;
          font-size: 1.5rem;
          margin: 2rem 0;
          background-color: #f3f4f6;
          padding: 1.5rem;
        }
        .tiptap-brutalist ul {
          list-style-type: square;
          padding-left: 1.5rem;
          font-size: 1.25rem;
        }
        .tiptap-brutalist ol {
          list-style-type: decimal;
          font-weight: bold;
          padding-left: 1.5rem;
          font-size: 1.25rem;
        }
        .tiptap-brutalist img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 2rem auto;
        }
      `}</style>
    </div>
  );
}
