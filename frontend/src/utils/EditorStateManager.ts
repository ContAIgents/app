import { IContentBlock } from "@/AppContext";

class EditorStateManager {
  private editors: IContentBlock[] = [
    {   id: 1,
        content: 'Hello World',
        comments: [
          {
            timestamp: '2021-08-01',
            user: 'John Doe',
            comment: 'This is a comment',
            id: 1,
          },
        ],
      },
      {
        id: 2,
        content: 'Hello World 2',
        comments: [
          {
            timestamp: '2021-08-01',
            user: 'John Doe',
            comment: 'This is a comment',
            id: 2,
          },
        ],
      },
  ];

  addEditor(content: string = '') {
    const id = this.editors.length + 1;
    this.editors.push({ id, content, comments: [] });
  }

  updateEditor(id: number, content: string) {
    const editor = this.editors.find(editor => editor.id === id);
    if (editor) {
      editor.content = content;
    }
  }

  getEditors() {
    return this.editors;
  }
}

export default EditorStateManager;