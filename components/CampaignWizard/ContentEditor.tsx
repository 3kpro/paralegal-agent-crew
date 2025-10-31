interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const ContentEditor = ({ content, onChange }: ContentEditorProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Content Editor</h2>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-64 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Enter your campaign content here..."
      />
    </div>
  );
};
