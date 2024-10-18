(function() {
    const bigfoot = (options) => {
        const defaults = {
          actionOriginalFN: "hide",
          activateCallback: () => {},
          activateOnHover: false,
          allowMultipleFN: false,
          anchorPattern: /(fn|footnote|note)[:\-_\d]/gi,
          anchorParentTagname: 'sup',
          breakpoints: {},
          deleteOnUnhover: false,
          footnoteParentClass: 'footnote',
          footnoteTagname: 'li',
          hoverDelay: 250,
          numberResetSelector: undefined,
          popoverDeleteDelay: 300,
          popoverCreateDelay: 100,
          animationDuration: 200,
          positionContent: true,
          preventPageScroll: true,
          scope: false,
          useFootnoteOnlyOnce: true,
          contentMarkup: `<aside class='bigfoot-footnote is-positioned-bottom' data-footnote-number='{{FOOTNOTENUM}}' data-footnote-identifier='{{FOOTNOTEID}}' alt='Footnote {{FOOTNOTENUM}}'>
            <div class='bigfoot-footnote__wrapper'>
              <div class='bigfoot-footnote__content'>
                {{FOOTNOTECONTENT}}
              </div>
            </div>
            <div class='bigfoot-footnote__tooltip'></div>
          </aside>`,
          buttonMarkup: `<div class='bigfoot-footnote__container'>
            <button class='bigfoot-footnote__button' id='{{SUP:data-footnote-backlink-ref}}' data-footnote-number='{{FOOTNOTENUM}}' data-footnote-identifier='{{FOOTNOTEID}}' alt='See Footnote {{FOOTNOTENUM}}' rel='footnote' data-bigfoot-footnote='{{FOOTNOTECONTENT}}'>
              <svg class='bigfoot-footnote__button__circle' viewbox='0 0 6 6' preserveAspectRatio='xMinYMin'><circle r='3' cx='3' cy='3' fill='white'></circle></svg>
              <svg class='bigfoot-footnote__button__circle' viewbox='0 0 6 6' preserveAspectRatio='xMinYMin'><circle r='3' cx='3' cy='3' fill='white'></circle></svg>
              <svg class='bigfoot-footnote__button__circle' viewbox='0 0 6 6' preserveAspectRatio='xMinYMin'><circle r='3' cx='3' cy='3' fill='white'></circle></svg>
            </button>
          </div>`
        };
      
        const settings = { ...defaults, ...options };
        const popoverStates = {};
      
        const footnoteInit = () => {
            let curResetElement, currentLastFootnoteLink, footnoteAnchors, footnoteButton, lastResetElement, parent, relevantFNLink, relevantFootnote;
            let finalFNLinks = [], footnoteIDNum, footnoteLinks = [], footnotes = [], footnoteNum;
            
            const footnoteButtonSearchQuery = settings.scope ? `${settings.scope} a[href*='#']` : "a[href*='#']";
        
            footnoteAnchors = [...document.querySelectorAll(footnoteButtonSearchQuery)].filter(anchor => {
                const relAttr = anchor.getAttribute("rel") || "";
                const href = anchor.getAttribute("href") + relAttr;
                const parentClass = anchor.closest(`[class*="${settings.footnoteParentClass}"]:not(a):not(${settings.anchorParentTagname})`);
                return settings.anchorPattern.test(href) && !parentClass;
            });
        
            cleanFootnoteLinks(footnoteAnchors, footnoteLinks);
        
            footnoteLinks.forEach(link => {
                let relatedFN = link.getAttribute("data-footnote-ref").replace(/[:.+~*\]\[]/g, "\\$&");
              
                if (settings.useFootnoteOnlyOnce) {
                  relatedFN += ":not(.footnote-processed)";
                }
              
                const closestFootnoteEl = document.querySelector(relatedFN)?.closest(settings.footnoteTagname);

                
                if (closestFootnoteEl) {
                  closestFootnoteEl.classList.add("footnote-processed");
                  footnotes.push(closestFootnoteEl);
                  finalFNLinks.push(link);
                }
            });
        
            currentLastFootnoteLink = document.querySelector("[data-footnote-identifier]:last-child");
            footnoteIDNum = currentLastFootnoteLink ? +currentLastFootnoteLink.dataset.footnoteIdentifier : 0;
        
            footnotes.forEach((footnote, i) => {
                let footnoteContent = removeBackLinks(footnote.innerHTML.trim(), finalFNLinks[i].dataset.footnoteBacklinkRef)
                    .replace(/"/g, "&quot;")
                    .replace(/&lt;/g, "&ltsym;")
                    .replace(/&gt;/g, "&gtsym;")
                    .replace(/'/g, "&apos;");
                
                footnoteIDNum++;
                relevantFNLink = finalFNLinks[i];
                relevantFootnote = footnotes[i];
                
                if (settings.numberResetSelector) {
                    curResetElement = relevantFNLink.closest(settings.numberResetSelector);
                    footnoteNum = curResetElement === lastResetElement ? footnoteNum + 1 : 1;
                    lastResetElement = curResetElement;
                } else {
                    footnoteNum = footnoteIDNum;
                }
        
                if (!footnoteContent.startsWith("<")) {
                    footnoteContent = `<p>${footnoteContent}</p>`;
                }
        
                footnoteButton = settings.buttonMarkup
                    .replace(/\{\{FOOTNOTENUM\}\}/g, footnoteNum)
                    .replace(/\{\{FOOTNOTEID\}\}/g, footnoteIDNum)
                    .replace(/\{\{FOOTNOTECONTENT\}\}/g, footnoteContent);
                
                footnoteButton = replaceWithReferenceAttributes(footnoteButton, "SUP", relevantFNLink);
                footnoteButton = replaceWithReferenceAttributes(footnoteButton, "FN", relevantFootnote);
                
                const footnoteButtonElem = document.createElement('div');
                footnoteButtonElem.innerHTML = footnoteButton;
                relevantFNLink.insertAdjacentElement('beforebegin', footnoteButtonElem);
        
                parent = relevantFootnote.parentElement;
        
                switch (settings.actionOriginalFN.toLowerCase()) {
                    case "hide":
                        relevantFNLink.classList.add("footnote-print-only");
                        relevantFootnote.classList.add("footnote-print-only");
                        deleteEmptyOrHR(parent);
                        break;
                    case "delete":
                        relevantFNLink.remove();
                        relevantFootnote.remove();
                        deleteEmptyOrHR(parent);
                        break;
                    default:
                        relevantFNLink.classList.add("footnote-print-only");
                }
            });
        };
      
        const cleanFootnoteLinks = (footnoteAnchors, footnoteLinks = []) => {
            footnoteAnchors.forEach(anchor => {
              const linkHREF = `#${anchor.getAttribute("href").split("#")[1]}`;
              const parent = anchor.closest(settings.anchorParentTagname);
              const child = anchor.querySelector(settings.anchorParentTagname);
          
              let linkID;
              let targetElement;
          
              if (parent) {
                linkID = (parent.id || "") + (anchor.id || "");
                targetElement = parent;
              } else if (child) {
                linkID = (child.id || "") + (anchor.id || "");
                targetElement = anchor;
              } else {
                linkID = anchor.id || "";
                targetElement = anchor;
              }
          
              targetElement.dataset.footnoteBacklinkRef = linkID;
              targetElement.dataset.footnoteRef = linkHREF;
              footnoteLinks.push(targetElement);
            });
          
            return footnoteLinks;
        };

        const replaceWithReferenceAttributes = (string, referenceKeyword, referenceElement) => {
            let refRegex = new RegExp(`\\{\\{${referenceKeyword}:([^\\}]*)\\}\\}`, "g");
            let refMatches = refRegex.exec(string);
        
            while (refMatches) {
                if (refMatches[1]) {
                    const refReplaceText = referenceElement.getAttribute(refMatches[1]) || "";
                    string = string.replace(`{{${referenceKeyword}:${refMatches[1]}}}`, refReplaceText);
                }
                refMatches = refRegex.exec(string);
            }
        
            return string;
        };

        const deleteEmptyOrHR = (el) => {
            let parent;
            
            if (el.innerHTML.trim() === '' || [...el.children].filter(child => !child.classList.contains("footnote-print-only")).length === 0) {
                parent = el.parentElement;
                if (settings.actionOriginalFN.toLowerCase() === "delete") {
                    el.remove();
                } else {
                    el.classList.add("footnote-print-only");
                }
                return deleteEmptyOrHR(parent);
            } else if ([...el.children].filter(child => !child.classList.contains("footnote-print-only")).length === [...el.children].filter(child => child.tagName === 'HR' && !child.classList.contains("footnote-print-only")).length) {
                parent = el.parentElement;
                if (settings.actionOriginalFN.toLowerCase() === "delete") {
                    el.remove();
                } else {
                    [...el.querySelectorAll("hr")].forEach(hr => hr.classList.add("footnote-print-only"));
                    el.classList.add("footnote-print-only");
                }
                return deleteEmptyOrHR(parent);
            }
        };

        const removeBackLinks = (footnoteHTML, backlinkID) => {
            if (backlinkID.includes(' ')) {
                backlinkID = backlinkID.trim().replace(/\s+/g, "|").replace(/(.*)/g, "($1)");
            }
        
            const regex = new RegExp(`(\\s|&nbsp;)*<\\s*a[^#<]*#${backlinkID}[^>]*>(.*?)<\\s*/\\s*a>`, "g");
        
            return footnoteHTML.replace(regex, "").replace("[]", "");
        };
      
        const addEventListeners = () => {
            document.addEventListener('mouseenter', buttonHover, true);
            document.addEventListener('touchend', touchClick);
            document.addEventListener('mouseout', unhoverFeet);
            document.addEventListener('keyup', escapeKeypress);
            window.addEventListener('scroll', repositionFeet);
            window.addEventListener('resize', repositionFeet);
            document.addEventListener('gestureend', repositionFeet);
        };
      
        document.addEventListener('DOMContentLoaded', () => {
            footnoteInit();
        //   addEventListeners();
        });
      
        return {
        //   removePopovers,
        //   close: removePopovers,
        //   createPopover,
        //   activate: createPopover,
        //   repositionFeet,
        //   reposition: repositionFeet,
        //   addBreakpoint,
        //   removeBreakpoint,
        //   getSetting,
        //   updateSetting
        };
    };    

    window.bigfoot = bigfoot;
})();
