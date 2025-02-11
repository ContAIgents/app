import { ContentBlock } from "@/types/content";

class EditorStateManager {
  private editors: ContentBlock[] = [
    {
      id: 1,
      content: 'Hello World',
      comments: [
        {
          timestamp: '2021-08-01',
          user: 'John Doe',
          comment: 'This is a comment',
          id: 1,
          status: 'idle'
        },
      ],
      title: "",
      description: ""
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
            status: "idle"
          },
        ],
        title: "",
        description: ""
      },
  ];

  addEditor(content: string = '') {
    const id = this.editors.length + 1;
    this.editors.push({
      id, content, comments: [],
      title: "",
      description: ""
    });
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
