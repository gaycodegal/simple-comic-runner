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

function parsePolish(line) {
    const indexComment = line.lastIndexOf('# ');
    if (indexComment != -1) {
	line = line.slice(0, indexComment);
    }
    return line.split(" ");
}

async function execPolishLine(number, polish, context) {
    const reversePolish = polish.reverse();
    let instructionPointer = 0;
    const stack = [];
    while(instructionPointer < reversePolish.length) {
	const sym = reversePolish[instructionPointer];
	if (sym.length === 0) {
	    ++instructionPointer;
	    continue;
	}
	
	if (sym.charAt(sym.length - 1) === '"') {
	    const end = polishStringEnd(reversePolish, instructionPointer);
	    if (end === -1) {
		console.error(polishErrorMessage('malformed string', number, reversePolish, instructionPointer));
		break;
	    }
	    const string = polishString(instructionPointer, end, reversePolish);
	    stack.push(string);
	    instructionPointer = end + 1;
	    continue;
	}

	if (sym.charAt(0).match(/\d/) != null) {
	    stack.push(parseFloat(sym));
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
	console.warn(polishErrorMessage("unexpended stack", number, reversePolish, instructionPointer), stack);
    }
}

function polishErrorMessage(message, line, reversePolish, instructionPointer) {
    return `${message} at line ${line} sym(${reversePolish.length - 1 - instructionPointer}), ${reversePolish.reverse().join(" ")}`;
}

function polishStringEnd(reversePolish, instructionPointer) {
    if (reversePolish[instructionPointer] === '"') {
	++instructionPointer;
    }
    for (let i = instructionPointer; i < reversePolish.length; ++i) {
	const sym = reversePolish[i];
	if (sym.length && sym.charAt(0) == '"') {
	    return i;
	}
    }
    return -1;
}

function polishString(instructionPointer, end, reversePolish) {
    // possible last word
    let string;
    if (instructionPointer != end) {
	const last = reversePolish[instructionPointer].slice(0, -1);
	let array = [last];
	if (!last.length) {
	    array.pop();
	}
	array = array.concat(reversePolish.slice(instructionPointer + 1, end));
	const first = reversePolish[end].slice(1);
	if (first.length) {
	    array.push(first);
	}
	string = array.reverse().join(" ");
    } else {
	string = reversePolish[instructionPointer].slice(1, -1);
    }
    // need to parse escape codes
    return string;
}
