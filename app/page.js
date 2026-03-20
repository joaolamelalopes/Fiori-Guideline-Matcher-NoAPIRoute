"use client";

import { useState, useEffect, useCallback } from "react";

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

const SYNONYMS = {
  "error":["message","validation","warning","value-state","error-handling"],"errors":["message","validation","warning","value-state"],"warning":["message","value-state","messaging"],"alert":["message-box","message-strip","dialog","messaging"],"popup":["dialog","popover","message-box"],"modal":["dialog"],"dropdown":["select","combo-box","combo box"],"toast":["message-toast","messaging"],"notification":["message-strip","message-toast","notification-center","messaging"],"spacing":["spacing","layout","margins","padding","visual"],"padding":["spacing","layout","visual"],"margin":["spacing","layout","visual"],"alignment":["layout","visual","typography"],"font":["typography","visual"],"text":["typography","label","title","formatted-text","writing"],"color":["colors","semantic-colors","visual","value-state","theming"],"colours":["colors","semantic-colors","visual","theming"],"icon":["icon","visual"],"button":["button","action","action-placement","footer-toolbar"],"buttons":["button","action","action-placement","footer-toolbar"],"link":["link","navigation","smart-link"],"links":["link","navigation","smart-link"],"table":["responsive-table","grid-table","analytical-table","table","smart-table"],"tables":["responsive-table","grid-table","analytical-table","table","smart-table"],"list":["list","list-report","worklist","standard-list-item"],"form":["form","smart-form","form-field-validation","input-field"],"forms":["form","smart-form","form-field-validation"],"input":["input-field","input","form","form-field-validation"],"field":["input-field","form","form-field-validation","smart-field"],"fields":["input-field","form","form-field-validation","smart-field"],"search":["search","filter-bar","smart-filter-bar"],"filter":["filter-bar","smart-filter-bar","visual-filter-bar","search"],"filtering":["filter-bar","smart-filter-bar","visual-filter-bar"],"sort":["table","view-settings-dialog"],"sorting":["table","view-settings-dialog"],"column":["responsive-table","grid-table","table"],"columns":["responsive-table","grid-table","table"],"row":["responsive-table","grid-table","table"],"rows":["responsive-table","grid-table","table"],"tab":["icontabbar","tab-bar","navigation"],"tabs":["icontabbar","tab-bar","navigation"],"menu":["user-menu","navigation-menu","action-sheet","navigation"],"header":["shell-bar","header-toolbar","object-page","dynamic-page"],"toolbar":["header-toolbar","footer-toolbar","toolbar-overview","action-placement"],"footer":["footer-toolbar","action-placement"],"navigate":["navigation","breadcrumb","link"],"navigation":["navigation","breadcrumb","shell-bar"],"back":["navigation","shell-bar"],"breadcrumb":["breadcrumb","navigation"],"card":["cards","card","analytical-card","calendar-card"],"cards":["cards","card","analytical-card"],"chart":["chart","chart-vizframe","smart-chart","data-visualization"],"charts":["chart","chart-vizframe","smart-chart","data-visualization"],"graph":["chart","chart-vizframe","data-visualization"],"wizard":["wizard","floorplan"],"step":["wizard","step-input","process-flow"],"steps":["wizard","step-input","process-flow"],"dialog":["dialog","message-box","select-dialog","value-help-dialog"],"progress":["progress-indicator","busy-indicator","busy-handling"],"loading":["busy-indicator","busy-handling","placeholder-loading","busy-state"],"spinner":["busy-indicator","busy-handling"],"empty":["empty-states","illustrated-message"],"blank":["empty-states","illustrated-message"],"placeholder":["placeholder-loading","empty-states"],"avatar":["avatar","avatar-group"],"image":["image","avatar","carousel"],"upload":["upload-set"],"file":["upload-set","cloud-file-browser"],"date":["date-picker","date-range-selection","calendar"],"time":["time-picker","datetime-picker"],"calendar":["calendar","planning-calendar","single-planning-calendar"],"switch":["switch","checkbox","radio-button"],"toggle":["switch"],"checkbox":["checkbox","switch"],"radio":["radio-button"],"select":["select","combo-box","select-dialog"],"picker":["date-picker","time-picker","color-picker","datetime-picker"],"slider":["slider","range-slider"],"rating":["rating-indicator"],"badge":["generic-tag","object-display-elements"],"tag":["generic-tag","token"],"token":["token","multi-input"],"chip":["token","generic-tag"],"panel":["panel","side-panel","dynamic-side-content"],"sidebar":["side-navigation","side-panel","dynamic-side-content"],"drawer":["side-panel","dynamic-side-content"],"tree":["tree","tree-table"],"hierarchy":["tree","tree-table","process-flow"],"timeline":["timeline","process-flow"],"workflow":["process-flow","wizard"],"drag":["drag-and-drop"],"drop":["drag-and-drop"],"copy":["object-handling","copy"],"create":["object-handling","create","wizard"],"edit":["object-handling","edit","draft-handling"],"delete":["object-handling","delete-objects"],"save":["object-handling","draft-handling","footer-toolbar"],"draft":["draft-handling"],"cancel":["object-handling","draft-handling","messaging"],"discard":["draft-handling","object-handling"],"undo":["draft-handling"],"variant":["variant-management"],"personalization":["p13n-dialog","variant-management","table-personalization"],"settings":["view-settings-dialog","p13n-dialog","variant-management"],"responsive":["responsive-table","responsive","adaptive","multi-device"],"mobile":["mobile-integration","responsive","adaptive"],"desktop":["responsive","adaptive"],"tablet":["responsive","adaptive"],"truncat":["wrapping-and-truncation","typography"],"wrap":["wrapping-and-truncation","typography"],"overflow":["wrapping-and-truncation","toolbar-overview"],"scroll":["scroll-container","responsive-table"],"tooltip":["using-tooltips"],"hint":["using-tooltips","label","placeholder"],"help":["value-help-dialog","using-tooltips"],"accessibility":["accessibility","keyboard","inclusive-design"],"keyboard":["keyboard","accessibility"],"focus":["keyboard","accessibility","interaction"],"contrast":["accessibility","colors","visual"],"theme":["theming","colors","belize","horizon","quartz"],"dark":["theming","colors"],"light":["theming","colors","quartz"],"object-page":["object-page","floorplan"],"list-report":["list-report","floorplan"],"overview":["overview-page","floorplan"],"worklist":["worklist","floorplan"],"analytical":["analytical-list-page","analytical-table","analytical-card"],"floorplan":["floorplan","object-page","list-report","wizard","overview-page"],"layout":["dynamic-page","flexible-column-layout","page-layouts"],"onboarding":["getting-started","wizard","empty-states"],"label":["label","form","typography","writing"],"wording":["writing-and-wording","text-guidelines"],"content":["writing-and-wording","formatted-text"],"message":["messaging","message-handling","message-box","message-popover","message-strip","message-toast","message-view"],"messages":["messaging","message-handling","message-box","message-popover","message-strip","message-toast"],"validation":["form-field-validation","messaging","value-state"],"inline":["form-field-validation","value-state","message-strip"],"status":["value-state","ui-element-states","generic-tag","semantic-colors"],"state":["value-state","ui-element-states","busy-state"],"semantic":["semantic-colors","value-state","how-to-use-semantic-colors"],"indicator":["progress-indicator","busy-indicator","status-indicator","value-state"],"illustration":["illustrated-message","ux-illustrations","empty-states"],"ai":["ai-button","ai-notice","ai-acknowledgment","ai-writing-assistant","joule","generative-ai"],"joule":["joule","ai-and-joule-design"],
};

function stem(w){if(w.length<=4)return w;return w.replace(/ies$/,"y").replace(/tion$/,"t").replace(/sion$/,"s").replace(/ment$/,"").replace(/ness$/,"").replace(/ling$/,"l").replace(/ting$/,"t").replace(/ning$/,"n").replace(/ring$/,"r").replace(/ing$/,"").replace(/ated$/,"at").replace(/ized$/,"iz").replace(/ised$/,"is").replace(/ed$/,"").replace(/ly$/,"").replace(/er$/,"").replace(/es$/,"").replace(/s$/,"");}
function tokenize(t){return t.toLowerCase().replace(/[^a-z0-9\s-]/g," ").split(/\s+/).filter(w=>w.length>=2);}

function extractQueryTerms(text) {
  const words = tokenize(text);
  const terms = new Set(), expanded = new Set();
  for (const w of words) {
    if (STOP_WORDS.has(w)) continue;
    terms.add(w); terms.add(stem(w));
    const syns = SYNONYMS[w] || SYNONYMS[stem(w)];
    if (syns) for (const s of syns) { expanded.add(s.toLowerCase()); for (const p of s.split("-")) if (p.length>=3) expanded.add(p); }
  }
  const cw = words.filter(w => !STOP_WORDS.has(w) && w.length >= 3);
  const bigrams = [];
  for (let i = 0; i < cw.length - 1; i++) { bigrams.push(cw[i]+" "+cw[i+1]); bigrams.push(cw[i]+"-"+cw[i+1]); }
  return { terms: [...terms], expanded: [...expanded], bigrams };
}

function buildIDF(corpus) {
  const df = {}, N = corpus.length;
  for (const e of corpus) { const ws = new Set(tokenize(e.search)); for (const w of ws) df[w] = (df[w]||0)+1; }
  const idf = {};
  for (const [w, f] of Object.entries(df)) idf[w] = Math.log(N / f);
  return idf;
}

function scoreEntry(entry, terms, expanded, bigrams, idf) {
  const s = entry.search, t = entry.title.toLowerCase(), sl = (entry.url||"").split("/").pop()?.replace(/-/g," ")||"";
  let sc = 0;
  for (const x of terms) { if(s.includes(x)){const w=Math.min(idf[x]||1,5);sc+=w;if(t.includes(x))sc+=w*2;if(sl.includes(x))sc+=w*1.5;} const st=stem(x);if(st!==x&&s.includes(st))sc+=(idf[st]||1)*0.5; }
  for (const x of expanded) { if(s.includes(x)){sc+=1.5;if(t.includes(x))sc+=3;if(sl.includes(x))sc+=2.5;} }
  for (const b of bigrams) { if(s.includes(b))sc+=6;if(t.includes(b))sc+=10; }
  return Math.round(sc * 100) / 100;
}

// ─── COLORS ────────────────────────────────────────────────────────
const T="#0A9A9A",TL="#F0F9F9",TD="#087070",D="#1D2D3E",G6="#556677",G4="#8C9BA8",G2="#DEE2E6",G1="#F0F2F4",G0="#F7F8FA";

// ─── UI ────────────────────────────────────────────────────────────
export default function Home() {
  const [corpus, setCorpus] = useState(null);
  const [idf, setIdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issueText, setIssueText] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [platform, setPlatform] = useState("All");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    fetch("/fiori-corpus.json")
      .then(r => r.json())
      .then(data => { setCorpus(data); setIdf(buildIDF(data)); setLoading(false); })
      .catch(() => { setError("Failed to load guidelines corpus."); setLoading(false); });
  }, []);

  const handleSearch = useCallback(() => {
    if (!issueText.trim() || !corpus || !idf) return;
    setError(null);
    const { terms, expanded, bigrams } = extractQueryTerms(issueText);
    const filtered = platform === "All" ? corpus : corpus.filter(e => e.platform === platform);
    const scored = filtered.map((entry, idx) => ({ ...entry, idx, score: scoreEntry(entry, terms, expanded, bigrams, idf) })).filter(e => e.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
    setResults(scored);
  }, [issueText, corpus, idf, platform]);

  const kd = e => { if (e.key==="Enter"&&(e.metaKey||e.ctrlKey)) handleSearch(); };
  const cp = (url, i) => { navigator.clipboard?.writeText(url); setCopiedIdx(i); setTimeout(()=>setCopiedIdx(null),1500); };
  const cpAll = () => { if(!results)return; navigator.clipboard?.writeText(results.map((r,i)=>`${i+1}. ${r.title}\n   ${r.url}`).join("\n\n")); setCopiedAll(true); setTimeout(()=>setCopiedAll(false),2000); };

  if (loading) return (<div className="pg"><div className="ctr"><div className="spin"/><p className="lt">Loading guidelines corpus...</p></div><style jsx>{css}</style></div>);

  const mx = results?.[0]?.score || 1;

  return (
    <div className="pg">
      <header className="hb"><div className="hi">
        <div className="hbr">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="white" fillOpacity="0.15"/><path d="M6 12l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div><div className="ht">Design Excellence Review</div><div className="hs">Guideline Matcher</div></div>
        </div>
        <div className="hbd">Core Design</div>
      </div></header>

      <div className="ct">
        <div className="sec">
          <div className="sl">Platform</div>
          <div className="ptg">{["All","Web","iOS","Android"].map(p=>(
            <button key={p} className={`pb ${platform===p?"pa":""}`} onClick={()=>{setPlatform(p);setResults(null);}}>
              {p}{corpus&&<span className="pc">{p==="All"?corpus.length:corpus.filter(e=>e.platform===p).length}</span>}
            </button>
          ))}</div>
        </div>

        <div className="sec">
          <div className="sl">Issue Description</div>
          <div className="sh">Paste the full P/I/R text. Searches all Fiori guidelines regardless of DXR dimension. <kbd className="kbd">Cmd+Enter</kbd></div>
          <textarea className="ta" value={issueText} onChange={e=>setIssueText(e.target.value)} onKeyDown={kd} placeholder={"Problem: The error messages after form validation are displayed in a generic browser alert instead of inline field-level indicators.\n\nImpact: Users cannot quickly identify which specific fields need correction, increasing task completion time and error rates.\n\nRecommendation: Use value state indicators on individual form fields and a message popover to collect and display all validation errors."} rows={7}/>
          <div className="ar">
            <button className="bp" onClick={handleSearch} disabled={!issueText.trim()}>Find Guidelines</button>
            {issueText&&<button className="bg" onClick={()=>{setIssueText("");setResults(null);setError(null);}}>Clear</button>}
          </div>
        </div>

        {error&&<div className="eb"><strong>Error:</strong> {error}</div>}
        {results&&results.length===0&&<div className="es">No matching guidelines found. Try rephrasing or using different keywords.</div>}

        {results&&results.length>0&&(
          <div className="sec">
            <div className="rb">
              <div><div className="sl" style={{marginBottom:0}}>Matched Guidelines</div><div className="sh" style={{marginTop:2}}>{results.length} results · Click title to open · Copy URL for your issue</div></div>
              <button className="bca" onClick={cpAll}>
                {copiedAll?(<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#107E3E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied</>):(<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy All URLs</>)}
              </button>
            </div>
            <div className="rl">{results.map((r,i)=>{const rs=r.score/mx;return(
              <div key={r.idx} className="rc">
                <div className="rrc"><div className="rr">{i+1}</div><div className="rsb"><div className="rsf" style={{height:`${Math.round(rs*100)}%`,backgroundColor:rs>=0.7?T:rs>=0.4?"#E9730C":"#BB0000"}}/></div></div>
                <div className="rcn">
                  <div className="rtr"><a href={r.url} target="_blank" rel="noopener noreferrer" className="rt">{r.title}</a>
                    <button className="bcs" onClick={()=>cp(r.url,i)} title="Copy URL">{copiedIdx===i?(<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#107E3E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>):(<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>)}</button>
                  </div>
                  <div className="rtg">{r.platform&&platform==="All"&&<span className="tg tp">{r.platform}</span>}{r.type&&<span className="tg tt">{r.type}</span>}{r.category&&<span className="tg tc">{r.category}</span>}</div>
                  {r.breadcrumbs&&<div className="rbc">{r.breadcrumbs}</div>}
                  {r.description&&<div className="rd">{r.description}</div>}
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="ru">{r.url}</a>
                </div>
              </div>
            );})}</div>
          </div>
        )}
      </div>

      <footer className="fb"><div className="fi">Design Excellence Review · Core Design Team · Fiori Guidelines v1-136 + iOS + Android</div></footer>
      <style jsx>{css}</style>
    </div>
  );
}

const css = `
  .pg{min-height:100vh;background:${G0};display:flex;flex-direction:column}
  .hb{background:linear-gradient(135deg,${TD},${T});color:#fff;padding:0 20px}
  .hi{max-width:720px;margin:0 auto;padding:18px 0;display:flex;align-items:center;justify-content:space-between}
  .hbr{display:flex;align-items:center;gap:12px}
  .ht{font-size:16px;font-weight:700;letter-spacing:-0.2px}
  .hs{font-size:12px;opacity:0.75;margin-top:1px}
  .hbd{font-size:11px;font-weight:600;padding:4px 10px;border-radius:4px;background:rgba(255,255,255,0.15);letter-spacing:0.3px;text-transform:uppercase}
  .ct{max-width:720px;width:100%;margin:0 auto;padding:24px 20px 48px;flex:1}
  .sec{background:#fff;border:1px solid ${G2};border-radius:8px;padding:20px 24px;margin-bottom:16px}
  .sl{font-size:13px;font-weight:600;color:${TD};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px}
  .sh{font-size:13px;color:${G4};line-height:1.5;margin-bottom:10px}
  .kbd{display:inline-block;background:${G1};border:1px solid ${G2};border-radius:3px;padding:0 5px;font-size:11px;font-family:inherit;color:${G6};margin-left:4px}
  .ptg{display:flex;gap:0;border:1px solid ${G2};border-radius:6px;overflow:hidden;width:fit-content}
  .pb{padding:7px 14px;font-size:13px;font-weight:500;color:${G6};background:#fff;border:none;border-right:1px solid ${G2};cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:6px;font-family:inherit}
  .pb:last-child{border-right:none}.pb:hover{background:${G0}}
  .pa{background:${T}!important;color:#fff!important}
  .pa .pc{background:rgba(255,255,255,0.2);color:#fff}
  .pc{font-size:11px;background:${G1};color:${G4};padding:1px 6px;border-radius:10px;font-weight:600}
  .ta{width:100%;padding:12px 14px;font-size:14px;line-height:1.6;border:1px solid ${G2};border-radius:6px;resize:vertical;font-family:inherit;color:${D};background:${G0};box-sizing:border-box;outline:none;transition:border-color .15s,box-shadow .15s}
  .ta:focus{border-color:${T};box-shadow:0 0 0 3px rgba(10,154,154,0.1);background:#fff}
  .ta::placeholder{color:#B0BAC4}
  .ar{display:flex;align-items:center;gap:10px;margin-top:12px}
  .bp{padding:9px 22px;font-size:13px;font-weight:600;color:#fff;background:${T};border:none;border-radius:6px;cursor:pointer;transition:background .15s;font-family:inherit}
  .bp:hover:not(:disabled){background:${TD}}.bp:disabled{opacity:0.5;cursor:not-allowed}
  .bg{padding:9px 16px;font-size:13px;font-weight:500;color:${G6};background:transparent;border:1px solid ${G2};border-radius:6px;cursor:pointer;transition:background .15s;font-family:inherit}
  .bg:hover{background:${G1}}
  .rb{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}
  .bca{padding:7px 14px;font-size:12px;font-weight:600;color:${T};background:${TL};border:1px solid ${T}33;border-radius:6px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:6px;font-family:inherit;white-space:nowrap;flex-shrink:0}
  .bca:hover{background:#E0F4F4}
  .rl{display:flex;flex-direction:column;gap:2px}
  .rc{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid ${G1}}
  .rc:last-child{border-bottom:none}
  .rrc{display:flex;flex-direction:column;align-items:center;gap:6px;width:28px;flex-shrink:0;padding-top:2px}
  .rr{width:24px;height:24px;border-radius:50%;background:${TL};color:${T};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}
  .rsb{width:4px;flex:1;min-height:20px;background:${G1};border-radius:2px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end}
  .rsf{width:100%;border-radius:2px;transition:height .3s ease}
  .rcn{flex:1;min-width:0}
  .rtr{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
  .rt{font-size:14px;font-weight:600;color:${T};text-decoration:none;line-height:1.3}
  .rt:hover{text-decoration:underline}
  .bcs{padding:3px 5px;border:1px solid ${G2};border-radius:3px;background:#fff;cursor:pointer;color:${G4};display:flex;align-items:center;flex-shrink:0;transition:all .15s}
  .bcs:hover{background:${G1};border-color:${G4}}
  .rtg{display:flex;gap:5px;margin-top:5px;flex-wrap:wrap}
  .tg{font-size:10px;padding:2px 7px;border-radius:3px;font-weight:600;text-transform:uppercase;letter-spacing:0.3px}
  .tp{background:#E6F4EA;color:#137333}.tt{background:#E8F0FE;color:#1A56DB}.tc{background:${G1};color:${G6}}
  .rbc{font-size:11px;color:${G4};margin-top:5px}
  .rd{font-size:12px;color:${G6};margin-top:4px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .ru{font-size:11px;color:${G4};text-decoration:none;margin-top:6px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ru:hover{color:${T}}
  .ctr{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px}
  .spin{width:28px;height:28px;border:3px solid ${G2};border-top-color:${T};border-radius:50%;animation:sp .8s linear infinite}
  @keyframes sp{to{transform:rotate(360deg)}}
  .lt{margin-top:12px;color:${G4};font-size:13px}
  .eb{padding:12px 16px;background:#FFF1F1;border:1px solid #FFCDD2;border-left:4px solid #BB0000;border-radius:6px;font-size:13px;color:#BB0000;margin-bottom:16px}
  .es{text-align:center;padding:40px 20px;color:${G4};font-size:13px;background:#fff;border:1px solid ${G2};border-radius:8px}
  .fb{background:#fff;border-top:1px solid ${G2};padding:0 20px}
  .fi{max-width:720px;margin:0 auto;padding:14px 0;font-size:11px;color:${G4};text-align:center}
  @media(max-width:600px){.hbd{display:none}.ct{padding:16px 12px 36px}.sec{padding:16px}.rc{gap:10px}.rrc{width:22px}.rb{flex-direction:column;gap:10px}}
`;
