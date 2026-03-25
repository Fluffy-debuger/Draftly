import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Italic, BoldIcon, Code, EraserIcon, Quote, Undo, Redo, Copy, Trash2, Share2, EllipsisVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StrikeIcon } from '@/components/tiptap-icons/strike-icon'
import { Toggle } from "@/components/ui/toggle"
import debounce from 'lodash.debounce'
import './tiptap-isolated.css'

function Markdown({ containername, cellInfo, userID }) {
  const [previewtoggle, setpreviewtoggle] = useState(false)
  const isDirty = useRef(false);
  const saveToBackend = useCallback(async (content, isFinal = false) => {
    if (!isDirty.current && !isFinal) return;

    try {
      await fetch("http://127.0.0.1:8082/saveCellData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true, 
        body: JSON.stringify({
          userID: userID,
          notebookID: containername,
          cellID: cellInfo.cellID,
          code: content,
          output: cellInfo.CellData.result || ""
        })
      });
      isDirty.current = false;
      console.log("Cell auto-saved successfully");
    } catch (error) {
      console.error("Save failed:", error);
    }
  }, [userID, containername, cellInfo]);

  const debouncedSave = useCallback(
    debounce((content) => saveToBackend(content), 1500),
    [saveToBackend]
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: cellInfo.CellData.Data || '<p>Start writing...</p>',
    onUpdate: ({ editor }) => {
      isDirty.current = true;
      debouncedSave(editor.getHTML());
    },
  });
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && editor && isDirty.current) {
        saveToBackend(editor.getHTML(), true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      debouncedSave.cancel();
    };
  }, [editor, saveToBackend, debouncedSave]);

  const deleteNode = async () => {
    try {
      const req = await fetch("http://127.0.0.1:8082/deleteCodeCell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "userID": userID, "notebookID": containername, "cellID": cellInfo.cellID })
      })
      const data = await req.req.json()
      console.log(data);
    } catch (error) {
      console.log(error, "ERROR!");
    }
  }

  if (!editor) return null

  return (
    <div className='flex flex-col gap-1.5  border rounded-lg overflow-hidden bg-white'>
      <div id='header' className='flex items-center gap-2 p-2 bg-gray-50 border-b'>
        <span className="text-xs font-mono text-gray-500">{cellInfo.cellID.slice(0,8)}</span>
        <div id='headerOptions' className='ml-auto flex items-center gap-2'>
          <Toggle 
            size="sm"
            pressed={previewtoggle} 
            onPressedChange={() => setpreviewtoggle(!previewtoggle)}
          >
            {previewtoggle ? "Preview" : "Edit"}
          </Toggle>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-gray-200 transition-colors">
                <EllipsisVertical size={18} className="text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(editor.getText())}>
                <Copy className="mr-2 h-4 w-4" /> Copy Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={deleteNode} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Cell
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="tiptap-wrapper p-4 min-h-[120px]">
        {previewtoggle ? (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {!previewtoggle && (
        <div id="TextEditorController" className='flex flex-row  justify-center items-center m-1 gap-2'>
          <div className="flex flex-row gap-1.5">
            <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              {/* <img width="25" height="25" src="https://img.icons8.com/ios-glyphs/32/undo.png" alt="undo" /> */}
              <Undo/>
            </button>
            <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              {/* <img width="25" height="25" src="https://img.icons8.com/ios-glyphs/24/redo.png" alt="redo" /> */}
              <Redo/>
            </button>
          </div>

          <div className=' border-l-2 border-black h-5'></div>

          <DropdownMenu>
            <DropdownMenuTrigger>Heading</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Heading Option</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[1,2,3,4,5].map(level => (
                <DropdownMenuItem key={level}>
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                    className={editor.isActive('heading', { level }) ? 'is-active' : ''}
                  >
                    H{level}
                  </button>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem>
                <button
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  className={editor.isActive('paragraph') ? 'is-active' : ''}
                >
                  Paragraph
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className=' border-l-2 border-black h-5'></div>

          <div className='flex flex-row gap-1.5'>
            <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().toggleBold()} className={editor.isActive('bold') ? 'is-active' : ''}>
              <BoldIcon />
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().toggleItalic()} className={editor.isActive('italic') ? 'is-active' : ''}>
              <Italic className='h-5' />
            </button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().toggleStrike()} className={editor.isActive('strike') ? 'is-active' : ''}>
              <StrikeIcon className="h-5" />
            </button>
            <button onClick={() => editor.chain().focus().toggleCode().run()} disabled={!editor.can().toggleCode()} className={editor.isActive('code') ? 'is-active' : ''}>
              <Code />
            </button>
            <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
              <EraserIcon />
            </button>
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}>
              <Quote />
            </button>
          </div>

          <div className=' border-l-2 border-black h-5'></div>

          <DropdownMenu>
            <DropdownMenuTrigger>List</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>List Option</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>
                  Bullet list
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}>
                  Ordered list
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

export default Markdown