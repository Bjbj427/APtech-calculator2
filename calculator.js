// DOM Elements
let expression = document.getElementById('expression');
let result = document.getElementById('result');
let currentInput = '';
let currentResult = '';

// Menu Elements
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');
const clearRecentBtn = document.getElementById('clearRecentBtn');
const recentList = document.getElementById('recentList');

// Recent calculations array
let recentCalculations = [];

// Load recent calculations from localStorage
function loadRecentCalculations() {
    const saved = localStorage.getItem('novaCalc_recent');
    if (saved) {
        recentCalculations = JSON.parse(saved);
        updateRecentList();
    }
}

// Save recent calculations to localStorage
function saveRecentCalculations() {
    localStorage.setItem('novaCalc_recent', JSON.stringify(recentCalculations));
}

// Add calculation to recent
function addToRecent(expression, value) {
    const calculation = {
        expression: expression,
        result: value,
        timestamp: new Date().toLocaleTimeString()
    };
    
    recentCalculations.unshift(calculation);
    
    // Keep only last 15 calculations
    if (recentCalculations.length > 15) {
        recentCalculations.pop();
    }
    
    saveRecentCalculations();
    updateRecentList();
}

// Update recent list display
function updateRecentList() {
    if (recentCalculations.length === 0) {
        recentList.innerHTML = '<div class="empty-recent">No recent calculations</div>';
        return;
    }
    
    recentList.innerHTML = '';
    recentCalculations.forEach((calc, index) => {
        const recentItem = document.createElement('div');
        recentItem.className = 'recent-item';
        recentItem.innerHTML = `
            <div class="recent-expression">${calc.expression}</div>
            <div class="recent-result">= ${calc.result}</div>
        `;
        recentItem.onclick = () => {
            result.textContent = calc.result;
            expression.textContent = calc.expression;
            currentInput = calc.result.toString();
            currentResult = calc.result;
            closeMenu();
        };
        recentList.appendChild(recentItem);
    });
}

// Clear all recent calculations
function clearRecent() {
    recentCalculations = [];
    saveRecentCalculations();
    updateRecentList();
}

// Menu functions
function openMenu() {
    sideMenu.classList.add('active');
    overlay.classList.add('active');
}

function closeMenu() {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
}

// Toggle menu
function toggleMenu() {
    if (sideMenu.classList.contains('active')) {
        closeMenu();
    } else {
        openMenu();
    }
}

// Calculator functions
function updateDisplay() {
    if (currentInput === '') {
        result.textContent = '0';
    } else {
        result.textContent = currentInput;
    }
    expression.textContent = currentResult ? `${currentResult} =` : '';
}

function appendNumber(num) {
    if (num === '.' && currentInput.includes('.')) return;
    if (currentInput === '0' && num !== '.') {
        currentInput = num;
    } else {
        currentInput += num;
    }
    updateDisplay();
}

function appendOperator(op) {
    if (currentInput === '' && currentResult === '') return;
    
    if (currentInput !== '') {
        if (currentResult !== '') {
            currentResult = '';
        }
        currentInput += ` ${op} `;
        updateDisplay();
    } else if (currentResult !== '') {
        currentInput = currentResult + ` ${op} `;
        currentResult = '';
        updateDisplay();
    }
}

function clearDisplay() {
    currentInput = '';
    currentResult = '';
    updateDisplay();
}

function deleteLast() {
    if (currentInput === '') return;
    currentInput = currentInput.slice(0, -1);
    if (currentInput === '') {
        updateDisplay();
    } else {
        result.textContent = currentInput;
    }
}

function calculate() {
    if (currentInput === '') return;
    
    try {
        let calcExpression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
        const calculated = eval(calcExpression);
        
        if (!isFinite(calculated)) {
            throw new Error('Invalid calculation');
        }
        
        // Round to avoid floating point issues
        const finalResult = Math.round(calculated * 1000000) / 1000000;
        
        // Add to recent calculations
        addToRecent(currentInput, finalResult);
        
        currentResult = finalResult;
        currentInput = finalResult.toString();
        updateDisplay();
    } catch (error) {
        result.textContent = 'Error';
        expression.textContent = '';
        currentInput = '';
        currentResult = '';
        setTimeout(() => {
            updateDisplay();
        }, 1500);
    }
}

// Event listeners for buttons
document.querySelectorAll('.btn-number').forEach(btn => {
    btn.addEventListener('click', () => {
        const num = btn.getAttribute('data-num');
        appendNumber(num);
    });
});

document.querySelectorAll('.btn-operator').forEach(btn => {
    btn.addEventListener('click', () => {
        const op = btn.getAttribute('data-op');
        appendOperator(op);
    });
});

document.querySelector('[data-action="clear"]').addEventListener('click', clearDisplay);
document.querySelector('[data-action="delete"]').addEventListener('click', deleteLast);
document.querySelector('[data-action="equals"]').addEventListener('click', calculate);

// Menu event listeners
menuBtn.addEventListener('click', toggleMenu);
overlay.addEventListener('click', closeMenu);
clearRecentBtn.addEventListener('click', clearRecent);

// Keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    
    if (key >= '0' && key <= '9' || key === '.') {
        appendNumber(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        let op = key;
        if (key === '*') op = '×';
        if (key === '/') op = '÷';
        appendOperator(op);
    } else if (key === '%') {
        appendOperator('%');
    } else if (key === 'Enter') {
        calculate();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

// Initialize
loadRecentCalculations();
updateDisplay();