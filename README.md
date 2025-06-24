# TypeScript Web Chess

A fully functional chess game built from the ground up with TypeScript and rendered on an HTML Canvas. This project emphasizes a clean, event-driven architecture with a clear separation between game logic, state management, and view rendering.


## About The Project

This chess engine was built to be a robust and maintainable implementation of the rules of chess. It avoids monolithic classes by separating concerns into a Model-View-Controller-like pattern:

*   **Model (`/src/model`)**: The core game engine. It is stateless and calculates legal moves, detects check/checkmate, and understands the rules of chess.
*   **Controller (`/src/components/ChessGameController`)**: The central nervous system of the application. It manages the game state, processes user input, and orchestrates the flow of the game.
*   **View (`/src/view`, `/src/components/Board`)**: The rendering layer. It listens for events from the controller and updates the visual representation on multiple HTML canvas layers.
*   **Services (`/src/services`)**: A collection of decoupled helper classes for tasks like event emission, move execution, and FEN generation.

## Features

*   **Complete Chess Logic**: Implements all standard chess rules.
*   **Special Moves**: Full support for Castling, En Passant, and Pawn Promotion.
*   **Game State Detection**: Correctly identifies Check, Checkmate, Stalemate, and draws by Threefold Repetition and the 50-move rule.
*   **Undo/Redo**: Use `Ctrl+Z` and `Ctrl+Y` to go backward and forward in the move history.
*   **Polished UI**:
    *   Smooth rendering on HTML Canvas.
    *   Highlights for selected pieces, valid moves, and the previous move's "from" and "to" squares.
    *   Distinct highlight colors for light and dark squares.
    *   Soft outlines on highlights for better visual appeal.
*   **Theming**: All colors and visual styles are centralized in `/src/config/Theme.ts` for easy customization.
*   **Developer Debug Mode**: An advanced, structured logging system to trace game logic for performance tuning and debugging.

## Tech Stack

*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Rendering**: HTML Canvas API
*   **Architecture**: Vanilla TypeScript (no external UI frameworks like React or Vue).

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You must have [Node.js](https://nodejs.org/) (version 18 or later) and a package manager like `npm` or `yarn` installed.

*   [npm](https://www.npmjs.com/get-npm) is included with Node.js.

### Setup & Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/WillTHomeGit/chess.git
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd chess
    ```

3.  **Install NPM packages:**
    This command will download and install all the necessary dependencies (like Vite and TypeScript) defined in `package.json`.
    ```sh
    npm install
    ```

### Running the Application

1.  **Start the development server:**
    ```sh
    npm run dev
    ```

2.  **Open the application in your browser:**
    The command will output a local URL in your terminal. Open it in your browser to see the game. It will typically be:
    `http://localhost:5173/`

---

## Development & Debugging

This project includes a powerful debugging system that can be activated via a URL parameter.

**To enable debug mode:**

1.  Add `?debug=true` to the end of the URL in your browser.
    `http://localhost:5173/?debug=true`

2.  Open your browser's **Developer Console** (F12 or Ctrl+Shift+I).

When debug mode is active, the console will print a detailed, collapsible log of all major operations for each turn, including move generation, validation, and caching performance. This is an invaluable tool for understanding the game flow and diagnosing issues.

## Project Structure

The codebase is organized with a strong emphasis on separation of concerns, following a Model-View-Controller (MVC) like pattern. This ensures that the game logic, state, and presentation are decoupled, making the project easier to maintain and extend.

```
src/
├── components/     # High-level "glue" components combining logic and view.
│   ├── Board.ts            # Manages the multiple canvas layers and rendering orchestration.
│   └── ChessGameController.ts  # The central controller; processes input and manages game flow.
│
├── config/         # All static configuration for the application.
│   ├── BoardConfig.ts      # Defines the initial piece layout and board dimensions.
│   ├── GameConfig.ts       # Defines game rules like castling and promotion.
│   └── Theme.ts            # Central hub for all visual styles and colors.
│
├── dev/            # Development-only tools for debugging and analysis.
│   └── DebugLogger.ts      # A controllable logger for tracing game logic in the console.
│
├── input/          # Classes responsible for capturing user input.
│   ├── KeyboardInputHandler.ts # Handles keyboard shortcuts (e.g., Undo/Redo).
│   └── MouseInputHandler.ts    # Translates mouse clicks on the canvas to board coordinates.
│
├── model/          # The core, view-agnostic game engine and state.
│   ├── Game.ts             # The "brain" of the engine; generates legal moves.
│   ├── GameEndDetection.ts # Detects check, checkmate, and draw conditions.
│   ├── GameEvents.ts       # Defines the strongly-typed events for UI communication.
│   └── GameState.ts        # The state machine; tracks turn, history, and snapshots for undo/redo.
│
├── rules/          # The implementation of all chess rules.
│   ├── special-moves/      # Logic for Castling, En Passant, and Pawn Promotion.
│   └── validators/       # Contains a validator for each piece type (Pawn, Rook, etc.).
│
├── services/       # Decoupled helper classes with single responsibilities.
│   ├── EventEmitter.ts     # A strongly-typed event bus for communication.
│   ├── FenGenerator.ts     # Generates FEN strings for repetition detection.
│   └── MoveExecutor.ts     # Executes and reverses moves on the board.
│
├── types/          # Global TypeScript type definitions.
│
├── utils/          # Pure, stateless utility functions.
│
└── view/           # The rendering layer.
    ├── renderers/          # Classes that handle drawing specific elements on the canvas.
    └── UIUpdater.ts        # Manages simple DOM updates (e.g., turn indicator text).
```

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
