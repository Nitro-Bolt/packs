import { useState } from "preact/hooks";
import "./pack-section.css";

const PackSection = ({ name, description, extensionCount, slug, upstream }) => {
  const [copied, setCopied] = useState(false);
  const packURL = new URL(`${slug}/pack.json`, document.baseURI).href;
  const copyURL = async () => {
    try {
      await navigator.clipboard.writeText(packURL);
    } catch {
      const input = document.createElement("textarea");
      input.value = packURL;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <section className="pack-section">
      <div className="pack-heading">
        <div>
          <h2>{name}</h2>
          {description && <p>{description}</p>}
        </div>
        <span>{extensionCount} extensions</span>
      </div>
      <div className="pack-link-row">
        <input aria-label={`${name} pack URL`} readOnly value={packURL} />
        <button onClick={copyURL} type="button">
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
      {upstream && (
        <a href={upstream} rel="noreferrer" target="_blank">
          Visit {name}'s gallery
        </a>
      )}
    </section>
  );
};

export default PackSection;
