### A problem

Classify a random sequence of integers according to the number of ranges each number is included in.

### Solution

Solution is based on Node.js + TypeScript, while the code was structured with influence from Elm-lang and functional programming concepts in general. Code can be separated into following sections: Actions, Models, State Reducer, Main, and implementation functions.

Code execution depends on the state, which holds all the required data, and determines if the processing should stop. State is only updated in the state reducer, and how it will be updated depends on the action, which is also passed to the reducer as an argument. The returned tuple contains the new state, and next action that should be executed. Actions can also have additional data attached to them.

### Generating numbers

Generating a big number of ranges, can be time consuming process. For this purpose JavaScript's built in Math.random function was used. If more performance is required, other solutions could be investigated, perhaps replacing the built in random function with another solution that may give better performance, but could be less secure.
