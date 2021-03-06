import { Record, List, Range } from 'immutable';

/* Actions */

enum ActionType {
    NoOp = 'noop',
    Init = 'init',
    NextNum = 'nextnum',
    Quit = 'quit'
}

// Actions, used by the reducer to determine how the state will be updated
interface NoOp {
    type: ActionType.NoOp;
}

interface Init {
    type: ActionType.Init;
    num: number;
}

interface NextNum {
    type: ActionType.NextNum;
}

interface Quit {
    type: ActionType.Quit;
}

// Discriminated union
type Action = NoOp | Init | NextNum | Quit;


/* Models */

// Range type, default values are required, but never used
class MyRange extends Record({ lo: 0, hi: 1 }) {
    lo: number;
    hi: number;
}

// App state, again default values required
class State extends Record({ranges: [], maxVal: pow10(9), n: pow10(6), quit: false}) {
    ranges: List<MyRange>;
    maxVal: number;
    n: number;
    quit: boolean;
}


/* State reducer */

function stateReducer (a:Action, state:State):[State, Action] {
    switch(a.type) {
        case ActionType.NoOp:
            return [ state, { type: ActionType.NoOp } ];

        case ActionType.Init:
            const n = a.num || state.n;
            const ranges = rangeGen(n, state.maxVal);
            return [ <State>state.merge({n, ranges}), { type: ActionType.NextNum } ];
        
        case ActionType.NextNum:
            const nextNum = numGen(0, state.maxVal);
            const classification = reduceRanges(nextNum, state.ranges);
            console.log(`${nextNum} => Enclosed by ${classification} range(s)`);
            return [ state,  { type: ActionType.NextNum } ];

        case ActionType.Quit:
            /* Do any cleanup! */
            return [ <State>state.set('quit', true), { type: ActionType.NoOp } ];
    }
}


/* State store */

class StateStore {
    private state:State = new State();
    private queue:List<Action> = <List<Action>>List();
    public getState():State { return this.state; }
    public updateState(newState:State):void { this.state = newState; }
    public clearActions():void { this.queue = <List<Action>>List(); }
    public hasActions():boolean { return this.queue.count() > 0; }
    public pushAction(newAction:Action):void { this.queue = this.queue.push(newAction); }
    public popAction():Action {
        const first:Action = this.queue.first();
        this.queue = this.queue.delete(0);
        return first;
    }
}

// Init store
const stateStore:StateStore = new StateStore();


/* Main, program entry point */

(function() { main(process.argv); })();

function main(argv) {
    const n:number|undefined = Number(argv[2]) || undefined;

    // Init action
    stateStore.pushAction({ type: ActionType.Init, num: n });

    process.stdin.setRawMode(true);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', key => {
        if (key == 'q') {
            stateStore.clearActions();
            stateStore.pushAction({ type: ActionType.Quit });
        }
    });

    run();
};

function run() {
    if(!stateStore.getState().quit && stateStore.hasActions()) {
        let newState, nextAction;

        // Reduce by action, update state store and action queue
        [ newState, nextAction ] = stateReducer(stateStore.popAction(), stateStore.getState());
        
        stateStore.updateState(newState);
        stateStore.pushAction(nextAction);

        // Make it tiny bit async, to be able to capture keyboard input.
        setTimeout(run);
    }

    if(stateStore.getState().quit) {
        process.exit(0);
    }
}


/* Implementation functions, can easily be tested. */

// Wrapper for Math.pow(10, x)
function pow10(pow:number):number {
    return Math.pow(10, pow);
}

// Generate single random number in [min, max] interval
function numGen(min:number, max:number):number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Grnerate single MyRange value
function singleRangeGen(maxVal:number):MyRange {
    const lo = numGen(0, maxVal);
    return new MyRange({lo, hi: numGen(lo + 1, maxVal)});
}

// Function to generate list of N ranges, create range from 1 to N, map each value to MyRange
function rangeGen(n:number, maxVal:number):List<MyRange> {
    return List<MyRange>(Range(0, n).toList().map(val => singleRangeGen(maxVal)));
}

// Find in how many ranges a number is included in
function reduceRanges(testNum:number, ranges:List<MyRange>):number {
    return ranges.reduce((v, r) => numInRange(testNum, r) ? v + 1 : v , 0);
}

// Check if number is in the range
function numInRange(num:number, range:MyRange):boolean {
    return range.lo <= num && num < range.hi;
}
