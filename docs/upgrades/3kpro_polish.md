# Handoff: Project Facelift for 3kpro.services

**Objective:** Transform `3kpro.services` from a standard SaaS/IT consulting site into a modern, eye-catching professional services portal. This document outlines the agentic workflow for executing the redesign within the AnitGravity IDE.

**Project Lead (Agent):** You
**AI Workforce:**
*   **Gemini:** The Strategist & Architect. Used for high-level planning, user journey mapping, content strategy, and generating initial concepts.
*   **Claude:** The Builder & Wordsmith. Used for drafting large blocks of structured code (HTML/CSS components), writing detailed copy, and creating documentation.
*   **`opencode`:** The Code Specialist. Used for generating specific, optimized, and production-ready functions, scripts, and complex logic.

---

## Agentic Workflow Principles

This project will be executed using an **agentic workflow**. The developer (you) acts as the central "agent," breaking down the project into discrete tasks. For each task, the agent defines the objective and delegates specific sub-tasks to the most suitable AI model. This ensures a structured, intentional, and high-quality output.

The workflow for each task is: **Define -> Delegate -> Integrate**.

1.  **Define:** The agent scopes the task in a dedicated block.
2.  **Delegate:** The agent writes specific, context-rich prompts for each AI model.
3.  **Integrate:** The agent reviews the AI-generated outputs, refines them, and integrates them into the project codebase.

---

## Phase 1: Strategy & Visual Identity

### Task 1.1: Define Core Message & Visual Palette

*   **Objective:** Solidify the brand's core message and create a professional color palette and font pairing.
*   **Agent's Directive:** We need a visual identity that screams "professional," "modern," and "effective." It should be clean but have a strong personality.

*   **Delegation:**
    *   **-> to Gemini (Strategist):**
        ```prompt
        Analyze the brand name '3kpro.services'. Brainstorm 5 core messaging angles for a professional services website. For each angle, suggest a headline and a brief subheading. The target audience is businesses looking for high-end, expert solutions.
        ```
    *   **-> to Claude (Builder):**
        ```prompt
        Based on the idea of a "professional, modern, and effective" brand, generate 3 complete visual identity palettes. Each palette should include:
        - A primary background color (dark theme).
        - A primary text color.
        - A main accent color for calls-to-action.
        - A secondary accent color for highlights.
        - A recommended headline font (from Google Fonts).
        - A recommended body font (from Google Fonts).
        Present this in a markdown table.
        ```

---

## Phase 2: Wireframing & Component Design

### Task 2.1: Design the Hero Section

*   **Objective:** Create the HTML structure and CSS for a visually stunning, above-the-fold hero section.
*   **Agent's Directive:** This is the first thing users see. It needs to be bold and immediately communicate value. We will use the chosen headline and color palette from Task 1.1.

*   **Delegation:**
    *   **-> to Gemini (Architect):**
        ```prompt
        Design the layout for a modern hero section for '3kpro.services'. Describe the placement of the main headline, the subheading, a primary call-to-action button, and a secondary, less prominent link. Suggest a subtle background animation or graphic element to add visual interest.
        ```
    *   **-> to Claude (Builder):**
        ```prompt
        Based on the layout from Gemini, write the complete HTML and CSS for the hero section. Use placeholder text for the headline and subheading. The primary CTA button should have a hover effect that uses the secondary accent color. Ensure the CSS is well-commented and uses modern practices like Flexbox or Grid. Wrap the code in appropriate markdown blocks.
        ```
    *   **-> to `opencode` (Specialist):**
        ```prompt
        Write a vanilla JavaScript snippet that makes the hero section's headline appear with a subtle "fade and slide up" animation on page load. The function should be self-contained and easy to integrate.
        ```

---

## Phase 3: Content & Feature Integration

### Task 3.1: Develop the "Services" Section

*   **Objective:** Create a clean, easy-to-read section detailing the services offered.
*   **Agent's Directive:** We need to move beyond a simple bullet list. Let's use a card-based layout that feels interactive and professional.

*   **Delegation:**
    *   **-> to Gemini (Strategist):**
        ```prompt
        For a professional services firm called '3kpro.services', outline 3 core service offerings. For each service, write a catchy name, a one-sentence summary, and 3 key benefits. This content will be used in a card-based layout.
        ```
    *   **-> to Claude (Builder):**
        ```prompt
        Create the HTML and CSS for a 3-card layout to display the services. Each card should have a title, a short description, and a "Learn More" link. On hover, the card should lift slightly (using box-shadow and transform) and the "Learn More" link should become more prominent. Use the established color palette.
        ```
    *   **-> to `opencode` (Specialist):**
        ```prompt
        The "Learn More" link on each service card will open a modal window with more details. Write a reusable JavaScript class or function called 'Modal' that can be triggered by a button click. The modal should show a title, content, and a close button. It should handle its own open/close state.
        ```

---

**Instructions for Use in AnitGravity IDE:**

1.  Keep this `HANDOFF.md` file open in one pane of your IDE.
2.  For each task, copy the prompts and delegate them to the respective AI tools (via IDE plugins, terminals, or API calls).
3.  Paste the generated output into your project files.
4.  Refine and integrate the code and content, ensuring consistency and quality.
5.  Once a task is complete, you can add a `[x]` to mark it as done.

This structured approach will help you build the site efficiently while maintaining high standards. Let's get started.
