(function() {
  const tinyfoot = (options) => {

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
        showDateAndTime: false,
        useFootnoteOnlyOnce: true,
        contentMarkup: `<aside class='tinyfoot-footnote is-positioned-bottom' data-footnote-number='{{FOOTNOTENUM}}' data-footnote-identifier='{{FOOTNOTEID}}' alt='Footnote {{FOOTNOTENUM}}'>
          <div class='tinyfoot-footnote__wrapper'>
            <div class='tinyfoot-footnote__content'>
              {{FOOTNOTECONTENT}}
            </div>
          </div>
          <div class='tinyfoot-footnote__tooltip'></div>
        </aside>`,
        buttonMarkup: `<div class='tinyfoot-footnote__container'>
          <button class='tinyfoot-footnote__button' id='{{SUP:data-footnote-backlink-ref}}' data-footnote-number='{{FOOTNOTENUM}}' data-footnote-identifier='{{FOOTNOTEID}}' alt='See Footnote {{FOOTNOTENUM}}' rel='footnote' data-tinyfoot-footnote='{{FOOTNOTECONTENT}}'>
            <svg class='tinyfoot-footnote__button__circle' viewbox='0 0 6 6' preserveAspectRatio='xMinYMin'><circle r='3' cx='3' cy='3' fill='white'></circle></svg>
            <svg class='tinyfoot-footnote__button__circle' viewbox='0 0 6 6' preserveAspectRatio='xMinYMin'><circle r='3' cx='3' cy='3' fill='white'></circle></svg>
            <svg class='tinyfoot-footnote__button__circle' viewbox='0 0 6 6' preserveAspectRatio='xMinYMin'><circle r='3' cx='3' cy='3' fill='white'></circle></svg>
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
              return href.match(settings.anchorPattern) && !parentClass;
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
              
              const range = document.createRange();
              const footnoteButtonElement = range.createContextualFragment(footnoteButton).firstElementChild;
              relevantFNLink.insertAdjacentElement('beforebegin', footnoteButtonElement);
      
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

      /************ EVENT HANDLERS *************/

      const buttonHover = (event) => {
          if (settings.activateOnHover) {
              const buttonHovered = event.target.closest(".tinyfoot-footnote__button");
              const dataIdentifier = `[data-footnote-identifier='${buttonHovered.getAttribute("data-footnote-identifier")}']`;
              if (buttonHovered.classList.contains("is-active")) {
                  return;
              }
              
              buttonHovered.classList.add("is-hover-instantiated");
              
              if (!settings.allowMultipleFN) {
                  const otherPopoverSelector = `.tinyfoot-footnote:not(${dataIdentifier})`;
                  removePopovers(otherPopoverSelector);
              }
              createPopover(`.tinyfoot-footnote__button${dataIdentifier}`).forEach((button) => { button.classList.add("is-hover-instantiated") });
          }
      };
      

      const touchClick = (event) => {
          const target = event.target;
          const nearButton = target.closest(".tinyfoot-footnote__button");
          const nearFootnote = target.closest(".tinyfoot-footnote");
      
          if (nearButton) {
              event.preventDefault();
              clickButton(nearButton);
          } else if (!nearFootnote) {
              if (document.querySelector(".tinyfoot-footnote")) {
                  removePopovers();
              }
          }
      };
      
      const clickButton = function(button) {
          let dataIdentifier;
          button.blur();
          dataIdentifier = `data-footnote-identifier='${button.getAttribute("data-footnote-identifier")}'`;
      
          if (button.classList.contains("changing")) {
              return;
          } else if (!button.classList.contains("is-active")) {
              button.classList.add("changing");
              setTimeout(function() {
                  button.classList.remove("changing");
              }, settings.popoverCreateDelay);
      
              createPopover(`.tinyfoot-footnote__button[${dataIdentifier}]`);
              button.classList.add("is-click-instantiated");
      
              if (!settings.allowMultipleFN) {
                  removePopovers(`.tinyfoot-footnote:not([${dataIdentifier}])`);
              }
          } 
          else {
              if (!settings.allowMultipleFN) {
                  removePopovers();
              } else {
                  removePopovers(`.tinyfoot-footnote[${dataIdentifier}]`);
              }
          }
      };

      const escapeKeypress = function(event) {
          if (event.keyCode === 27) {
            return removePopovers();
          }
      };
      
      const unhoverFeet = (e) => {
        if(e.target.classList.contains("is-hover-instantiated")){
          if (settings.deleteOnUnhover && settings.activateOnHover) {
              return setTimeout(() => {
                  if (!document.querySelector(".tinyfoot-footnote__button:hover, .tinyfoot-footnote:hover")) {
                      return removePopovers();
                  }
              }, settings.hoverDelay);
          }
        }
      };
      

      const bindScrollHandler = function() {
          if (!settings.preventPageScroll) {
            return this;
          }
          
          this.addEventListener("DOMMouseScroll", function(event) { scrollHandler(event, this); });
          this.addEventListener("mousewheel", function(event) { scrollHandler(event, this); });
        
          return this;
      };

      const scrollHandler = function(event, el) {
          let popover = el.closest(".tinyfoot-footnote");
          let scrollTop = el.scrollTop;
          let scrollHeight = el.scrollHeight;
          let height = parseInt(getComputedStyle(el).height);
          
          if (scrollTop > 0 && scrollTop < 10) {
            popover.classList.add("is-scrollable");
          }
          
          if (!popover.classList.contains("is-scrollable")) {
            return;
          }
        
          let delta = event.type === "DOMMouseScroll" ? event.detail * -40 : event.wheelDelta;
          let up = delta > 0;
        
          const prevent = function() {
            event.stopPropagation();
            event.preventDefault();
            return false;
          };
        
          if (!up && -delta > scrollHeight - height - scrollTop) {
            el.scrollTop = scrollHeight;
            popover.classList.add("is-fully-scrolled");
            return prevent();
          } else if (up && delta > scrollTop) {
            el.scrollTop = 0;
            popover.classList.remove("is-fully-scrolled");
            return prevent();
          } else {
            popover.classList.remove("is-fully-scrolled");
          }
      };

      const repositionFeet = function(e) {
          if (settings.positionContent) {
              let type = e ? e.type : "resize";
      
              document.querySelectorAll(".tinyfoot-footnote").forEach(footnote => {
                  // Retrieve dimensions and positioning details
                  let identifier = footnote.getAttribute("data-footnote-identifier");
                  let contentWrapper = footnote.querySelector(".tinyfoot-footnote__content");
                  let button = document.querySelector(`.tinyfoot-footnote__button[data-footnote-identifier='${identifier}']`);
                  let roomLeft = roomCalc(button);
                  let marginSize = parseFloat(getComputedStyle(footnote).marginTop);
                  let maxHeightInCSS = parseFloat(footnote.getAttribute("data-tinyfoot-max-height"));
                  let totalHeight = 2 * marginSize + footnote.offsetHeight;
                  let maxHeightOnScreen = 10000;
      
                  // Determine position (top or bottom)
                  let positionOnTop = roomLeft.bottomRoom < totalHeight && roomLeft.topRoom > roomLeft.bottomRoom;
                  let lastState = popoverStates[identifier];
                  // Update classes and max heights
                  if (positionOnTop) {
                      if (lastState !== "top") {
                          popoverStates[identifier] = "top";
                          footnote.classList.add("is-positioned-top");
                          footnote.classList.remove("is-positioned-bottom");
                          footnote.style.transformOrigin = `${roomLeft.leftRelative * 100}% 100%`;
                      }
                      maxHeightOnScreen = roomLeft.topRoom - marginSize - 15;
                  } else {
                      if (lastState !== "bottom" || lastState === "init") {
                          popoverStates[identifier] = "bottom";
                          footnote.classList.remove("is-positioned-top");
                          footnote.classList.add("is-positioned-bottom");
                          footnote.style.transformOrigin = `${roomLeft.leftRelative * 100}% 0%`;
                      }
                      maxHeightOnScreen = roomLeft.bottomRoom - marginSize - 15;
                  }
      
                  contentWrapper.style.maxHeight = `${Math.min(maxHeightOnScreen, maxHeightInCSS)}px`;
                  thisElement = footnote;
                  // Resize handling
                  if (type === "resize") {
                      // Get maxWidthInCSS from the data attribute "tinyfoot-max-width"
                      const maxWidthInCSS = parseFloat(thisElement.getAttribute("tinyfoot-max-width"));
                      
                      // Select the main wrapper for the footnote
                      const mainWrap = thisElement.querySelector(".tinyfoot-footnote__wrapper");
                    
                      // Set maxWidth initially based on the CSS value
                      let maxWidth = maxWidthInCSS;
                    
                      // If the maxWidth is defined as a relative value (<= 1)
                      if (maxWidthInCSS <= 1) {
                        const relativeToWidth = (function() {
                          let userSpecifiedRelativeElWidth = 10000;
                          
                          // Check if settings specify an element to calculate the relative width against
                          if (settings.maxWidthRelativeTo) {
                            const relativeElement = document.querySelector(settings.maxWidthRelativeTo);
                            if (relativeElement) {
                              userSpecifiedRelativeElWidth = relativeElement.offsetWidth;
                            }
                          }
                    
                          // Use the minimum width between the window's inner width and the relative element width
                          return Math.min(window.innerWidth, userSpecifiedRelativeElWidth);
                        })();
                    
                        // Calculate maxWidth based on relative width
                        maxWidth = relativeToWidth * maxWidthInCSS;
                      }
                    
                      // Ensure maxWidth doesn't exceed the content width plus 1
                      const contentElement = thisElement.querySelector(".tinyfoot-footnote__content");
                      maxWidth = Math.min(maxWidth, contentElement.offsetWidth + 1);
                    
                      // Set the max-width of the main wrapper
                      mainWrap.style.maxWidth = `${maxWidth}px`;
                    
                      // Calculate the left position and set it
                      const buttonMarginLeft = parseFloat(window.getComputedStyle(button).marginLeft);
                      const buttonOuterWidth = button.offsetWidth;
                      thisElement.style.left = `${(-roomLeft.leftRelative * maxWidth + buttonMarginLeft + buttonOuterWidth / 2)}px`;
                    
                      // Call positionTooltip with the current element and leftRelative value
                      positionTooltip(thisElement, roomLeft.leftRelative);
                    }
                    
      
                  // Scroll handling
                  if (footnote.offsetHeight < contentWrapper.scrollHeight) {
                      footnote.classList.add("is-scrollable");
                  }
              });
          }
      };

      /************ AUXILLIARY FUNCTIONS *************/

      const calculatePixelDimension = function(dim, el) {
          if (dim === "none") {
            dim = 10000; // Very large value for "none"
          } else if (dim.includes("rem")) {
            dim = parseFloat(dim) * baseFontSize();
          } else if (dim.includes("em")) {
            dim = parseFloat(dim) * parseFloat(getComputedStyle(el).fontSize);
          } else if (dim.includes("px")) {
            dim = parseFloat(dim);
            if (dim <= 60) {
              dim = dim / parseFloat(getComputedStyle(el.parentNode).width);
            }
          } else if (dim.includes("%")) {
            dim = parseFloat(dim) / 100;
          }
          
          return dim;
      };

      const baseFontSize = () => {
          const el = document.createElement("div");
          el.style.cssText = "display:inline-block;padding:0;line-height:1;position:absolute;visibility:hidden;font-size:1em;";
          el.appendChild(document.createElement("M"));
          document.body.appendChild(el);
          
          const size = el.offsetHeight;
          document.body.removeChild(el);
          
          return size;
        };
        

      const addBreakpoint = (size, trueCallback, falseCallback, deleteDelay = settings.popoverDeleteDelay, removeOpen = true) => {
          let mql, minMax, s, query;
          
          if (typeof size === "string") {
              s = size.toLowerCase() === "iphone" ? "<320px" : size.toLowerCase() === "ipad" ? "<768px" : size;
              minMax = s.charAt(0) === ">" ? "min" : s.charAt(0) === "<" ? "max" : null;
              query = minMax ? `(${minMax}-width: ${s.substring(1)})` : s;
              mql = window.matchMedia(query);
          } else {
              mql = size;
          }
      
          if (mql.media && mql.media === "invalid") {
              return {
                  added: false,
                  mq: mql,
                  listener: null
              };
          }
      
          const trueDefaultPositionSetting = minMax === "min";
          const falseDefaultPositionSetting = minMax === "max";
      
          trueCallback = trueCallback || makeDefaultCallbacks(removeOpen, deleteDelay, trueDefaultPositionSetting, ($popover) => {
              $popover.classList.add("is-bottom-fixed");
          });
      
          falseCallback = falseCallback || makeDefaultCallbacks(removeOpen, deleteDelay, falseDefaultPositionSetting, () => {});
      
          const mqListener = (mq) => {
              if (mq.matches) {
                  trueCallback(removeOpen, tinyfoot);
              } else {
                  falseCallback(removeOpen, tinyfoot);
              }
          };
      
          mql.addEventListener('change', mqListener);
          mqListener(mql);
      
          settings.breakpoints[size] = {
              added: true,
              mq: mql,
              listener: mqListener
          };
      
          return settings.breakpoints[size];
      };
      
      const makeDefaultCallbacks = (removeOpen, deleteDelay, position, callback) => {
          return (removeOpen, tinyfoot) => {
            let closedPopovers;
        
            if (removeOpen) {
              closedPopovers = tinyfoot.close();
              tinyfoot.updateSetting("activateCallback", callback);
            }
        
            setTimeout(() => {
              tinyfoot.updateSetting("positionContent", position);
              if (removeOpen) {
                tinyfoot.activate(closedPopovers);
              }
            }, deleteDelay);
          };
      };
      
      const removeBreakpoint = (target, callback) => {
          let mqFound = false;
          let b;
          
          if (typeof target === "string") {
            mqFound = settings.breakpoints[target] !== undefined;
          } else {
            for (b in settings.breakpoints) {
              if (settings.breakpoints.hasOwnProperty(b) && settings.breakpoints[b].mq === target) {
                mqFound = true;
                break; // Stop the loop when the target is found
              }
            }
          }
        
          if (mqFound) {
            const breakpoint = settings.breakpoints[b || target];
            const listener = callback || breakpoint.listener;
        
            listener({ matches: false });
            breakpoint.mq.removeEventListener('change', breakpoint.listener);
            delete settings.breakpoints[b || target];
          }
        
          return mqFound;
        };
        
      const getSetting = (setting) => {
          return settings[setting];
      };
      
      const updateSetting = (newSettings, value) => {
          let oldValue;
        
          if (typeof newSettings === "string") {
            oldValue = settings[newSettings];
            settings[newSettings] = value;
          } else {
            oldValue = {};
            for (const prop in newSettings) {
              if (newSettings.hasOwnProperty(prop)) {
                oldValue[prop] = settings[prop];
                settings[prop] = newSettings[prop];
              }
            }
          }
        
          return oldValue;
        };
        
        

      const positionTooltip = function(popover, leftRelative = 0.5) {
          const tooltip = popover.querySelector(".tinyfoot-footnote__tooltip");
          if (tooltip) {
              tooltip.style.left = `${leftRelative * 100}%`;
          }
      };
      

      const roomCalc = function(el) {
          let elStyles = getComputedStyle(el);
          let elLeftMargin = parseFloat(elStyles.marginLeft);
          let elWidth = el.offsetWidth - elLeftMargin;
          let elHeight = el.offsetHeight;
      
          let rect = el.getBoundingClientRect();
          let w = viewportDetails();
      
          let topRoom = rect.top + elHeight / 2;
          let leftRoom = rect.left + elWidth / 2;
      
          return {
              topRoom: topRoom,
              bottomRoom: w.height - topRoom,
              leftRoom: leftRoom,
              rightRoom: w.width - leftRoom,
              leftRelative: leftRoom / w.width,
              topRelative: topRoom / w.height
          };
      };

      const viewportDetails = function() {
          return {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollX: window.pageXOffset || document.documentElement.scrollLeft,
            scrollY: window.pageYOffset || document.documentElement.scrollTop
          };
        };    
      
      /*** ADDITIONAL FUNCTIONALITY ***/
      const displayCurrentDateTime = function(){
        let currDateTime = new Date().toLocaleString();
        currDateTime = 'Current Date & Time: '+currDateTime;
        return currDateTime;
      }


      /************ CREATING AND REMOVING POPOVERS *************/

      const createPopover = function(selector) {
          let buttons, popoversCreated = [];
      
          // Determine button elements based on selector and settings
          if (typeof selector !== "string" && settings.allowMultipleFN) {
              buttons = selector;
          } else if (typeof selector !== "string") {
              buttons = [selector[0]]; // Convert first element to array
          } else if (settings.allowMultipleFN) {
              buttons = document.querySelectorAll(selector);
          } else {
              buttons = [document.querySelector(selector).closest(".tinyfoot-footnote__button")];
          }
          
          // Process each button
          buttons.forEach((button) => {
              let content, contentContainer;
              
              try {
                if(settings.showDateAndTime){
                  settings.contentMarkup = settings.contentMarkup.replace(/\{\{FOOTNOTECONTENT\}\}/g, button.getAttribute("data-tinyfoot-footnote")+`<br><i>`+displayCurrentDateTime())+`</i>`; 
                }
                  content = settings.contentMarkup
                      .replace(/\{\{FOOTNOTENUM\}\}/g, button.getAttribute("data-footnote-number"))
                      .replace(/\{\{FOOTNOTEID\}\}/g, button.getAttribute("data-footnote-identifier"))
                      .replace(/\{\{FOOTNOTECONTENT\}\}/g, button.getAttribute("data-tinyfoot-footnote"))
                      .replace(/\&gtsym\;/g, "&gt;")
                      .replace(/\&ltsym\;/g, "&lt;");
                  
                  content = replaceWithReferenceAttributes(content, "BUTTON", button);
              } finally {
                  // Create and configure the content element
                  const range = document.createRange();
                  const contentElement = range.createContextualFragment(content).firstElementChild; 
                  //content has "<aside>...</aside>"; contextual fragment creates a fragment out of the content string and firstelement generates ref to the actual element
                  //this method avoids creating a <div> and then adding content to its innerHTML
                  try {
                      settings.activateCallback(contentElement, button);
                  } catch (error) {}
      
                  // Insert the contentElement after the button
                  button.insertAdjacentElement('afterend', contentElement);
                  popoverStates[button.getAttribute("data-footnote-identifier")] = "init";
                  const maxWidth = calculatePixelDimension(getComputedStyle(contentElement).maxWidth, contentElement);
                  contentElement.setAttribute("tinyfoot-max-width", maxWidth);
                  contentElement.style.maxWidth = "10000px"; // Set large max-width for animation
                  contentElement.style.transitionDuration = settings.animationDuration + "ms";
      
                  // Configure the content container
                  contentContainer = contentElement.querySelector(".tinyfoot-footnote__content");
                  const maxHeight = calculatePixelDimension(getComputedStyle(contentContainer).maxHeight, contentContainer);
                  contentElement.setAttribute("data-tinyfoot-max-height", maxHeight);
      
                  repositionFeet();
                  button.classList.add("is-active");
                  
                  // Bind scroll handler to content container
                  bindScrollHandler.call(contentContainer);
      
                  // Track created popovers
                  popoversCreated.push(contentElement);
              }
          });
          setTimeout(() => {
              popoversCreated.forEach(popover => { popover.classList.add("is-active") });
          }, settings.popoverCreateDelay);
          return popoversCreated;
      }

      const removePopovers = (footnotes = ".tinyfoot-footnote", timeout = settings.popoverDeleteDelay) => {
          let buttonsClosed = [];
          
          const footnoteElements = document.querySelectorAll(footnotes);
          footnoteElements.forEach(footnote => {
              const footnoteID = footnote.getAttribute("data-footnote-identifier");
              const linkedButton = document.querySelector(`.tinyfoot-footnote__button[data-footnote-identifier='${footnoteID}']`);
              if (!linkedButton.classList.contains("changing")) {
                  buttonsClosed.push(linkedButton);
                  linkedButton.classList.remove("is-active", "is-hover-instantiated", "is-click-instantiated");
                  linkedButton.classList.add("changing");
      
                  footnote.classList.remove("is-active");
                  footnote.classList.add("disapearing");
                  
                  setTimeout(() => {
                      footnote.remove();
                      delete popoverStates[footnoteID];
                      linkedButton.classList.remove("changing");
                  }, timeout);
              }
          });
      
          return buttonsClosed;
      };        

      
      /************ MAPPING EVENT LISTENERS TO EVENT HANDLERS *************/

      const addEventListeners = () => {
          /*** HOVER EVENTS ***/
        const buttons = document.querySelectorAll('.tinyfoot-footnote__button');
        // Add the mouseenter and mouseout event listeners to each button
        buttons.forEach(button => {
                button.addEventListener('mouseenter', buttonHover);
                button.addEventListener('mouseout', unhoverFeet);
        });
        /*** CLICK EVENTS ***/
        document.addEventListener("touchend", touchClick);
        document.addEventListener("click", touchClick);

        document.addEventListener("keyup", escapeKeypress);
        window.addEventListener("scroll", repositionFeet);
        window.addEventListener("resize", repositionFeet);
      
        window.addEventListener("gestureend", () => {
          repositionFeet();
        });
      };
    
      //DOM MANIPULATION STARTS HERE
      document.addEventListener('DOMContentLoaded', () => {
          footnoteInit();
          addEventListeners();
      });
    
      return {
          removePopovers: removePopovers,
          close: removePopovers,
          createPopover: createPopover,
          activate: createPopover,
          repositionFeet: repositionFeet,
          reposition: repositionFeet,
          addBreakpoint: addBreakpoint,
          removeBreakpoint: removeBreakpoint,
          getSetting: getSetting,
          updateSetting: updateSetting
      };
  };    

  window.tinyfoot = tinyfoot;
})();