// Table Creator App
class TableCreator {
    constructor() {
        this.tables = this.loadFromStorage();
        this.init();
    }

    init() {
        this.bindEvents();
        this.bindModalEvents();
        this.render();
    }

    bindEvents() {
        document.getElementById('addTableBtn').addEventListener('click', () => this.addTable());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
    }

    bindModalEvents() {
        const modal = document.getElementById('columnCodeModal');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelModal');
        const saveBtn = document.getElementById('saveColumnCode');
        const deleteBtn = document.getElementById('deleteColumnCode');
        const columnType = document.getElementById('columnType');
        const optionsGroup = document.getElementById('optionsGroup');
        const addOptionBtn = document.getElementById('addOptionBtn');
        const newOptionInput = document.getElementById('newOptionInput');

        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        
        saveBtn.addEventListener('click', () => this.saveColumnCode());
        deleteBtn.addEventListener('click', () => this.deleteColumnCode());

        // Show/hide options based on type selection
        columnType.addEventListener('change', (e) => {
            if (e.target.value === 'select' || e.target.value === 'select-single') {
                optionsGroup.style.display = 'block';
            } else {
                optionsGroup.style.display = 'none';
            }
        });

        // Add new option
        addOptionBtn.addEventListener('click', () => {
            const optionValue = newOptionInput.value.trim();
            if (optionValue) {
                this.addOptionToList(optionValue);
                newOptionInput.value = '';
            }
        });

        newOptionInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const optionValue = newOptionInput.value.trim();
                if (optionValue) {
                    this.addOptionToList(optionValue);
                    newOptionInput.value = '';
                }
            }
        });

        // Color picker sync
        const textColor = document.getElementById('textColor');
        const textColorHex = document.getElementById('textColorHex');
        const bgColor = document.getElementById('bgColor');
        const bgColorHex = document.getElementById('bgColorHex');

        textColor.addEventListener('input', (e) => textColorHex.value = e.target.value);
        textColorHex.addEventListener('input', (e) => textColor.value = e.target.value);
        bgColor.addEventListener('input', (e) => bgColorHex.value = e.target.value);
        bgColorHex.addEventListener('input', (e) => bgColor.value = e.target.value);

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    addOptionToList(optionValue) {
        const optionsList = document.getElementById('optionsList');
        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';
        optionItem.innerHTML = `
            <input type="text" value="${optionValue}" class="option-input">
            <button class="remove-option" title="Remove option">×</button>
        `;
        optionsList.appendChild(optionItem);

        // Add remove functionality
        optionItem.querySelector('.remove-option').addEventListener('click', () => {
            optionItem.remove();
        });

        // Add edit functionality
        optionItem.querySelector('.option-input').addEventListener('change', (e) => {
            e.target.value = e.target.value.trim();
        });
    }

    openColumnCodeModal(tableId, colIndex) {
        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;

        const modal = document.getElementById('columnCodeModal');
        if (!modal) return;

        const existingCode = table.columnCodes[colIndex];

        // Reset form
        const columnName = document.getElementById('columnName');
        const columnType = document.getElementById('columnType');
        const columnWidth = document.getElementById('columnWidth');
        const rowHeight = document.getElementById('rowHeight');
        const textColor = document.getElementById('textColor');
        const textColorHex = document.getElementById('textColorHex');
        const bgColor = document.getElementById('bgColor');
        const bgColorHex = document.getElementById('bgColorHex');
        const textBold = document.getElementById('textBold');
        const textItalic = document.getElementById('textItalic');
        const columnFixed = document.getElementById('columnFixed');
        const fontSize = document.getElementById('fontSize');
        const columnCode = document.getElementById('columnCode');
        const optionsGroup = document.getElementById('optionsGroup');
        const optionsList = document.getElementById('optionsList');

        if (columnName) columnName.value = table.columns[colIndex] || '';
        if (columnType) columnType.value = table.columnTypes[colIndex] || '';
        if (columnWidth) columnWidth.value = table.columnWidths[colIndex] || 150;
        if (rowHeight) rowHeight.value = table.rowHeights[0] || 40;
        if (textColor) textColor.value = '#1e293b';
        if (textColorHex) textColorHex.value = '#1e293b';
        if (bgColor) bgColor.value = '#ffffff';
        if (bgColorHex) bgColorHex.value = '#ffffff';
        if (textBold) textBold.checked = false;
        if (textItalic) textItalic.checked = false;
        if (columnFixed) columnFixed.checked = false;
        if (fontSize) fontSize.value = 14;
        if (columnCode) columnCode.value = '';
        
        // Clear options list
        if (optionsList) optionsList.innerHTML = '';
        
        // Collect existing options from cell values
        const cellOptions = new Set();
        table.rows.forEach(row => {
            const cellValue = row.cells[colIndex];
            if (Array.isArray(cellValue)) {
                cellValue.forEach(val => {
                    if (val && val.trim()) cellOptions.add(val.trim());
                });
            } else if (cellValue && cellValue.trim()) {
                cellOptions.add(cellValue.trim());
            }
        });

        // Show/hide options group based on type
        if (optionsGroup && columnType) {
            optionsGroup.style.display = (columnType.value === 'select' || columnType.value === 'select-single') ? 'block' : 'none';
        }

        // Load existing code if present
        if (existingCode) {
            if (existingCode.type && columnType) columnType.value = existingCode.type;
            if (existingCode.width && columnWidth) columnWidth.value = existingCode.width;
            if (existingCode.height && rowHeight) rowHeight.value = existingCode.height;
            if (existingCode.color) {
                if (textColor) textColor.value = existingCode.color;
                if (textColorHex) textColorHex.value = existingCode.color;
            }
            if (existingCode.bgcolor) {
                if (bgColor) bgColor.value = existingCode.bgcolor;
                if (bgColorHex) bgColorHex.value = existingCode.bgcolor;
            }
            if (existingCode.bold && textBold) textBold.checked = existingCode.bold;
            if (existingCode.italic && textItalic) textItalic.checked = existingCode.italic;
            if (existingCode.fixed && columnFixed) columnFixed.checked = existingCode.fixed;
            if (existingCode.fontSize && fontSize) fontSize.value = existingCode.fontSize;
            
            // Load options from code or use cell values
            const optionsToLoad = (existingCode.options && Array.isArray(existingCode.options)) ? existingCode.options : Array.from(cellOptions);
            optionsToLoad.forEach(option => {
                if (option) this.addOptionToList(option);
            });
            
            if (columnCode) columnCode.value = JSON.stringify(existingCode, null, 2);
        } else {
            // If no existing code but it's a select column, load cell values as options
            if (columnType.value === 'select' || columnType.value === 'select-single') {
                Array.from(cellOptions).forEach(option => {
                    if (option) this.addOptionToList(option);
                });
            }
        }

        modal.dataset.tableId = tableId;
        modal.dataset.colIndex = colIndex;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }

    closeModal() {
        const modal = document.getElementById('columnCodeModal');
        modal.style.display = 'none';
        delete modal.dataset.tableId;
        delete modal.dataset.colIndex;
        document.body.classList.remove('modal-open');
    }

    saveColumnCode() {
        const modal = document.getElementById('columnCodeModal');
        const tableId = parseInt(modal.dataset.tableId);
        const colIndex = parseInt(modal.dataset.colIndex);

        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;

        // Save column name
        const columnName = document.getElementById('columnName').value.trim();
        if (columnName) {
            table.columns[colIndex] = columnName;
        }

        // Set column type from modal selection
        const columnType = document.getElementById('columnType').value;
        if (columnType === 'select') {
            table.columnTypes[colIndex] = 'select';
            // Convert existing cell values to arrays if needed
            table.rows.forEach(row => {
                if (typeof row.cells[colIndex] === 'string') {
                    row.cells[colIndex] = row.cells[colIndex] ? [row.cells[colIndex]] : [];
                }
            });
        } else if (columnType === 'select-single') {
            table.columnTypes[colIndex] = 'select-single';
            // Convert existing cell values to strings if needed
            table.rows.forEach(row => {
                if (Array.isArray(row.cells[colIndex])) {
                    row.cells[colIndex] = row.cells[colIndex].length > 0 ? row.cells[colIndex][0] : '';
                }
            });
        } else if (columnType) {
            table.columnTypes[colIndex] = columnType;
        } else {
            // Detect from name if no type selected
            if (columnName && columnName.toLowerCase().includes('column:select')) {
                table.columnTypes[colIndex] = 'select';
                table.rows.forEach(row => {
                    if (typeof row.cells[colIndex] === 'string') {
                        row.cells[colIndex] = row.cells[colIndex] ? [row.cells[colIndex]] : [];
                    }
                });
            } else {
                table.columnTypes[colIndex] = 'text';
            }
        }

        const columnWidth = parseInt(document.getElementById('columnWidth').value);
        const rowHeight = parseInt(document.getElementById('rowHeight').value);

        // Apply width and height to table
        if (columnWidth >= 50) {
            table.columnWidths[colIndex] = columnWidth;
        }
        if (rowHeight >= 30) {
            table.rowHeights = table.rowHeights.map(() => rowHeight);
        }

        // Collect options from the options list
        const options = [];
        document.querySelectorAll('#optionsList .option-input').forEach(input => {
            const value = input.value.trim();
            if (value) options.push(value);
        });

        const code = {
            type: columnType || undefined,
            width: columnWidth,
            height: rowHeight,
            color: document.getElementById('textColor').value,
            bgcolor: document.getElementById('bgColor').value,
            bold: document.getElementById('textBold').checked || undefined,
            italic: document.getElementById('textItalic').checked || undefined,
            fixed: document.getElementById('columnFixed').checked || undefined,
            fontSize: parseInt(document.getElementById('fontSize').value) || undefined,
            options: options.length > 0 ? options : undefined
        };

        // Remove undefined values
        Object.keys(code).forEach(key => {
            if (code[key] === undefined) delete code[key];
        });

        // Only save if there's actual configuration
        if (Object.keys(code).length > 0) {
            table.columnCodes[colIndex] = code;
        } else {
            table.columnCodes[colIndex] = null;
        }

        this.saveToStorage();
        this.render();
        this.closeModal();
    }

    deleteColumnCode() {
        const modal = document.getElementById('columnCodeModal');
        const tableId = parseInt(modal.dataset.tableId);
        const colIndex = parseInt(modal.dataset.colIndex);

        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;

        table.columnCodes[colIndex] = null;
        this.saveToStorage();
        this.render();
        this.closeModal();
    }

    // Storage operations
    loadFromStorage() {
        const data = localStorage.getItem('tableCreatorData');
        const tables = data ? JSON.parse(data) : [];
        
        // Migration: add columnWidths, rowHeights, columnTypes, and columnCodes to existing tables
        tables.forEach(table => {
            if (!table.columnWidths) {
                table.columnWidths = table.columns.map(() => 150);
            }
            if (!table.rowHeights) {
                table.rowHeights = table.rows.map(() => 40);
            }
            if (!table.columnTypes) {
                table.columnTypes = table.columns.map(col => 
                    col.toLowerCase().includes('column:select') ? 'select' : 'text'
                );
            }
            if (!table.columnCodes) {
                table.columnCodes = table.columns.map(() => null);
            }
            // Migration: convert select column cells to arrays if they're strings
            table.columnTypes.forEach((type, colIndex) => {
                if (type === 'select') {
                    table.rows.forEach(row => {
                        if (typeof row.cells[colIndex] === 'string') {
                            row.cells[colIndex] = row.cells[colIndex] ? [row.cells[colIndex]] : [];
                        }
                    });
                }
            });
        });
        
        return tables;
    }

    saveToStorage() {
        localStorage.setItem('tableCreatorData', JSON.stringify(this.tables));
    }

    // Table operations
    addTable() {
        const newTable = {
            id: Date.now(),
            name: `Table ${this.tables.length + 1}`,
            columns: ['Column 1', 'Column 2', 'Column 3'],
            columnTypes: ['text', 'text', 'text'],
            columnCodes: [null, null, null],
            columnWidths: [150, 150, 150],
            rowHeights: [40, 40],
            rows: [
                { id: Date.now() + 1, cells: ['Cell 1', 'Cell 2', 'Cell 3'] },
                { id: Date.now() + 2, cells: ['Cell 4', 'Cell 5', 'Cell 6'] }
            ]
        };
        this.tables.push(newTable);
        this.saveToStorage();
        this.render();
    }

    deleteTable(tableId) {
        this.tables = this.tables.filter(table => table.id !== tableId);
        this.saveToStorage();
        this.render();
    }

    updateTableName(tableId, newName) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            table.name = newName;
            this.saveToStorage();
        }
    }

    // Column operations
    addColumn(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            const colIndex = table.columns.length;
            table.columns.push(`Column ${colIndex + 1}`);
            table.columnTypes.push('text');
            table.columnCodes.push(null);
            table.columnWidths.push(150);
            table.rows.forEach(row => row.cells.push(''));
            this.saveToStorage();
            this.render();
        }
    }

    deleteColumn(tableId, colIndex) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            table.columns.splice(colIndex, 1);
            table.columnTypes.splice(colIndex, 1);
            table.columnCodes.splice(colIndex, 1);
            table.columnWidths.splice(colIndex, 1);
            table.rows.forEach(row => row.cells.splice(colIndex, 1));
            this.saveToStorage();
            this.render();
        }
    }

    updateColumnName(tableId, colIndex, newName) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            table.columns[colIndex] = newName;
            
            // Detect column type from name
            if (newName.toLowerCase().includes('column:select')) {
                table.columnTypes[colIndex] = 'select';
            } else {
                table.columnTypes[colIndex] = 'text';
            }
            
            this.saveToStorage();
            this.render();
        }
    }

    // Row operations
    addRow(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            const newRow = {
                id: Date.now(),
                cells: table.columns.map(() => '')
            };
            table.rows.push(newRow);
            table.rowHeights.push(40);
            this.saveToStorage();
            this.render();
        }
    }

    deleteRow(tableId, rowId) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            const rowIndex = table.rows.findIndex(row => row.id === rowId);
            table.rows = table.rows.filter(row => row.id !== rowId);
            if (rowIndex !== -1) {
                table.rowHeights.splice(rowIndex, 1);
            }
            this.saveToStorage();
            this.render();
        }
    }

    // Cell operations
    updateCell(tableId, rowId, colIndex, value) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            const row = table.rows.find(r => r.id === rowId);
            if (row) {
                row.cells[colIndex] = value;
                this.saveToStorage();
            }
        }
    }

    handlePaste(tableId, startRowId, startColIndex, clipboardData) {
        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;

        const text = clipboardData.getData('text/plain');
        if (!text) return;

        // Parse TSV data (Excel uses tab-separated values)
        const rows = text.split('\n').map(row => row.split('\t').filter(cell => cell !== ''));
        
        if (rows.length === 0 || (rows.length === 1 && rows[0].length === 0)) return;

        const startRowIndex = table.rows.findIndex(r => r.id === startRowId);
        if (startRowIndex === -1) return;

        // Add columns if needed
        const maxCols = Math.max(...rows.map(row => row.length));
        const neededCols = startColIndex + maxCols - table.columns.length;
        if (neededCols > 0) {
            for (let i = 0; i < neededCols; i++) {
                table.columns.push(`Column ${table.columns.length + 1}`);
                table.columnTypes.push('text');
                table.columnCodes.push(null);
                table.columnWidths.push(150);
                table.rows.forEach(row => row.cells.push(''));
            }
        }

        // Add rows if needed
        const neededRows = startRowIndex + rows.length - table.rows.length;
        if (neededRows > 0) {
            for (let i = 0; i < neededRows; i++) {
                const newRow = {
                    id: Date.now() + i,
                    cells: table.columns.map(() => '')
                };
                table.rows.push(newRow);
                table.rowHeights.push(40);
            }
        }

        // Paste data
        rows.forEach((row, rowOffset) => {
            const targetRowIndex = startRowIndex + rowOffset;
            if (targetRowIndex >= table.rows.length) return;

            const targetRow = table.rows[targetRowIndex];
            row.forEach((cellValue, colOffset) => {
                const targetColIndex = startColIndex + colOffset;
                if (targetColIndex >= targetRow.cells.length) return;

                // Handle select columns
                const colType = table.columnTypes[targetColIndex];
                if (colType === 'select') {
                    targetRow.cells[targetColIndex] = cellValue ? [cellValue] : [];
                } else {
                    targetRow.cells[targetColIndex] = cellValue;
                }
            });
        });

        this.saveToStorage();
        this.render();
    }

    clearAll() {
        if (confirm('Are you sure you want to delete all tables?')) {
            this.tables = [];
            this.saveToStorage();
            this.render();
        }
    }

    // Render
    render() {
        const container = document.getElementById('tablesContainer');
        const emptyState = document.getElementById('emptyState');

        if (this.tables.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';
        container.innerHTML = this.tables.map(table => this.renderTable(table)).join('');

        // Bind events after rendering
        this.tables.forEach(table => {
            this.bindTableEvents(table);
        });
    }

    renderTable(table) {
        const colWidths = table.columnWidths || table.columns.map(() => 150);
        const rowHeights = table.rowHeights || table.rows.map(() => 40);
        const colTypes = table.columnTypes || table.columns.map(() => 'text');
        const colCodes = table.columnCodes || table.columns.map(() => null);

        // Get unique options for select columns from existing cell values or column code
        const getSelectOptions = (colIndex) => {
            // First check if options are defined in column code
            const code = colCodes[colIndex];
            if (code && code.options && Array.isArray(code.options) && code.options.length > 0) {
                return code.options.filter(opt => opt && opt.trim()).sort();
            }
            
            // Fall back to collecting from cell values
            const options = new Set();
            table.rows.forEach(row => {
                const cellValue = row.cells[colIndex];
                if (Array.isArray(cellValue)) {
                    cellValue.forEach(val => {
                        if (val && val.trim()) {
                            options.add(val.trim());
                        }
                    });
                } else if (cellValue && cellValue.trim()) {
                    options.add(cellValue.trim());
                }
            });
            return Array.from(options).sort();
        };

        // Get cell style based on column code
        const getCellStyle = (colIndex) => {
            const code = colCodes[colIndex];
            if (!code) return '';
            let styles = '';
            if (code.color) styles += `color: ${code.color};`;
            if (code.bgcolor) styles += `background-color: ${code.bgcolor};`;
            if (code.bold) styles += `font-weight: bold;`;
            if (code.italic) styles += `font-style: italic;`;
            if (code.fontSize) styles += `font-size: ${code.fontSize}px;`;
            return styles;
        };

        // Get input type based on column code
        const getInputType = (colIndex) => {
            const code = colCodes[colIndex];
            if (!code || !code.type) return 'text';
            return code.type;
        };

        // Check if column is fixed
        const isColumnFixed = (colIndex) => {
            const code = colCodes[colIndex];
            return code && code.fixed;
        };

        // Calculate left offset for fixed columns
        const getFixedLeftOffset = (colIndex) => {
            let offset = 0;
            for (let i = 0; i < colIndex; i++) {
                if (isColumnFixed(i)) {
                    offset += colWidths[i];
                }
            }
            return offset;
        };

        return `
            <div class="table-wrapper" data-table-id="${table.id}">
                <div class="table-header">
                    <input 
                        type="text" 
                        class="table-name-input" 
                        value="${table.name}"
                        data-table-id="${table.id}"
                    >
                    <button class="btn btn-icon btn-delete-table" data-table-id="${table.id}" title="Delete Table">
                        🗑
                    </button>
                </div>
                <div class="table-filter">
                    <select class="filter-column-select" data-table-id="${table.id}">
                        <option value="">All Columns</option>
                        ${table.columns.map((col, index) => `
                            <option value="${index}">${col}</option>
                        `).join('')}
                    </select>
                    <input 
                        type="text" 
                        class="filter-value-input" 
                        placeholder="Filter value..."
                        data-table-id="${table.id}"
                    >
                    <button class="btn btn-secondary btn-clear-filter" data-table-id="${table.id}" style="display: none;">
                        Clear
                    </button>
                </div>
                <div class="table-scroll">
                    <table class="data-table">
                        <thead>
                            <tr>
                                ${table.columns.map((col, index) => `
                                    <th class="${isColumnFixed(index) ? 'fixed-column' : ''}" style="width: ${colWidths[index]}px; min-width: ${colWidths[index]}px; ${isColumnFixed(index) ? `left: ${getFixedLeftOffset(index)}px;` : ''}">
                                        <input 
                                            type="text" 
                                            class="column-name-input" 
                                            value="${col}"
                                            data-table-id="${table.id}"
                                            data-col-index="${index}"
                                        >
                                        <button 
                                            class="btn btn-icon btn-delete-column" 
                                            data-table-id="${table.id}"
                                            data-col-index="${index}"
                                            title="Delete Column"
                                        >×</button>
                                        <button 
                                            class="btn btn-icon btn-column-code" 
                                            data-table-id="${table.id}"
                                            data-col-index="${index}"
                                            title="Column Code"
                                            
                                        >📝</button>
                                        <div 
                                            class="col-resize-handle" 
                                            data-table-id="${table.id}"
                                            data-col-index="${index}"
                                        ></div>
                                    </th>
                                `).join('')}
                                <th class="action-header">
                                    <button 
                                        class="btn btn-icon btn-add-column" 
                                        data-table-id="${table.id}"
                                        title="Add Column"
                                    >+</button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            ${table.rows.map((row, rowIndex) => `
                                <tr data-row-id="${row.id}" style="height: ${rowHeights[rowIndex]}px; min-height: ${rowHeights[rowIndex]}px;">
                                    ${row.cells.map((cell, cellIndex) => {
                                        const isSelect = colTypes[cellIndex] === 'select';
                                        const isSelectSingle = colTypes[cellIndex] === 'select-single';
                                        const options = (isSelect || isSelectSingle) ? getSelectOptions(cellIndex) : [];
                                        const cellArray = Array.isArray(cell) ? cell : (cell ? [cell] : []);
                                        const cellStyle = getCellStyle(cellIndex);
                                        const inputType = getInputType(cellIndex);
                                        
                                        if (isSelect) {
                                            return `
                                                <td class="select-cell ${isColumnFixed(cellIndex) ? 'fixed-column' : ''}" style="${cellStyle} ${isColumnFixed(cellIndex) ? `left: ${getFixedLeftOffset(cellIndex)}px;` : ''}">
                                                    <div class="multi-select-container" data-table-id="${table.id}" data-row-id="${row.id}" data-col-index="${cellIndex}">
                                                        <div class="selected-values">
                                                            ${cellArray.map(val => `
                                                                <span class="value-tag">
                                                                    ${val}
                                                                    <button class="remove-tag" data-value="${val}">×</button>
                                                                </span>
                                                            `).join('')}
                                                            <button class="add-tag-btn">+ Add</button>
                                                        </div>
                                                        <div class="dropdown-menu" style="display: none;">
                                                            ${options.map(opt => `
                                                                <label class="dropdown-item">
                                                                    <input type="checkbox" value="${opt}" ${cellArray.includes(opt) ? 'checked' : ''}>
                                                                    <span>${opt}</span>
                                                                </label>
                                                            `).join('')}
                                                            <div class="dropdown-divider"></div>
                                                            <button class="dropdown-item add-new-option">+ Add new option</button>
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            class="cell-input cell-input-hidden" 
                                                            value=""
                                                            data-table-id="${table.id}"
                                                            data-row-id="${row.id}"
                                                            data-col-index="${cellIndex}"
                                                            style="display: none;"
                                                            placeholder="Enter new option"
                                                        >
                                                    </div>
                                                </td>
                                            `;
                                        } else if (isSelectSingle) {
                                            const cellValue = Array.isArray(cell) ? (cell.length > 0 ? cell[0] : '') : cell;
                                            return `
                                                <td class="select-single-cell ${isColumnFixed(cellIndex) ? 'fixed-column' : ''}" style="${cellStyle} ${isColumnFixed(cellIndex) ? `left: ${getFixedLeftOffset(cellIndex)}px;` : ''}">
                                                    <div class="single-select-container" data-table-id="${table.id}" data-row-id="${row.id}" data-col-index="${cellIndex}">
                                                        <input 
                                                            type="text" 
                                                            class="cell-input single-select-input" 
                                                            value="${cellValue}"
                                                            data-table-id="${table.id}"
                                                            data-row-id="${row.id}"
                                                            data-col-index="${cellIndex}"
                                                            placeholder="Select or type..."
                                                            autocomplete="off"
                                                        >
                                                        <div class="autocomplete-dropdown" style="display: none;">
                                                            ${options.map(opt => `
                                                                <div class="autocomplete-item" data-value="${opt}">${opt}</div>
                                                            `).join('')}
                                                        </div>
                                                    </div>
                                                </td>
                                            `;
                                        } else {
                                            return `
                                                <td class="${isColumnFixed(cellIndex) ? 'fixed-column' : ''}" style="${cellStyle} ${isColumnFixed(cellIndex) ? `left: ${getFixedLeftOffset(cellIndex)}px;` : ''}">
                                                    <input 
                                                        type="${inputType}"
                                                        class="cell-input" 
                                                        value="${cell}"
                                                        data-table-id="${table.id}"
                                                        data-row-id="${row.id}"
                                                        data-col-index="${cellIndex}"
                                                    >
                                                </td>
                                            `;
                                        }
                                    }).join('')}
                                    <td class="action-cell">
                                        <button 
                                            class="btn btn-icon btn-delete-row" 
                                            data-table-id="${table.id}"
                                            data-row-id="${row.id}"
                                            title="Delete Row"
                                        >🗑</button>
                                    </td>
                                    <div 
                                        class="row-resize-handle" 
                                        data-table-id="${table.id}"
                                        data-row-index="${rowIndex}"
                                    ></div>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <button 
                        class="btn btn-secondary btn-add-row" 
                        data-table-id="${table.id}"
                    >
                        <span class="icon">+</span> Add Row
                    </button>
                </div>
            </div>
        `;
    }

    bindTableEvents(table) {
        // Table name
        const nameInput = document.querySelector(`input.table-name-input[data-table-id="${table.id}"]`);
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.updateTableName(table.id, e.target.value);
            });
        }

        // Delete table
        const deleteTableBtn = document.querySelector(`.btn-delete-table[data-table-id="${table.id}"]`);
        if (deleteTableBtn) {
            deleteTableBtn.addEventListener('click', () => {
                if (confirm('Delete this table?')) {
                    this.deleteTable(table.id);
               
                }
            });
        }

        // Column names
        document.querySelectorAll(`input.column-name-input[data-table-id="${table.id}"]`).forEach(input => {
            input.addEventListener('input', (e) => {
                const colIndex = parseInt(e.target.dataset.colIndex);
                this.updateColumnName(table.id, colIndex, e.target.value);
            });
        });

        // Delete column
        document.querySelectorAll(`.btn-delete-column[data-table-id="${table.id}"]`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const colIndex = parseInt(e.target.dataset.colIndex);
                if (confirm('Delete this column?')) {
                    this.deleteColumn(table.id, colIndex);
                }
            });
        });

        // Add column
        const addColumnBtn = document.querySelector(`.btn-add-column[data-table-id="${table.id}"]`);
        if (addColumnBtn) {
            addColumnBtn.addEventListener('click', () => {
                this.addColumn(table.id);
            });
        }

        // Column code buttons
        document.querySelectorAll(`.btn-column-code[data-table-id="${table.id}"]`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const colIndex = parseInt(btn.dataset.colIndex);
                this.openColumnCodeModal(table.id, colIndex);
            });
        });

        // Filter controls
        const filterColumnSelect = document.querySelector(`.filter-column-select[data-table-id="${table.id}"]`);
        const filterValueInput = document.querySelector(`.filter-value-input[data-table-id="${table.id}"]`);
        const clearFilterBtn = document.querySelector(`.btn-clear-filter[data-table-id="${table.id}"]`);

        const applyFilter = () => {
            const colIndex = filterColumnSelect.value === '' ? null : parseInt(filterColumnSelect.value);
            const filterValue = filterValueInput.value.toLowerCase().trim();

            // Show/hide clear button
            clearFilterBtn.style.display = filterValue ? 'inline-block' : 'none';

            // Filter rows
            table.rows.forEach(row => {
                const rowElement = document.querySelector(`tr[data-row-id="${row.id}"]`);
                if (!rowElement) return;

                if (!filterValue) {
                    rowElement.style.display = '';
                    return;
                }

                let matches = false;
                if (colIndex !== null) {
                    // Filter by specific column
                    const cellValue = row.cells[colIndex];
                    const valueStr = Array.isArray(cellValue) ? cellValue.join(' ').toLowerCase() : String(cellValue).toLowerCase();
                    matches = valueStr.includes(filterValue);
                } else {
                    // Filter across all columns
                    matches = row.cells.some(cell => {
                        const valueStr = Array.isArray(cell) ? cell.join(' ').toLowerCase() : String(cell).toLowerCase();
                        return valueStr.includes(filterValue);
                    });
                }

                rowElement.style.display = matches ? '' : 'none';
            });
        };

        filterColumnSelect.addEventListener('change', applyFilter);
        filterValueInput.addEventListener('input', applyFilter);

        clearFilterBtn.addEventListener('click', () => {
            filterColumnSelect.value = '';
            filterValueInput.value = '';
            clearFilterBtn.style.display = 'none';
            table.rows.forEach(row => {
                const rowElement = document.querySelector(`tr[data-row-id="${row.id}"]`);
                if (rowElement) rowElement.style.display = '';
            });
        });

        // Cell inputs
        document.querySelectorAll(`input.cell-input[data-table-id="${table.id}"]`).forEach(input => {
            input.addEventListener('input', (e) => {
                const rowId = parseInt(e.target.dataset.rowId);
                const colIndex = parseInt(e.target.dataset.colIndex);
                this.updateCell(table.id, rowId, colIndex, e.target.value);
            });

            // Paste from Excel
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const rowId = parseInt(e.target.dataset.rowId);
                const colIndex = parseInt(e.target.dataset.colIndex);
                this.handlePaste(table.id, rowId, colIndex, e.clipboardData);
            });

            // Keyboard navigation
            input.addEventListener('keydown', (e) => {
                const rowId = parseInt(e.target.dataset.rowId);
                const colIndex = parseInt(e.target.dataset.colIndex);
                const currentRow = table.rows.findIndex(r => r.id === rowId);

                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // Move to cell below
                    if (currentRow < table.rows.length - 1) {
                        const nextRowId = table.rows[currentRow + 1].id;
                        const nextInput = document.querySelector(`input.cell-input[data-table-id="${table.id}"][data-row-id="${nextRowId}"][data-col-index="${colIndex}"]`);
                        if (nextInput) {
                            nextInput.focus();
                            nextInput.select();
                        }
                    }
                } else if (e.key === 'Tab') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        // Move to cell left
                        if (colIndex > 0) {
                            const prevInput = document.querySelector(`input.cell-input[data-table-id="${table.id}"][data-row-id="${rowId}"][data-col-index="${colIndex - 1}"]`);
                            if (prevInput) {
                                prevInput.focus();
                                prevInput.select();
                            }
                        }
                    } else {
                        // Move to cell right
                        if (colIndex < table.columns.length - 1) {
                            const nextInput = document.querySelector(`input.cell-input[data-table-id="${table.id}"][data-row-id="${rowId}"][data-col-index="${colIndex + 1}"]`);
                            if (nextInput) {
                                nextInput.focus();
                                nextInput.select();
                            }
                        }
                    }
                }
            });
        });

        // Single-select containers
        document.querySelectorAll(`.single-select-container[data-table-id="${table.id}"]`).forEach(container => {
            const rowId = parseInt(container.dataset.rowId);
            const colIndex = parseInt(container.dataset.colIndex);
            const input = container.querySelector('.single-select-input');
            const dropdown = container.querySelector('.autocomplete-dropdown');

            // Show dropdown on focus
            input.addEventListener('focus', () => {
                dropdown.style.display = 'block';
            });

            // Hide dropdown on blur (with delay to allow click)
            input.addEventListener('blur', () => {
                setTimeout(() => {
                    dropdown.style.display = 'none';
                }, 200);
            });

            // Filter options on input
            input.addEventListener('input', (e) => {
                const value = e.target.value.toLowerCase();
                const items = dropdown.querySelectorAll('.autocomplete-item');
                items.forEach(item => {
                    const itemValue = item.dataset.value.toLowerCase();
                    if (itemValue.includes(value)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
                dropdown.style.display = 'block';
            });

            // Handle option click
            dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    input.value = item.dataset.value;
                    dropdown.style.display = 'none';
                    this.updateCell(table.id, rowId, colIndex, input.value);
                });
            });

            // Handle keyboard navigation
            input.addEventListener('keydown', (e) => {
                const items = Array.from(dropdown.querySelectorAll('.autocomplete-item')).filter(item => item.style.display !== 'none');
                const currentIndex = items.findIndex(item => item.classList.contains('highlighted'));

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                    items.forEach(item => item.classList.remove('highlighted'));
                    items[nextIndex].classList.add('highlighted');
                    items[nextIndex].scrollIntoView({ block: 'nearest' });
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                    items.forEach(item => item.classList.remove('highlighted'));
                    items[prevIndex].classList.add('highlighted');
                    items[prevIndex].scrollIntoView({ block: 'nearest' });
                } else if (e.key === 'Enter') {
                    if (currentIndex >= 0) {
                        e.preventDefault();
                        input.value = items[currentIndex].dataset.value;
                        dropdown.style.display = 'none';
                        this.updateCell(table.id, rowId, colIndex, input.value);
                    }
                } else if (e.key === 'Escape') {
                    dropdown.style.display = 'none';
                }
            });
        });

        // Multi-select containers
        document.querySelectorAll(`.multi-select-container[data-table-id="${table.id}"]`).forEach(container => {
            const rowId = parseInt(container.dataset.rowId);
            const colIndex = parseInt(container.dataset.colIndex);
            const selectedValuesDiv = container.querySelector('.selected-values');
            const dropdownMenu = container.querySelector('.dropdown-menu');
            const addTagBtn = container.querySelector('.add-tag-btn');
            const hiddenInput = container.querySelector('.cell-input-hidden');

            // Toggle dropdown
            addTagBtn.addEventListener('click', () => {
                dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!container.contains(e.target)) {
                    dropdownMenu.style.display = 'none';
                }
            });

            // Handle checkbox changes
            container.querySelectorAll('.dropdown-item input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const tableObj = this.tables.find(t => t.id === table.id);
                    const row = tableObj.rows.find(r => r.id === rowId);
                    let currentValues = Array.isArray(row.cells[colIndex]) ? row.cells[colIndex] : [];
                    
                    if (checkbox.checked) {
                        if (!currentValues.includes(checkbox.value)) {
                            currentValues.push(checkbox.value);
                        }
                    } else {
                        currentValues = currentValues.filter(v => v !== checkbox.value);
                    }
                    
                    row.cells[colIndex] = currentValues;
                    this.saveToStorage();
                    this.render();
                });
            });

            // Remove tag buttons
            container.querySelectorAll('.remove-tag').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const valueToRemove = btn.dataset.value;
                    const tableObj = this.tables.find(t => t.id === table.id);
                    const row = tableObj.rows.find(r => r.id === rowId);
                    let currentValues = Array.isArray(row.cells[colIndex]) ? row.cells[colIndex] : [];
                    currentValues = currentValues.filter(v => v !== valueToRemove);
                    row.cells[colIndex] = currentValues;
                    this.saveToStorage();
                    this.render();
                });
            });

            // Add new option button
            const addNewOptionBtn = container.querySelector('.add-new-option');
            addNewOptionBtn.addEventListener('click', () => {
                dropdownMenu.style.display = 'none';
                hiddenInput.style.display = 'block';
                hiddenInput.focus();
            });

            // Handle new option input
            hiddenInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const newValue = hiddenInput.value.trim();
                    if (newValue) {
                        const tableObj = this.tables.find(t => t.id === table.id);
                        const row = tableObj.rows.find(r => r.id === rowId);
                        let currentValues = Array.isArray(row.cells[colIndex]) ? row.cells[colIndex] : [];
                        if (!currentValues.includes(newValue)) {
                            currentValues.push(newValue);
                        }
                        row.cells[colIndex] = currentValues;
                        hiddenInput.value = '';
                        hiddenInput.style.display = 'none';
                        this.saveToStorage();
                        this.render();
                    }
                }
                if (e.key === 'Escape') {
                    hiddenInput.value = '';
                    hiddenInput.style.display = 'none';
                }
            });

            hiddenInput.addEventListener('blur', () => {
                setTimeout(() => {
                    hiddenInput.value = '';
                    hiddenInput.style.display = 'none';
                }, 200);
            });
        });

        // Delete row
        document.querySelectorAll(`.btn-delete-row[data-table-id="${table.id}"]`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rowId = parseInt(e.target.dataset.rowId);
                if (confirm('Delete this row?')) {
                    this.deleteRow(table.id, rowId);
                }
            });
        });

        // Add row
        const addRowBtn = document.querySelector(`.btn-add-row[data-table-id="${table.id}"]`);
        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => {
                this.addRow(table.id);
            });
        }

        // Column resize handles
        document.querySelectorAll(`.col-resize-handle[data-table-id="${table.id}"]`).forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                this.startColumnResize(e, table.id, parseInt(handle.dataset.colIndex));
            });
        });

        // Row resize handles
        document.querySelectorAll(`.row-resize-handle[data-table-id="${table.id}"]`).forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                this.startRowResize(e, table.id, parseInt(handle.dataset.rowIndex));
            });
        });
    }

    // Column resize
    startColumnResize(e, tableId, colIndex) {
        e.preventDefault();
        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;

        const startX = e.clientX;
        const startWidth = table.columnWidths[colIndex];
        const th = e.target.closest('th');

        const onMouseMove = (moveEvent) => {
            const diff = moveEvent.clientX - startX;
            const newWidth = Math.max(50, startWidth + diff);
            table.columnWidths[colIndex] = newWidth;
            th.style.width = `${newWidth}px`;
            th.style.minWidth = `${newWidth}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this.saveToStorage();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // Row resize
    startRowResize(e, tableId, rowIndex) {
        e.preventDefault();
        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;

        const startY = e.clientY;
        const startHeight = table.rowHeights[rowIndex];
        const tr = e.target.closest('tr');

        const onMouseMove = (moveEvent) => {
            const diff = moveEvent.clientY - startY;
            const newHeight = Math.max(30, startHeight + diff);
            table.rowHeights[rowIndex] = newHeight;
            tr.style.height = `${newHeight}px`;
            tr.style.minHeight = `${newHeight}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this.saveToStorage();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new TableCreator();
});