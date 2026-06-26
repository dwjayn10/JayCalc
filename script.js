/**
 * The Gothic Arithmometer - Logic Engine
 */

const mainDisplay = document.getElementById('main-display');
const expressionDisplay = document.getElementById('expression-display');
const keypad = document.querySelector('.keypad');

let currentOperand = '0';
let previousOperand = '';
let activeOperator = null;
let resetDisplayOnNextInput = false;

// Initialize System
setupEventListeners();

function setupEventListeners() {
    // Click event processing
    keypad.addEventListener('click', handleButtonClick);
    
    // Physical keyboard support mapping
    window.addEventListener('keydown', handleKeyboardInput);
}

function handleButtonClick(e) {
    const target = e.target;
    if (!target.matches('button')) return;

    const { value, action } = target.dataset;

    if (!action) {
        inputDigit(value);
    } else {
        switch (action) {
            case 'operator':
                handleOperator(target.dataset.value);
                break;
            case 'clear':
                clearAll();
                break;
            case 'backspace':
                handleBackspace();
                break;
            case 'sqrt':
                executeSquareRoot();
                break;
            case 'percent':
                executePercent();
                break;
            case 'calculate':
                executeCalculation();
                break;
        }
    }
    updateDisplay();
}

function handleKeyboardInput(e) {
    // Prevent default scrolling behaviors for spacebar/arrow down if targeted
    if (e.key === ' ') e.preventDefault();

    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        inputDigit(e.key);
    } else if (['+', '-', '*', '/'].includes(e.key)) {
        handleOperator(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        executeCalculation();
    } else if (e.key === 'Backspace') {
        handleBackspace();
    } else if (e.key === 'Escape') {
        clearAll();
    } else if (e.key === '%') {
        executePercent();
    }
    updateDisplay();
}

function inputDigit(digit) {
    if (resetDisplayOnNextInput) {
        currentOperand = '';
        resetDisplayOnNextInput = false;
    }

    if (digit === '.') {
        if (currentOperand.includes('.')) return;
        if (currentOperand === '') currentOperand = '0';
    }

    if (currentOperand === '0' && digit !== '.') {
        currentOperand = digit;
    } else {
        currentOperand += digit;
    }
}

function handleOperator(nextOperator) {
    const inputValue = parseFloat(currentOperand);

    if (isNaN(inputValue) && previousOperand === '') return;

    if (activeOperator && resetDisplayOnNextInput) {
        activeOperator = nextOperator;
        return;
    }

    if (previousOperand === '') {
        previousOperand = currentOperand;
    } else if (activeOperator) {
        const result = performEvaluation(parseFloat(previousOperand), inputValue, activeOperator);
        
        if (result === 'Error') {
            triggerError('Division By Zero');
            return;
        }
        
        previousOperand = String(parseFloat(result.toFixed(10))); // Control JS precision floating errors
        currentOperand = previousOperand;
    }

    activeOperator = nextOperator;
    resetDisplayOnNextInput = true;
}

function executeCalculation() {
    if (!activeOperator || resetDisplayOnNextInput) return;

    const op1 = parseFloat(previousOperand);
    const op2 = parseFloat(currentOperand);

    const result = performEvaluation(op1, op2, activeOperator);

    if (result === 'Error') {
        triggerError('Division By Zero');
        return;
    }

    currentOperand = String(parseFloat(result.toFixed(10)));
    previousOperand = '';
    activeOperator = null;
    resetDisplayOnNextInput = true;
}

function performEvaluation(op1, op2, operator) {
    switch (operator) {
        case '+': return op1 + op2;
        case '-': return op1 - op2;
        case '*': return op1 * op2;
        case '/': 
            if (op2 === 0) return 'Error';
            return op1 / op2;
        default: return op2;
    }
}

function executeSquareRoot() {
    const value = parseFloat(currentOperand);
    if (isNaN(value)) return;
    if (value < 0) {
        triggerError('Invalid Input');
        return;
    }
    currentOperand = String(parseFloat(Math.sqrt(value).toFixed(10)));
    resetDisplayOnNextInput = true;
}

function executePercent() {
    const value = parseFloat(currentOperand);
    if (isNaN(value)) return;
    currentOperand = String(value / 100);
    resetDisplayOnNextInput = true;
}

function handleBackspace() {
    if (resetDisplayOnNextInput) {
        previousOperand = '';
        return;
    }
    if (currentOperand.length > 1) {
        currentOperand = currentOperand.slice(0, -1);
    } else {
        currentOperand = '0';
    }
}

function clearAll() {
    currentOperand = '0';
    previousOperand = '';
    activeOperator = null;
    resetDisplayOnNextInput = false;
}

function triggerError(msg) {
    clearAll();
    currentOperand = msg;
    resetDisplayOnNextInput = true;
}

function getOperatorSymbol(op) {
    switch (op) {
        case '+': return '+';
        case '-': return '−';
        case '*': return '×';
        case '/': return '÷';
        default: return '';
    }
}

function updateDisplay() {
    mainDisplay.textContent = currentOperand;
    
    // Construct readable mechanical expression trace
    if (activeOperator) {
        expressionDisplay.textContent = `${previousOperand} ${getOperatorSymbol(activeOperator)}`;
    } else {
        expressionDisplay.textContent = '';
    }
          }
