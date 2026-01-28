// script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const htmlEditor = document.getElementById('htmlEditor');
    const cssEditor = document.getElementById('cssEditor');
    const jsEditor = document.getElementById('jsEditor');
    const runBtn = document.getElementById('runBtn');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const autoRunToggle = document.getElementById('autoRunToggle');
    const refreshPreviewBtn = document.getElementById('refreshPreview');
    const previewFrame = document.getElementById('previewFrame');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const notification = document.getElementById('notification');
    
    // Initialize editors with empty content
    htmlEditor.textContent = '';
    cssEditor.textContent = '';
    jsEditor.textContent = '';
    
    // Generate initial line numbers
    updateLineNumbers(htmlEditor);
    updateLineNumbers(cssEditor);
    updateLineNumbers(jsEditor);
    
    // Set contenteditable for editors
    [htmlEditor, cssEditor, jsEditor].forEach(editor => {
        editor.setAttribute('contenteditable', 'true');
        editor.setAttribute('spellcheck', 'false');
        
        // Update line numbers on input
        editor.addEventListener('input', function(e) {
            updateLineNumbers(this);
            
            if (autoRunToggle.checked) {
                setTimeout(runCode, 500);
            }
        });
        
        // Tab support
        editor.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const tabNode = document.createTextNode('  ');
                    range.deleteContents();
                    range.insertNode(tabNode);
                    
                    // Move cursor after tab
                    range.setStartAfter(tabNode);
                    range.setEndAfter(tabNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    updateLineNumbers(this);
                }
            }
        });
        
        // Handle Enter key for line numbers
        editor.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                setTimeout(() => updateLineNumbers(this), 10);
            }
        });
    });
    
    // Event Listeners
    runBtn.addEventListener('click', runCode);
    clearBtn.addEventListener('click', clearAll);
    saveBtn.addEventListener('click', saveCode);
    loadBtn.addEventListener('click', loadCode);
    refreshPreviewBtn.addEventListener('click', runCode);
    autoRunToggle.addEventListener('change', function() {
        showNotification(`Auto-run ${this.checked ? 'enabled' : 'disabled'}`);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    saveCode();
                    break;
                case 'l':
                    e.preventDefault();
                    loadCode();
                    break;
                case 'r':
                    e.preventDefault();
                    runCode();
                    break;
            }
        }
    });
    
    // Functions
    function runCode() {
        try {
            const html = htmlEditor.textContent || '';
            const css = `<style>${cssEditor.textContent || ''}</style>`;
            const js = `<script>try {${jsEditor.textContent || ''}} catch(e) {console.error(e);}<\/script>`;
            
            const fullCode = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${css}
                </head>
                <body>
                    ${html}
                    ${js}
                </body>
                </html>
            `;
            
            previewFrame.srcdoc = fullCode;
            previewPlaceholder.style.opacity = '0';
            previewPlaceholder.style.pointerEvents = 'none';
            
            showNotification('Code executed successfully!');
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
            console.error('Execution error:', error);
        }
    }
    
    function clearAll() {
        if (confirm('Are you sure you want to clear all editors?')) {
            htmlEditor.textContent = '';
            cssEditor.textContent = '';
            jsEditor.textContent = '';
            updateLineNumbers(htmlEditor);
            updateLineNumbers(cssEditor);
            updateLineNumbers(jsEditor);
            showNotification('All editors cleared');
        }
    }
    
    function saveCode() {
        const codeToSave = {
            html: htmlEditor.textContent,
            css: cssEditor.textContent,
            js: jsEditor.textContent,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('miniCodeEditor_savedCode', JSON.stringify(codeToSave));
        showNotification('Code saved successfully!');
    }
    
    function loadCode() {
        const saved = localStorage.getItem('miniCodeEditor_savedCode');
        
        if (!saved) {
            showNotification('No saved code found', 'warning');
            return;
        }
        
        try {
            const code = JSON.parse(saved);
            htmlEditor.textContent = code.html || '';
            cssEditor.textContent = code.css || '';
            jsEditor.textContent = code.js || '';
            
            updateLineNumbers(htmlEditor);
            updateLineNumbers(cssEditor);
            updateLineNumbers(jsEditor);
            
            showNotification('Code loaded successfully!');
            
            if (autoRunToggle.checked) {
                setTimeout(runCode, 200);
            }
        } catch (error) {
            showNotification('Error loading saved code', 'error');
        }
    }
    
    function updateLineNumbers(editor) {
        const lines = editor.textContent.split('\n').length;
        let numbers = '';
        for (let i = 1; i <= lines; i++) {
            numbers += i + '\n';
        }
        editor.setAttribute('data-line-numbers', numbers);
    }
    
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = 'notification';
        
        if (type === 'error') {
            notification.style.backgroundColor = 'var(--accent-danger)';
        } else if (type === 'warning') {
            notification.style.backgroundColor = 'var(--accent-warning)';
        } else if (type === 'success') {
            notification.style.backgroundColor = 'var(--accent-secondary)';
        } else {
            notification.style.backgroundColor = 'var(--accent-primary)';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Add basic styling for editors
    const style = document.createElement('style');
    style.textContent = `
        .code-editor {
            color: #e0e0e0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
            tab-size: 2;
        }
        
        .code-editor:focus {
            outline: none;
        }
    `;
    document.head.appendChild(style);
});