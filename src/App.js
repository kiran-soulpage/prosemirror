import React from "react";
import "./styles.css";
import Editor2 from "./Editor";
import Markdown from "react-markdown";
import htmlParser from "react-html-parser";

const acceptableNodes = ["table", "tbody", "thead", "u", "tr", "td"];

const parseHtml = htmlParser({
  isValidNode: (node) =>
    node.type !== "script" && acceptableNodes.includes(node.name),
});

function convertFileToBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);

    reader.readAsDataURL(file);
  });
}

const onUpload = async (image) => {
  const base64 = await convertFileToBuffer(image);
  return base64;
};

const initialState = `pross`;

export default function App() {
  const [markdown, setMarkdown] = React.useState(initialState);
  return (
    <div className="App">
      <h1>Epex Editor</h1>
      <Editor2
        onUpload={onUpload}
        value={markdown}
        onChange={setMarkdown}
        showMenu
      />
      {/* <div className="markdown">
        <Markdown escapeHtml={false} astPlugins={[parseHtml]}>
          {markdown}
        </Markdown>
      </div> */}
      {/* <pre>
        <code>{markdown}</code>
      </pre> */}
    </div>
  );
}
