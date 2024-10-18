# ADR05: Migrating jQuery to JS ES6 and Eliminating CoffeeScript Dependency

## Context and Problem Statement

Bigfoot.js was originally developed when JavaScript tooling was more primitive, and ES6 standards had not yet been established. As a result, the code relies heavily on **jQuery** for DOM manipulation and **CoffeeScript** as the primary scripting language. However, with the advent of ES6 and its widespread adoption, continuing to depend on these older tools introduces unnecessary complexity and overhead. CoffeeScript, in particular, adds an extra layer of complication due to its dependency on transpiling into JavaScript, while jQuery's usage adds extra weight and outdated conventions to the project.

Given that **Bigfoot.js** is a relatively simple tool for footnotes, it doesn’t require heavy tooling or dependencies. The move to **vanilla JavaScript (ES6)** can simplify the project while improving maintainability, performance, and scalability.

## Decision Drivers

- **Simplicity**: The project primarily handles footnotes, which is a simple use case that doesn’t warrant the overhead of jQuery and CoffeeScript.
- **Maintainability**: Using native ES6 JavaScript will modernize the codebase and eliminate the need for transpilers or dependencies.
- **Performance**: Removing jQuery will reduce unnecessary overhead, as modern JavaScript can handle DOM manipulation more efficiently.
- **Future Scalability**: Moving to ES6 allows for easier modularization (as per [ADR02](https://github.com/Shyam-Sundar-Bharathi/cse210-tinyfoot-team14/issues/2)) and ensures the project can scale without relying on outdated tools or frameworks.

## Considered Options

1. **Keep jQuery and CoffeeScript**: Maintain the current structure.
2. **Migrate to ES6 and eliminate CoffeeScript and jQuery**: Refactor the code to use vanilla JavaScript (ES6) and remove all dependencies.
3. **Adopt a modern frontend framework (e.g., React, Vue)**: Transition to a modern web development framework.

### Option 1: Keep jQuery and CoffeeScript
**Pros**:
- No need to rewrite the current codebase.
- Minimal upfront development time.

**Cons**:
- **Outdated**: CoffeeScript is no longer actively maintained, and jQuery’s necessity has diminished with the advent of ES6 and modern browser APIs.
- **Complexity**: The current setup introduces unnecessary tooling and dependencies for what is essentially a simple task.
- **Limited future-proofing**: Sticking with older technologies limits scalability and modularization in the long run.

### Option 2: Migrate to ES6 and eliminate CoffeeScript and jQuery
**Pros**:
- **Simplicity**: We only need an HTML file, a CSS file, and a JS file for this footnote system—no tooling or extra dependencies required.
- **Improved maintainability**: ES6+ JavaScript is now standard, making it easier for future developers to understand and maintain the code.
- **Better performance**: Removing jQuery reduces the size of the codebase and improves load times, especially on smaller devices or slower connections.
- **Future scalability**: The ES6 modular structure makes it easier to expand or modify Tinyfoot without major refactoring later on (as outlined in [ADR02](https://github.com/Shyam-Sundar-Bharathi/cse210-tinyfoot-team14/issues/2)).

**Cons**:
- **Initial refactoring time**: Migrating away from jQuery and CoffeeScript will require rewriting parts of the codebase.
  
### Option 3: Adopt a modern frontend framework (React, Vue)
**Pros**:
- **Scalability**: A modern framework could provide advanced state management and DOM handling, making it easier to scale for more complex use cases in the future.
- **Tooling**: Popular frameworks come with modern build tools and testing environments that are helpful for larger applications.

**Cons**:
- **Overkill**: Footnotes don’t require the complexity or tooling of a full framework like React or Vue. This would introduce unnecessary learning curves and dependencies.
- **Performance overhead**: A modern framework would add significant weight for a feature as simple as footnotes.
- **Increased complexity**: Adopting frameworks would go against the goal of simplifying the project.

## Decision Outcome

The chosen option is **Migrate to ES6 and eliminate CoffeeScript and jQuery**.

This decision will modernize the codebase by refactoring it to native ES6+ JavaScript, removing the need for transpiling (CoffeeScript) and simplifying DOM manipulation (by removing jQuery). Given that footnotes are a simple feature, this change will significantly reduce complexity, improve performance, and make the project more maintainable without introducing unnecessary dependencies.

## Consequences

- **Positive**: 
  - **Simplified codebase**: The new structure will have only HTML, CSS, and JS files—making it leaner, easier to understand, and more maintainable.
  - **Improved performance**: By eliminating jQuery, we reduce the size of the JavaScript file and streamline the way we interact with the DOM, which will lead to faster load times, particularly on mobile devices or slower networks.
  - **Future-proofing**: With ES6 standards in place, future development (such as modularizing the code as per [ADR02](https://github.com/Shyam-Sundar-Bharathi/cse210-tinyfoot-team14/issues/2)) will be much easier and follow best practices for modern web development.

- **Negative**: 
  - **Initial refactoring cost**: Time and effort will be needed to refactor the existing codebase, but the long-term benefits of maintainability outweigh this initial cost.

## Confirmation

The success of this migration will be confirmed through:
- **Code review**: Ensure the refactored ES6 code maintains the same functionality as the original jQuery/CoffeeScript implementation.
- **Performance testing**: Compare the load times and overall performance before and after the migration, particularly on content-heavy pages with multiple footnotes.
- **Maintainability**: As we modularize the code in the future ([ADR02](https://github.com/Shyam-Sundar-Bharathi/cse210-tinyfoot-team14/issues/2)), ensure that the structure remains clean and that the migration has made it easier to extend TinyFoot without introducing technical debt.
