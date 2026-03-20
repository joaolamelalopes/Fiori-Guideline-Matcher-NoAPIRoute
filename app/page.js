"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// ─── MATCHING ENGINE ───────────────────────────────────────────────

const STOP_WORDS = new Set([
  "the","a","an","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","can","shall",
  "about","after","not","no","what","when","where","who","which","that","this",
  "of","in","on","at","to","for","with","from","by","as","or","and","but","if",
  "so","its","it","they","them","their","there","than","then","also","into","all",
  "each","every","any","some","such","very","too","more","most","other","only",
  "same","just","because","how","both","between","through","during","before",
  "while","still","already","yet","however","although","though","since","until",
  "whether","either","neither","nor","per","via","etc","vs","upon","without",
  "user","users","using","used","use","need","needs","want","see","way","able",
  "instead","well","even","like","get","make","many","much","one","two","does",
  "doesn","don","didn","isn","aren","wasn","weren","hasn","hadn","won",
  "problem","impact","recommendation","issue","ensure","provide","consider",
  "should","current","currently","specific","properly","correctly","appropriate",
  "allow","allows","product","application","app","sap","fiori","screen","page",
]);

// Synonym map: DXR language → Fiori guideline language
const SYNONYMS = {
  "error": ["message", "validation", "warning", "value-state", "error-handling"],
  "errors": ["message", "validation", "warning", "value-state"],
  "warning": ["message", "value-state", "messaging"],
  "alert": ["message-box", "message-strip", "dialog", "messaging"],
  "popup": ["dialog", "popover", "message-box"],
  "modal": ["dialog"],
  "dropdown": ["select", "combo-box", "combo box"],
  "toast": ["message-toast", "messaging"],
  "notification": ["message-strip", "message-toast", "notification-center", "messaging"],
  "spacing": ["spacing", "layout", "margins", "padding", "visual"],
  "padding": ["spacing", "layout", "visual"],
  "margin": ["spacing", "layout", "visual"],
  "alignment": ["layout", "visual", "typography"],
  "font": ["typography", "visual"],
  "text": ["typography", "label", "title", "formatted-text", "writing"],
  "color": ["colors", "semantic-colors", "visual", "value-state", "theming"],
  "colours": ["colors", "semantic-colors", "visual", "theming"],
  "icon": ["icon", "visual"],
  "button": ["button", "action", "action-placement", "footer-toolbar"],
  "buttons": ["button", "action", "action-placement", "footer-toolbar"],
  "link": ["link", "navigation", "smart-link"],
  "links": ["link", "navigation", "smart-link"],
  "table": ["responsive-table", "grid-table", "analytical-table", "table", "smart-table"],
  "tables": ["responsive-table", "grid-table", "analytical-table", "table", "smart-table"],
  "list": ["list", "list-report", "worklist", "standard-list-item"],
  "form": ["form", "smart-form", "form-field-validation", "input-field"],
  "forms": ["form", "smart-form", "form-field-validation"],
  "input": ["input-field", "input", "form", "form-field-validation"],
  "field": ["input-field", "form", "form-field-validation", "smart-field"],
  "fields": ["input-field", "form", "form-field-validation", "smart-field"],
  "search": ["search", "filter-bar", "smart-filter-bar"],
  "filter": ["filter-bar", "smart-filter-bar", "visual-filter-bar", "search"],
  "filtering": ["filter-bar", "smart-filter-bar", "visual-filter-bar"],
  "sort": ["table", "view-settings-dialog"],
  "sorting": ["table", "view-settings-dialog"],
  "column": ["responsive-table", "grid-table", "table"],
  "columns": ["responsive-table", "grid-table", "table"],
  "row": ["responsive-table", "grid-table", "table"],
  "rows": ["responsive-table", "grid-table", "table"],
  "tab": ["icontabbar", "tab-bar", "navigation"],
  "tabs": ["icontabbar", "tab-bar", "navigation"],
  "menu": ["user-menu", "navigation-menu", "action-sheet", "navigation"],
  "header": ["shell-bar", "header-toolbar", "object-page", "dynamic-page"],
  "toolbar": ["header-toolbar", "footer-toolbar", "toolbar-overview", "action-placement"],
  "footer": ["footer-toolbar", "action-placement"],
  "navigate": ["navigation", "breadcrumb", "link"],
  "navigation": ["navigation", "breadcrumb", "shell-bar"],
  "back": ["navigation", "shell-bar"],
  "breadcrumb": ["breadcrumb", "navigation"],
  "card": ["cards", "card", "analytical-card", "calendar-card"],
  "cards": ["cards", "card", "analytical-card"],
  "chart": ["chart", "chart-vizframe", "smart-chart", "data-visualization"],
  "charts": ["chart", "chart-vizframe", "smart-chart", "data-visualization"],
  "graph": ["chart", "chart-vizframe", "data-visualization"],
  "wizard": ["wizard", "floorplan"],
  "step": ["wizard", "step-input", "process-flow"],
  "steps": ["wizard", "step-input", "process-flow"],
  "dialog": ["dialog", "message-box", "select-dialog", "value-help-dialog"],
  "progress": ["progress-indicator", "busy-indicator", "busy-handling"],
  "loading": ["busy-indicator", "busy-handling", "placeholder-loading", "busy-state"],
  "spinner": ["busy-indicator", "busy-handling"],
  "empty": ["empty-states", "illustrated-message"],
  "blank": ["empty-states", "illustrated-message"],
  "placeholder": ["placeholder-loading", "empty-states"],
  "avatar": ["avatar", "avatar-group"],
  "image": ["image", "avatar", "carousel"],
  "upload": ["upload-set"],
  "file": ["upload-set", "cloud-file-browser"],
  "date": ["date-picker", "date-range-selection", "calendar"],
  "time": ["time-picker", "datetime-picker"],
  "calendar": ["calendar", "planning-calendar", "single-planning-calendar"],
  "switch": ["switch", "checkbox", "radio-button"],
  "toggle": ["switch"],
  "checkbox": ["checkbox", "switch"],
  "radio": ["radio-button"],
  "select": ["select", "combo-box", "select-dialog"],
  "picker": ["date-picker", "time-picker", "color-picker", "datetime-picker"],
  "slider": ["slider", "range-slider"],
  "rating": ["rating-indicator"],
  "badge": ["generic-tag", "object-display-elements"],
  "tag": ["generic-tag", "token"],
  "token": ["token", "multi-input"],
  "chip": ["token", "generic-tag"],
  "panel": ["panel", "side-panel", "dynamic-side-content"],
  "sidebar": ["side-navigation", "side-panel", "dynamic-side-content"],
  "drawer": ["side-panel", "dynamic-side-content"],
  "tree": ["tree", "tree-table"],
  "hierarchy": ["tree", "tree-table", "process-flow"],
  "timeline": ["timeline", "process-flow"],
  "workflow": ["process-flow", "wizard"],
  "drag": ["drag-and-drop"],
  "drop": ["drag-and-drop"],
  "copy": ["object-handling", "copy"],
  "create": ["object-handling", "create", "wizard"],
  "edit": ["object-handling", "edit", "draft-handling"],
  "delete": ["object-handling", "delete-objects"],
  "save": ["object-handling", "draft-handling", "footer-toolbar"],
  "draft": ["draft-handling"],
  "cancel": ["object-handling", "draft-handling", "messaging"],
  "discard": ["draft-handling", "object-handling"],
  "undo": ["draft-handling"],
  "variant": ["variant-management"],
  "personalization": ["p13n-dialog", "variant-management", "table-personalization"],
  "settings": ["view-settings-dialog", "p13n-dialog", "variant-management"],
  "responsive": ["responsive-table", "responsive", "adaptive", "multi-device"],
  "mobile": ["mobile-integration", "responsive", "adaptive"],
  "desktop": ["responsive", "adaptive"],
  "tablet": ["responsive", "adaptive"],
  "truncat": ["wrapping-and-truncation", "typography"],
  "wrap": ["wrapping-and-truncation", "typography"],
  "overflow": ["wrapping-and-truncation", "toolbar-overview"],
  "scroll": ["scroll-container", "responsive-table"],
  "tooltip": ["using-tooltips"],
  "hint": ["using-tooltips", "label", "placeholder"],
  "help": ["value-help-dialog", "using-tooltips"],
  "accessibility": ["accessibility", "keyboard", "inclusive-design"],
  "keyboard": ["keyboard", "accessibility"],
  "focus": ["keyboard", "accessibility", "interaction"],
  "contrast": ["accessibility", "colors", "visual"],
  "theme": ["theming", "colors", "belize", "horizon", "quartz"],
  "dark": ["theming", "colors"],
  "light": ["theming", "colors", "quartz"],
  "object-page": ["object-page", "floorplan"],
  "list-report": ["list-report", "floorplan"],
  "overview": ["overview-page", "floorplan"],
  "worklist": ["worklist", "floorplan"],
  "analytical": ["analytical-list-page", "analytical-table", "analytical-card"],
  "floorplan": ["floorplan", "object-page", "list-report", "wizard", "overview-page"],
  "layout": ["dynamic-page", "flexible-column-layout", "page-layouts"],
  "onboarding": ["getting-started", "wizard", "empty-states"],
  "getting-started": ["getting-started", "wizard"],
  "label": ["label", "form", "typography", "writing"],
  "wording": ["writing-and-wording", "text-guidelines"],
  "text-guideline": ["writing-and-wording"],
  "content": ["writing-and-wording", "formatted-text"],
  "message": ["messaging", "message-handling", "message-box", "message-popover", "message-strip", "message-toast", "message-view"],
  "messages": ["messaging", "message-handling", "message-box", "message-popover", "message-strip", "message-toast"],
  "validation": ["form-field-validation", "messaging", "value-state"],
  "inline": ["form-field-validation", "value-state", "message-strip"],
  "status": ["value-state", "ui-element-states", "generic-tag", "semantic-colors"],
  "state": ["value-state", "ui-element-states", "busy-state"],
  "semantic": ["semantic-colors", "value-state", "how-to-use-semantic-colors"],
  "indicator": ["progress-indicator", "busy-indicator", "status-indicator", "value-state"],
  "illustration": ["illustrated-message", "ux-illustrations", "empty-states"],
  "ai": ["ai-button", "ai-notice", "ai-acknowledgment", "ai-writing-assistant", "joule", "generative-ai"],
  "joule": ["joule", "ai-and-joule-design"],
};

// Crude but effective stemming
function stem(word) {
  if (word.length <= 4) return word;
  return word
    .replace(/ies$/, "y")
    .replace(/tion$/, "t")
    .replace(/sion$/, "s")
    .replace(/ment$/, "")
    .replace(/ness$/, "")
    .replace(/ling$/, "l")
    .replace(/ting$/, "t")
    .replace(/ning$/, "n")
    .replace(/ring$/, "r")
    .replace(/ing$/, "")
    .replace(/ated$/, "at")
    .replace(/ized$/, "iz")
    .replace(/ised$/, "is")
    .replace(/ed$/, "")
    .replace(/ly$/, "")
    .replace(/er$/, "")
    .replace(/es$/, "")
    .replace(/s$/, "");
}

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(w => w.length >= 2);
}

function extractQueryTerms(text) {
  const words = tokenize(text);
  const terms = new Set();
  const expanded = new Set();

  for (const w of words) {
    if (STOP_WORDS.has(w)) continue;
    terms.add(w);
    terms.add(stem(w));
    
    // Synonym expansion
    const syns = SYNONYMS[w] || SYNONYMS[stem(w)];
    if (syns) {
      for (const s of syns) {
        expanded.add(s.toLowerCase());
        // Also add individual words from multi-word synonyms
        for (const part of s.split("-")) {
          if (part.length >= 3) expanded.add(part);
        }
      }
    }
  }

  // Extract bigrams from non-stop words
  const contentWords = words.filter(w => !STOP_WORDS.has(w) && w.length >= 3);
  const bigrams = [];
  for (let i = 0; i < contentWords.length - 1; i++) {
    bigrams.push(contentWords[i] + " " + contentWords[i + 1]);
    bigrams.push(contentWords[i] + "-" + contentWords[i + 1]);
  }

  return { terms: [...terms], expanded: [...expanded], bigrams };
}

function buildIDF(corpus) {
  const docFreq = {};
  const N = corpus.length;
  for (const entry of corpus) {
    const words = new Set(tokenize(entry.search));
    for (const w of words) {
      docFreq[w] = (docFreq[w] || 0) + 1;
    }
  }
  // IDF = log(N / df). Higher = rarer = more discriminating
  const idf = {};
  for (const [w, df] of Object.entries(docFreq)) {
    idf[w] = Math.log(N / df);
  }
  return idf;
}

function scoreEntry(entry, terms, expanded, bigrams, idf) {
  const search = entry.search;
  const title = entry.title.toLowerCase();
  const slug = (entry.url || "").split("/").pop()?.replace(/-/g, " ") || "";
  let score = 0;

  // Direct term matches (weighted by IDF)
  for (const t of terms) {
    if (search.includes(t)) {
      const weight = Math.min(idf[t] || 1, 5);
      score += weight;
      if (title.includes(t)) score += weight * 2;
      if (slug.includes(t)) score += weight * 1.5;
    }
    // Stem matching in search text
    const st = stem(t);
    if (st !== t && search.includes(st)) {
      score += (idf[st] || 1) * 0.5;
    }
  }

  // Synonym-expanded terms (lower weight but still valuable)
  for (const t of expanded) {
    if (search.includes(t)) {
      score += 1.5;
      if (title.includes(t)) score += 3;
      if (slug.includes(t)) score += 2.5;
    }
  }

  // Bigram matches (strong signal)
  for (const bg of bigrams) {
    if (search.includes(bg)) score += 6;
    if (title.includes(bg)) score += 10;
  }

  return Math.round(score * 100) / 100;
}

// ─── UI ────────────────────────────────────────────────────────────

const SAP_BLUE = "#0070F2";

export default function Home() {
  const [corpus, setCorpus] = useState(null);
  const [idf, setIdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issueText, setIssueText] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [platform, setPlatform] = useState("All");

  useEffect(() => {
    fetch("/fiori-corpus.json")
      .then((r) => r.json())
      .then((data) => {
        setCorpus(data);
        setIdf(buildIDF(data));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load guidelines corpus.");
        setLoading(false);
      });
  }, []);

  const handleSearch = useCallback(() => {
    if (!issueText.trim() || !corpus || !idf) return;
    setError(null);

    const { terms, expanded, bigrams } = extractQueryTerms(issueText);

    const filtered = platform === "All" ? corpus : corpus.filter(e => e.platform === platform);

    const scored = filtered
      .map((entry, idx) => ({
        ...entry,
        idx,
        score: scoreEntry(entry, terms, expanded, bigrams, idf),
      }))
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setResults(scored);
  }, [issueText, corpus, idf, platform]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSearch();
  };

  const [copiedIdx, setCopiedIdx] = useState(null);
  const handleCopy = (url, idx) => {
    navigator.clipboard?.writeText(url);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="center">
          <div className="spinner" />
          <p className="loading-text">Loading guidelines corpus...</p>
        </div>
        <style jsx>{baseStyles}</style>
      </div>
    );
  }

  const maxScore = results?.[0]?.score || 1;

  return (
    <div className="container">
      <header className="header">
        <div className="logo-mark" />
        <div>
          <h1 className="title">DXR Guideline Matcher</h1>
          <p className="subtitle">
            Map DXR issues to Fiori Design Guidelines
            {corpus && <span className="dim"> · {corpus.length} guidelines indexed</span>}
          </p>
        </div>
      </header>

      <section className="input-section">
        <div className="platform-row">
          <label className="label">Platform</label>
          <div className="platform-toggle">
            {["All", "Web", "iOS", "Android"].map((p) => (
              <button
                key={p}
                className={`platform-btn ${platform === p ? "platform-active" : ""}`}
                onClick={() => { setPlatform(p); setResults(null); }}
              >
                {p}
                {corpus && (
                  <span className="platform-count">
                    {p === "All" ? corpus.length : corpus.filter(e => e.platform === p).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <label className="label">Issue Description</label>
        <p className="hint">
          Paste the full P/I/R text. The matcher searches all Fiori guidelines
          regardless of DXR dimension or theme. Press <kbd>Cmd+Enter</kbd> to search.
        </p>
        <textarea
          className="textarea"
          value={issueText}
          onChange={(e) => setIssueText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={"Problem: The error messages after form validation are displayed in a generic browser alert instead of inline field-level indicators.\n\nImpact: Users cannot quickly identify which specific fields need correction, increasing task completion time and error rates.\n\nRecommendation: Use value state indicators on individual form fields and a message popover to collect and display all validation errors."}
          rows={7}
        />
        <div className="actions">
          <button
            className="search-btn"
            onClick={handleSearch}
            disabled={!issueText.trim()}
          >
            Find Guidelines
          </button>
          {issueText && (
            <button
              className="clear-btn"
              onClick={() => { setIssueText(""); setResults(null); }}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="error-box"><strong>Error:</strong> {error}</div>
      )}

      {results && results.length === 0 && (
        <div className="empty-results">
          <p>No matching guidelines found. Try rephrasing or using different keywords.</p>
        </div>
      )}

      {results && results.length > 0 && (
        <section className="results-section">
          <div className="results-header">
            <h2 className="results-title">Matched Guidelines</h2>
            <span className="results-count">{results.length} results</span>
          </div>
          <p className="results-hint">
            Click any title to open the guideline. Copy the URL to reference in your DXR issue.
          </p>

          {results.map((r, i) => {
            const relScore = r.score / maxScore;
            return (
              <div key={r.idx} className="result-card">
                <div className="result-top">
                  <div className="rank-badge">#{i + 1}</div>
                  <div className="result-body">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-title"
                    >
                      {r.title}
                    </a>
                    <div className="result-meta">
                      {r.platform && platform === "All" && <span className="tag plat-tag">{r.platform}</span>}
                      {r.type && <span className="tag type-tag">{r.type}</span>}
                      {r.category && <span className="tag cat-tag">{r.category}</span>}
                    </div>
                  </div>
                  <div className="score-container">
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${Math.round(relScore * 100)}%`,
                          backgroundColor:
                            relScore >= 0.7 ? "#107E3E" :
                            relScore >= 0.4 ? "#E9730C" : "#BB0000",
                        }}
                      />
                    </div>
                    <span className="score-label">{r.score.toFixed(1)}</span>
                  </div>
                </div>
                {r.breadcrumbs && (
                  <div className="breadcrumbs">{r.breadcrumbs}</div>
                )}
                {r.description && (
                  <p className="description">{r.description}</p>
                )}
                <div className="url-row">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="url"
                  >
                    {r.url}
                  </a>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(r.url, i)}
                    title="Copy URL"
                  >
                    {copiedIdx === i ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#107E3E" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <footer className="footer">
        DXR Guideline Matcher · Core Design · Fiori Guidelines v1-136
      </footer>

      <style jsx>{baseStyles}</style>
    </div>
  );
}

const baseStyles = `
  .container {
    max-width: 780px;
    margin: 0 auto;
    padding: 32px 20px 48px;
    min-height: 100vh;
  }
  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }
  .spinner {
    width: 32px; height: 32px;
    border: 3px solid #E5E5E5;
    border-top-color: ${SAP_BLUE};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text {
    margin-top: 14px;
    color: #6A7B8C;
    font-size: 14px;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid ${SAP_BLUE};
  }
  .logo-mark {
    width: 38px; height: 38px;
    border-radius: 9px;
    background: linear-gradient(135deg, ${SAP_BLUE}, #0053B8);
    flex-shrink: 0;
  }
  .title {
    font-size: 23px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.3px;
  }
  .subtitle {
    font-size: 13px;
    color: #6A7B8C;
    margin: 3px 0 0;
  }
  .dim { color: #A0ABB5; }

  /* Input */
  .input-section { margin-bottom: 24px; }
  .label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .hint {
    font-size: 13px;
    color: #6A7B8C;
    margin: 0 0 10px;
    line-height: 1.5;
  }
  .hint kbd {
    background: #EDF1F5;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 12px;
    font-family: inherit;
    border: 1px solid #DEE2E6;
  }
  .textarea {
    width: 100%;
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.6;
    border: 1px solid #C4C4C4;
    border-radius: 8px;
    resize: vertical;
    font-family: inherit;
    color: #1D2D3E;
    background: #fff;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .textarea:focus {
    border-color: ${SAP_BLUE};
    box-shadow: 0 0 0 3px rgba(0,112,242,0.1);
  }
  .textarea::placeholder { color: #A0ABB5; }
  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
  }
  .search-btn {
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: ${SAP_BLUE};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .search-btn:hover:not(:disabled) { background: #0053B8; }
  .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .clear-btn {
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 500;
    color: #6A7B8C;
    background: transparent;
    border: 1px solid #DEE2E6;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .clear-btn:hover { background: #F0F2F4; }

  /* Errors & empty */
  .error-box {
    padding: 12px 16px;
    background: #FFF1F1;
    border: 1px solid #FFCDD2;
    border-radius: 8px;
    font-size: 13px;
    color: #BB0000;
    margin-bottom: 20px;
  }
  .empty-results {
    text-align: center;
    padding: 40px 20px;
    color: #8C9BA8;
    font-size: 14px;
  }

  /* Results */
  .results-section { margin-top: 8px; }
  .results-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .results-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
  .results-count {
    font-size: 12px;
    color: #8C9BA8;
  }
  .results-hint {
    font-size: 12px;
    color: #8C9BA8;
    margin: 0 0 16px;
  }

  .result-card {
    padding: 16px 18px;
    border: 1px solid #DEE2E6;
    border-radius: 10px;
    margin-bottom: 12px;
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .result-card:hover {
    border-color: #B0BCC8;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .result-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 6px;
  }
  .rank-badge {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: #EDF4FF;
    color: ${SAP_BLUE};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .result-body { flex: 1; min-width: 0; }
  .result-title {
    font-size: 15px;
    font-weight: 600;
    color: ${SAP_BLUE};
    text-decoration: none;
    line-height: 1.3;
  }
  .result-title:hover { text-decoration: underline; }
  .result-meta {
    display: flex;
    gap: 6px;
    margin-top: 5px;
    flex-wrap: wrap;
  }
  .tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
    white-space: nowrap;
  }
  .type-tag { background: #E8F0FE; color: #1A56DB; }
  .cat-tag { background: #EDF1F5; color: #556677; }
  .plat-tag { background: #E6F4EA; color: #137333; }

  /* Platform toggle */
  .platform-row {
    margin-bottom: 16px;
  }
  .platform-toggle {
    display: flex;
    gap: 0;
    margin-top: 6px;
    border: 1px solid #DEE2E6;
    border-radius: 8px;
    overflow: hidden;
    width: fit-content;
  }
  .platform-btn {
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 500;
    color: #556677;
    background: #fff;
    border: none;
    border-right: 1px solid #DEE2E6;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .platform-btn:last-child { border-right: none; }
  .platform-btn:hover { background: #F7F8FA; }
  .platform-active {
    background: ${SAP_BLUE} !important;
    color: #fff !important;
  }
  .platform-active .platform-count {
    background: rgba(255,255,255,0.2);
    color: #fff;
  }
  .platform-count {
    font-size: 11px;
    background: #EDF1F5;
    color: #8C9BA8;
    padding: 1px 6px;
    border-radius: 10px;
    font-weight: 600;
  }
  .score-container {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    margin-top: 4px;
  }
  .score-bar {
    width: 48px; height: 6px;
    border-radius: 3px;
    background: #EDF1F5;
    overflow: hidden;
  }
  .score-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }
  .score-label {
    font-size: 12px;
    font-weight: 600;
    color: #6A7B8C;
    min-width: 28px;
    text-align: right;
  }
  .breadcrumbs {
    font-size: 12px;
    color: #8C9BA8;
    margin-bottom: 4px;
    margin-left: 40px;
  }
  .description {
    font-size: 13px;
    color: #4A5D6E;
    margin: 0 0 8px;
    margin-left: 40px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .url-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: 40px;
  }
  .url {
    font-size: 12px;
    color: #8C9BA8;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .url:hover { color: ${SAP_BLUE}; }
  .copy-btn {
    padding: 4px 6px;
    border: 1px solid #DEE2E6;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    color: #6A7B8C;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .copy-btn:hover {
    background: #F0F2F4;
    border-color: #B0BCC8;
  }

  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #E8EBEE;
    text-align: center;
    font-size: 12px;
    color: #A0ABB5;
  }

  @media (max-width: 600px) {
    .container { padding: 20px 14px 36px; }
    .title { font-size: 19px; }
    .result-top { flex-wrap: wrap; }
    .score-container { margin-left: 40px; }
  }
`;  "padding": ["spacing", "layout", "visual"],
  "margin": ["spacing", "layout", "visual"],
  "alignment": ["layout", "visual", "typography"],
  "font": ["typography", "visual"],
  "text": ["typography", "label", "title", "formatted-text", "writing"],
  "color": ["colors", "semantic-colors", "visual", "value-state", "theming"],
  "colours": ["colors", "semantic-colors", "visual", "theming"],
  "icon": ["icon", "visual"],
  "button": ["button", "action", "action-placement", "footer-toolbar"],
  "buttons": ["button", "action", "action-placement", "footer-toolbar"],
  "link": ["link", "navigation", "smart-link"],
  "links": ["link", "navigation", "smart-link"],
  "table": ["responsive-table", "grid-table", "analytical-table", "table", "smart-table"],
  "tables": ["responsive-table", "grid-table", "analytical-table", "table", "smart-table"],
  "list": ["list", "list-report", "worklist", "standard-list-item"],
  "form": ["form", "smart-form", "form-field-validation", "input-field"],
  "forms": ["form", "smart-form", "form-field-validation"],
  "input": ["input-field", "input", "form", "form-field-validation"],
  "field": ["input-field", "form", "form-field-validation", "smart-field"],
  "fields": ["input-field", "form", "form-field-validation", "smart-field"],
  "search": ["search", "filter-bar", "smart-filter-bar"],
  "filter": ["filter-bar", "smart-filter-bar", "visual-filter-bar", "search"],
  "filtering": ["filter-bar", "smart-filter-bar", "visual-filter-bar"],
  "sort": ["table", "view-settings-dialog"],
  "sorting": ["table", "view-settings-dialog"],
  "column": ["responsive-table", "grid-table", "table"],
  "columns": ["responsive-table", "grid-table", "table"],
  "row": ["responsive-table", "grid-table", "table"],
  "rows": ["responsive-table", "grid-table", "table"],
  "tab": ["icontabbar", "tab-bar", "navigation"],
  "tabs": ["icontabbar", "tab-bar", "navigation"],
  "menu": ["user-menu", "navigation-menu", "action-sheet", "navigation"],
  "header": ["shell-bar", "header-toolbar", "object-page", "dynamic-page"],
  "toolbar": ["header-toolbar", "footer-toolbar", "toolbar-overview", "action-placement"],
  "footer": ["footer-toolbar", "action-placement"],
  "navigate": ["navigation", "breadcrumb", "link"],
  "navigation": ["navigation", "breadcrumb", "shell-bar"],
  "back": ["navigation", "shell-bar"],
  "breadcrumb": ["breadcrumb", "navigation"],
  "card": ["cards", "card", "analytical-card", "calendar-card"],
  "cards": ["cards", "card", "analytical-card"],
  "chart": ["chart", "chart-vizframe", "smart-chart", "data-visualization"],
  "charts": ["chart", "chart-vizframe", "smart-chart", "data-visualization"],
  "graph": ["chart", "chart-vizframe", "data-visualization"],
  "wizard": ["wizard", "floorplan"],
  "step": ["wizard", "step-input", "process-flow"],
  "steps": ["wizard", "step-input", "process-flow"],
  "dialog": ["dialog", "message-box", "select-dialog", "value-help-dialog"],
  "progress": ["progress-indicator", "busy-indicator", "busy-handling"],
  "loading": ["busy-indicator", "busy-handling", "placeholder-loading", "busy-state"],
  "spinner": ["busy-indicator", "busy-handling"],
  "empty": ["empty-states", "illustrated-message"],
  "blank": ["empty-states", "illustrated-message"],
  "placeholder": ["placeholder-loading", "empty-states"],
  "avatar": ["avatar", "avatar-group"],
  "image": ["image", "avatar", "carousel"],
  "upload": ["upload-set"],
  "file": ["upload-set", "cloud-file-browser"],
  "date": ["date-picker", "date-range-selection", "calendar"],
  "time": ["time-picker", "datetime-picker"],
  "calendar": ["calendar", "planning-calendar", "single-planning-calendar"],
  "switch": ["switch", "checkbox", "radio-button"],
  "toggle": ["switch"],
  "checkbox": ["checkbox", "switch"],
  "radio": ["radio-button"],
  "select": ["select", "combo-box", "select-dialog"],
  "picker": ["date-picker", "time-picker", "color-picker", "datetime-picker"],
  "slider": ["slider", "range-slider"],
  "rating": ["rating-indicator"],
  "badge": ["generic-tag", "object-display-elements"],
  "tag": ["generic-tag", "token"],
  "token": ["token", "multi-input"],
  "chip": ["token", "generic-tag"],
  "panel": ["panel", "side-panel", "dynamic-side-content"],
  "sidebar": ["side-navigation", "side-panel", "dynamic-side-content"],
  "drawer": ["side-panel", "dynamic-side-content"],
  "tree": ["tree", "tree-table"],
  "hierarchy": ["tree", "tree-table", "process-flow"],
  "timeline": ["timeline", "process-flow"],
  "workflow": ["process-flow", "wizard"],
  "drag": ["drag-and-drop"],
  "drop": ["drag-and-drop"],
  "copy": ["object-handling", "copy"],
  "create": ["object-handling", "create", "wizard"],
  "edit": ["object-handling", "edit", "draft-handling"],
  "delete": ["object-handling", "delete-objects"],
  "save": ["object-handling", "draft-handling", "footer-toolbar"],
  "draft": ["draft-handling"],
  "cancel": ["object-handling", "draft-handling", "messaging"],
  "discard": ["draft-handling", "object-handling"],
  "undo": ["draft-handling"],
  "variant": ["variant-management"],
  "personalization": ["p13n-dialog", "variant-management", "table-personalization"],
  "settings": ["view-settings-dialog", "p13n-dialog", "variant-management"],
  "responsive": ["responsive-table", "responsive", "adaptive", "multi-device"],
  "mobile": ["mobile-integration", "responsive", "adaptive"],
  "desktop": ["responsive", "adaptive"],
  "tablet": ["responsive", "adaptive"],
  "truncat": ["wrapping-and-truncation", "typography"],
  "wrap": ["wrapping-and-truncation", "typography"],
  "overflow": ["wrapping-and-truncation", "toolbar-overview"],
  "scroll": ["scroll-container", "responsive-table"],
  "tooltip": ["using-tooltips"],
  "hint": ["using-tooltips", "label", "placeholder"],
  "help": ["value-help-dialog", "using-tooltips"],
  "accessibility": ["accessibility", "keyboard", "inclusive-design"],
  "keyboard": ["keyboard", "accessibility"],
  "focus": ["keyboard", "accessibility", "interaction"],
  "contrast": ["accessibility", "colors", "visual"],
  "theme": ["theming", "colors", "belize", "horizon", "quartz"],
  "dark": ["theming", "colors"],
  "light": ["theming", "colors", "quartz"],
  "object-page": ["object-page", "floorplan"],
  "list-report": ["list-report", "floorplan"],
  "overview": ["overview-page", "floorplan"],
  "worklist": ["worklist", "floorplan"],
  "analytical": ["analytical-list-page", "analytical-table", "analytical-card"],
  "floorplan": ["floorplan", "object-page", "list-report", "wizard", "overview-page"],
  "layout": ["dynamic-page", "flexible-column-layout", "page-layouts"],
  "onboarding": ["getting-started", "wizard", "empty-states"],
  "getting-started": ["getting-started", "wizard"],
  "label": ["label", "form", "typography", "writing"],
  "wording": ["writing-and-wording", "text-guidelines"],
  "text-guideline": ["writing-and-wording"],
  "content": ["writing-and-wording", "formatted-text"],
  "message": ["messaging", "message-handling", "message-box", "message-popover", "message-strip", "message-toast", "message-view"],
  "messages": ["messaging", "message-handling", "message-box", "message-popover", "message-strip", "message-toast"],
  "validation": ["form-field-validation", "messaging", "value-state"],
  "inline": ["form-field-validation", "value-state", "message-strip"],
  "status": ["value-state", "ui-element-states", "generic-tag", "semantic-colors"],
  "state": ["value-state", "ui-element-states", "busy-state"],
  "semantic": ["semantic-colors", "value-state", "how-to-use-semantic-colors"],
  "indicator": ["progress-indicator", "busy-indicator", "status-indicator", "value-state"],
  "illustration": ["illustrated-message", "ux-illustrations", "empty-states"],
  "ai": ["ai-button", "ai-notice", "ai-acknowledgment", "ai-writing-assistant", "joule", "generative-ai"],
  "joule": ["joule", "ai-and-joule-design"],
};

// Crude but effective stemming
function stem(word) {
  if (word.length <= 4) return word;
  return word
    .replace(/ies$/, "y")
    .replace(/tion$/, "t")
    .replace(/sion$/, "s")
    .replace(/ment$/, "")
    .replace(/ness$/, "")
    .replace(/ling$/, "l")
    .replace(/ting$/, "t")
    .replace(/ning$/, "n")
    .replace(/ring$/, "r")
    .replace(/ing$/, "")
    .replace(/ated$/, "at")
    .replace(/ized$/, "iz")
    .replace(/ised$/, "is")
    .replace(/ed$/, "")
    .replace(/ly$/, "")
    .replace(/er$/, "")
    .replace(/es$/, "")
    .replace(/s$/, "");
}

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(w => w.length >= 2);
}

function extractQueryTerms(text) {
  const words = tokenize(text);
  const terms = new Set();
  const expanded = new Set();

  for (const w of words) {
    if (STOP_WORDS.has(w)) continue;
    terms.add(w);
    terms.add(stem(w));
    
    // Synonym expansion
    const syns = SYNONYMS[w] || SYNONYMS[stem(w)];
    if (syns) {
      for (const s of syns) {
        expanded.add(s.toLowerCase());
        // Also add individual words from multi-word synonyms
        for (const part of s.split("-")) {
          if (part.length >= 3) expanded.add(part);
        }
      }
    }
  }

  // Extract bigrams from non-stop words
  const contentWords = words.filter(w => !STOP_WORDS.has(w) && w.length >= 3);
  const bigrams = [];
  for (let i = 0; i < contentWords.length - 1; i++) {
    bigrams.push(contentWords[i] + " " + contentWords[i + 1]);
    bigrams.push(contentWords[i] + "-" + contentWords[i + 1]);
  }

  return { terms: [...terms], expanded: [...expanded], bigrams };
}

function buildIDF(corpus) {
  const docFreq = {};
  const N = corpus.length;
  for (const entry of corpus) {
    const words = new Set(tokenize(entry.search));
    for (const w of words) {
      docFreq[w] = (docFreq[w] || 0) + 1;
    }
  }
  // IDF = log(N / df). Higher = rarer = more discriminating
  const idf = {};
  for (const [w, df] of Object.entries(docFreq)) {
    idf[w] = Math.log(N / df);
  }
  return idf;
}

function scoreEntry(entry, terms, expanded, bigrams, idf) {
  const search = entry.search;
  const title = entry.title.toLowerCase();
  const slug = (entry.url || "").split("/").pop()?.replace(/-/g, " ") || "";
  let score = 0;

  // Direct term matches (weighted by IDF)
  for (const t of terms) {
    if (search.includes(t)) {
      const weight = Math.min(idf[t] || 1, 5);
      score += weight;
      if (title.includes(t)) score += weight * 2;
      if (slug.includes(t)) score += weight * 1.5;
    }
    // Stem matching in search text
    const st = stem(t);
    if (st !== t && search.includes(st)) {
      score += (idf[st] || 1) * 0.5;
    }
  }

  // Synonym-expanded terms (lower weight but still valuable)
  for (const t of expanded) {
    if (search.includes(t)) {
      score += 1.5;
      if (title.includes(t)) score += 3;
      if (slug.includes(t)) score += 2.5;
    }
  }

  // Bigram matches (strong signal)
  for (const bg of bigrams) {
    if (search.includes(bg)) score += 6;
    if (title.includes(bg)) score += 10;
  }

  return Math.round(score * 100) / 100;
}

// ─── UI ────────────────────────────────────────────────────────────

const SAP_BLUE = "#0070F2";

export default function Home() {
  const [corpus, setCorpus] = useState(null);
  const [idf, setIdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issueText, setIssueText] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/fiori-corpus.json")
      .then((r) => r.json())
      .then((data) => {
        setCorpus(data);
        setIdf(buildIDF(data));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load guidelines corpus.");
        setLoading(false);
      });
  }, []);

  const handleSearch = useCallback(() => {
    if (!issueText.trim() || !corpus || !idf) return;
    setError(null);

    const { terms, expanded, bigrams } = extractQueryTerms(issueText);

    const scored = corpus
      .map((entry, idx) => ({
        ...entry,
        idx,
        score: scoreEntry(entry, terms, expanded, bigrams, idf),
      }))
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setResults(scored);
  }, [issueText, corpus, idf]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSearch();
  };

  const [copiedIdx, setCopiedIdx] = useState(null);
  const handleCopy = (url, idx) => {
    navigator.clipboard?.writeText(url);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="center">
          <div className="spinner" />
          <p className="loading-text">Loading guidelines corpus...</p>
        </div>
        <style jsx>{baseStyles}</style>
      </div>
    );
  }

  const maxScore = results?.[0]?.score || 1;

  return (
    <div className="container">
      <header className="header">
        <div className="logo-mark" />
        <div>
          <h1 className="title">DXR Guideline Matcher</h1>
          <p className="subtitle">
            Map DXR issues to Fiori Design Guidelines
            {corpus && <span className="dim"> · {corpus.length} guidelines indexed</span>}
          </p>
        </div>
      </header>

      <section className="input-section">
        <label className="label">Issue Description</label>
        <p className="hint">
          Paste the full P/I/R text. The matcher searches all Fiori guidelines
          regardless of DXR dimension or theme. Press <kbd>Cmd+Enter</kbd> to search.
        </p>
        <textarea
          className="textarea"
          value={issueText}
          onChange={(e) => setIssueText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={"Problem: The error messages after form validation are displayed in a generic browser alert instead of inline field-level indicators.\n\nImpact: Users cannot quickly identify which specific fields need correction, increasing task completion time and error rates.\n\nRecommendation: Use value state indicators on individual form fields and a message popover to collect and display all validation errors."}
          rows={7}
        />
        <div className="actions">
          <button
            className="search-btn"
            onClick={handleSearch}
            disabled={!issueText.trim()}
          >
            Find Guidelines
          </button>
          {issueText && (
            <button
              className="clear-btn"
              onClick={() => { setIssueText(""); setResults(null); }}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="error-box"><strong>Error:</strong> {error}</div>
      )}

      {results && results.length === 0 && (
        <div className="empty-results">
          <p>No matching guidelines found. Try rephrasing or using different keywords.</p>
        </div>
      )}

      {results && results.length > 0 && (
        <section className="results-section">
          <div className="results-header">
            <h2 className="results-title">Matched Guidelines</h2>
            <span className="results-count">{results.length} results</span>
          </div>
          <p className="results-hint">
            Click any title to open the guideline. Copy the URL to reference in your DXR issue.
          </p>

          {results.map((r, i) => {
            const relScore = r.score / maxScore;
            return (
              <div key={r.idx} className="result-card">
                <div className="result-top">
                  <div className="rank-badge">#{i + 1}</div>
                  <div className="result-body">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-title"
                    >
                      {r.title}
                    </a>
                    <div className="result-meta">
                      {r.type && <span className="tag type-tag">{r.type}</span>}
                      {r.category && <span className="tag cat-tag">{r.category}</span>}
                    </div>
                  </div>
                  <div className="score-container">
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${Math.round(relScore * 100)}%`,
                          backgroundColor:
                            relScore >= 0.7 ? "#107E3E" :
                            relScore >= 0.4 ? "#E9730C" : "#BB0000",
                        }}
                      />
                    </div>
                    <span className="score-label">{r.score.toFixed(1)}</span>
                  </div>
                </div>
                {r.breadcrumbs && (
                  <div className="breadcrumbs">{r.breadcrumbs}</div>
                )}
                {r.description && (
                  <p className="description">{r.description}</p>
                )}
                <div className="url-row">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="url"
                  >
                    {r.url}
                  </a>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(r.url, i)}
                    title="Copy URL"
                  >
                    {copiedIdx === i ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#107E3E" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <footer className="footer">
        DXR Guideline Matcher · Core Design · Fiori Guidelines v1-136
      </footer>

      <style jsx>{baseStyles}</style>
    </div>
  );
}

const baseStyles = `
  .container {
    max-width: 780px;
    margin: 0 auto;
    padding: 32px 20px 48px;
    min-height: 100vh;
  }
  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }
  .spinner {
    width: 32px; height: 32px;
    border: 3px solid #E5E5E5;
    border-top-color: ${SAP_BLUE};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text {
    margin-top: 14px;
    color: #6A7B8C;
    font-size: 14px;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid ${SAP_BLUE};
  }
  .logo-mark {
    width: 38px; height: 38px;
    border-radius: 9px;
    background: linear-gradient(135deg, ${SAP_BLUE}, #0053B8);
    flex-shrink: 0;
  }
  .title {
    font-size: 23px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.3px;
  }
  .subtitle {
    font-size: 13px;
    color: #6A7B8C;
    margin: 3px 0 0;
  }
  .dim { color: #A0ABB5; }

  /* Input */
  .input-section { margin-bottom: 24px; }
  .label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .hint {
    font-size: 13px;
    color: #6A7B8C;
    margin: 0 0 10px;
    line-height: 1.5;
  }
  .hint kbd {
    background: #EDF1F5;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 12px;
    font-family: inherit;
    border: 1px solid #DEE2E6;
  }
  .textarea {
    width: 100%;
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.6;
    border: 1px solid #C4C4C4;
    border-radius: 8px;
    resize: vertical;
    font-family: inherit;
    color: #1D2D3E;
    background: #fff;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .textarea:focus {
    border-color: ${SAP_BLUE};
    box-shadow: 0 0 0 3px rgba(0,112,242,0.1);
  }
  .textarea::placeholder { color: #A0ABB5; }
  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
  }
  .search-btn {
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: ${SAP_BLUE};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .search-btn:hover:not(:disabled) { background: #0053B8; }
  .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .clear-btn {
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 500;
    color: #6A7B8C;
    background: transparent;
    border: 1px solid #DEE2E6;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .clear-btn:hover { background: #F0F2F4; }

  /* Errors & empty */
  .error-box {
    padding: 12px 16px;
    background: #FFF1F1;
    border: 1px solid #FFCDD2;
    border-radius: 8px;
    font-size: 13px;
    color: #BB0000;
    margin-bottom: 20px;
  }
  .empty-results {
    text-align: center;
    padding: 40px 20px;
    color: #8C9BA8;
    font-size: 14px;
  }

  /* Results */
  .results-section { margin-top: 8px; }
  .results-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .results-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
  .results-count {
    font-size: 12px;
    color: #8C9BA8;
  }
  .results-hint {
    font-size: 12px;
    color: #8C9BA8;
    margin: 0 0 16px;
  }

  .result-card {
    padding: 16px 18px;
    border: 1px solid #DEE2E6;
    border-radius: 10px;
    margin-bottom: 12px;
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .result-card:hover {
    border-color: #B0BCC8;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .result-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 6px;
  }
  .rank-badge {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: #EDF4FF;
    color: ${SAP_BLUE};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .result-body { flex: 1; min-width: 0; }
  .result-title {
    font-size: 15px;
    font-weight: 600;
    color: ${SAP_BLUE};
    text-decoration: none;
    line-height: 1.3;
  }
  .result-title:hover { text-decoration: underline; }
  .result-meta {
    display: flex;
    gap: 6px;
    margin-top: 5px;
    flex-wrap: wrap;
  }
  .tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
    white-space: nowrap;
  }
  .type-tag { background: #E8F0FE; color: #1A56DB; }
  .cat-tag { background: #EDF1F5; color: #556677; }
  .score-container {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    margin-top: 4px;
  }
  .score-bar {
    width: 48px; height: 6px;
    border-radius: 3px;
    background: #EDF1F5;
    overflow: hidden;
  }
  .score-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }
  .score-label {
    font-size: 12px;
    font-weight: 600;
    color: #6A7B8C;
    min-width: 28px;
    text-align: right;
  }
  .breadcrumbs {
    font-size: 12px;
    color: #8C9BA8;
    margin-bottom: 4px;
    margin-left: 40px;
  }
  .description {
    font-size: 13px;
    color: #4A5D6E;
    margin: 0 0 8px;
    margin-left: 40px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .url-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: 40px;
  }
  .url {
    font-size: 12px;
    color: #8C9BA8;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .url:hover { color: ${SAP_BLUE}; }
  .copy-btn {
    padding: 4px 6px;
    border: 1px solid #DEE2E6;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    color: #6A7B8C;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .copy-btn:hover {
    background: #F0F2F4;
    border-color: #B0BCC8;
  }

  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #E8EBEE;
    text-align: center;
    font-size: 12px;
    color: #A0ABB5;
  }

  @media (max-width: 600px) {
    .container { padding: 20px 14px 36px; }
    .title { font-size: 19px; }
    .result-top { flex-wrap: wrap; }
    .score-container { margin-left: 40px; }
  }
`;
