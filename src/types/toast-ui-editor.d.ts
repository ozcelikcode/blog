declare module "@toast-ui/editor" {
  export interface EditorOptions {
    autofocus?: boolean;
    el: HTMLElement;
    height?: string;
    initialEditType?: "markdown" | "wysiwyg";
    initialValue?: string;
    placeholder?: string;
    previewStyle?: "tab" | "vertical";
    usageStatistics?: boolean;
  }

  export class Editor {
    constructor(options: EditorOptions);

    getMarkdown(): string;
    on(eventName: "change", handler: () => void): void;
  }
}
