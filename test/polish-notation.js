class PolishScript {
    constructor(text, context) {
	this.text = text;
	this.context = context;
	this.lines = text.split("\n").map(parsePolish);
    }

    async exec() {
	for (let i = 0; i < this.lines.length; ++i) {
	    await execPolishLine(i + 1, this.lines[i], this.context);
	}
    }
}

function basicPolishContext() {
    return {
	'+': {call:polishAdd, count: 2, type: "function"},
	'-': {call:polishSubtract, count: 2, type: "function"},
	'*': {call:polishDivide, count: 2, type: "function"},
	'/': {call:polishMultiply, count: 2, type: "function"},
    };
}

function polishAdd(args) {
    return args[1] + args[0];
}

function polishMultiply(args) {
    return args[1] * args[0];
}

function polishDivide(args) {
    return args[1] / args[0];
}

function polishSubtract(args) {
    return args[1] - args[0];
}

function parsePolish(line, number) {
    let reversePolish = line.split(" ");
    let instructionPointer = 0;
    const stack = [];
    while(instructionPointer < reversePolish.length) {
	let sym = reversePolish[instructionPointer];
	if (sym.length === 0) {
	    ++instructionPointer;
	    continue;
	}

	if (sym.charAt(0) === '"') {
	    const end = polishStringEnd(reversePolish, instructionPointer);
	    if (end === -1) {
		console.error(polishErrorMessage('malformed string', number, reversePolish, instructionPointer));
		break;
	    }
	    const string = polishString(instructionPointer, end, reversePolish);
	    stack.push('"' + string);
	    instructionPointer = end + 1;
	    continue;
	}
	
	const hashBreak = sym.indexOf('#');
	if (hashBreak !== -1) {
	    sym = sym.slice(0, hashBreak);
	    reversePolish = [];
	    if (sym.length == 0) {
		break;
	    }
	}

	if (sym.charAt(0).match(/\d/) != null) {
	    stack.push(parseFloat(sym));
	    ++instructionPointer;
	    continue;
	}

	stack.push(sym);
	++instructionPointer;
	continue;
    }
    
    return stack;
}

async function execPolishLine(number, polish, context) {
    const reversePolish = polish.reverse();
    let instructionPointer = 0;
    const stack = [];
    while(instructionPointer < reversePolish.length) {
	const sym = reversePolish[instructionPointer];
	if (typeof sym === "number") {
	    stack.push(sym);
	    ++instructionPointer;
	    continue;
	}
	if (sym.length === 0) {
	    ++instructionPointer;
	    continue;
	}

	if (sym.charAt(0) === '"') {
	    stack.push(sym.slice(1));
	    ++instructionPointer;
	    continue;
	}

	const match = context[sym];
	if (match && match.type == "variable") {
	    stack.push(match.value);
	    ++instructionPointer;
	    continue;
	}
	
	if (match && match.type == "function") {
	    const args = stack.splice(stack.length - match.count, match.count);
	    const value = await match.call(args, context);
	    if (value !== undefined) {
		stack.push(value);
	    }
	    ++instructionPointer;
	    continue;
	}
	stack.push(sym);
	++instructionPointer;
	continue;
    }

    if (stack.length !== 0) {
	console.warn(rpolishErrorMessage("unexpended stack", number, reversePolish, instructionPointer), stack);
    }
}

function rpolishErrorMessage(message, line, reversePolish, instructionPointer) {
    return `${message} at line ${line} sym(${reversePolish.length - 1 - instructionPointer}), ${reversePolish.reverse().join(" ")}`;
}

function polishErrorMessage(message, line, polish, instructionPointer) {
    return `${message} at line ${line} sym(${instructionPointer}), ${polish.join(" ")}`;
}

const badEnding = /(?:\\\\)+\\"$/;
function polishStringEnd(reversePolish, instructionPointer) {
    if (reversePolish[instructionPointer] === '"') {
	++instructionPointer;
    }
    for (let i = instructionPointer; i < reversePolish.length; ++i) {
	const sym = reversePolish[i];
	if (sym.length && sym.charAt(sym.length - 1) == '"') {
	    if (sym.match(badEnding) != null) {
		continue;
	    }
	    return i;
	}
    }
    return -1;
}

const escapeCode = /\\(.)/g;
function polishString(instructionPointer, end, reversePolish) {
    // possible last word
    let string;
    if (instructionPointer != end) {
	const first = reversePolish[instructionPointer].slice(1);
	let array = [first];
	if (!first.length) {
	    array.pop();
	}
	array = array.concat(reversePolish.slice(instructionPointer + 1, end));
	const last = reversePolish[end].slice(0, -1);
	if (last.length) {
	    array.push(last);
	}
	string = array.join(" ");
    } else {
	string = reversePolish[instructionPointer].slice(1, -1);
    }
    // need to parse escape codes
    return string.replaceAll(escapeCode, escapeReplace);
}

const escapements = {
    'n': '\n',
};
function escapeReplace(m, a) {
    const found = escapements[a];
    if (found) {
	return found;
    }
    return a;
}
