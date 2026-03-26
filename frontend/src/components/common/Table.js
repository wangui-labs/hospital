import React, { useState, useMemo } from 'react';
import { COLORS } from '../../utils/constants';
import LoadingSpinner from './LoadingSpinner';

// ============================================================================
// TABLE COMPONENT (Google Material Design Style)
// ============================================================================

const Table = ({
    // Data
    columns,
    data,

    // Features
    selectable = false,
    sortable = false,
    searchable = false,
    pagination = false,

    // State
    loading = false,
    error = false,
    errorMessage = 'Failed to load data',
    emptyMessage = 'No data available',

    // Pagination
    rowsPerPage = 10,
    rowsPerPageOptions = [5, 10, 25, 50],

    // Styling
    striped = true,
    hoverable = true,
    compact = false,
    className = '',

    // Actions
    onRowClick,
    onSelectionChange,
    onSort,

    // Custom renderers
    renderCell,
    renderHeader,

    // Other
    ...props
}) => {
    // ============================================================================
    // STATE
    // ============================================================================

    const [selectedRows, setSelectedRows] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPageState, setRowsPerPageState] = useState(rowsPerPage);

    // ============================================================================
    // DATA PROCESSING
    // ============================================================================

    // Search data
    const searchedData = useMemo(() => {
        if (!searchTerm || !searchable) return data;

        const term = searchTerm.toLowerCase();
        return data.filter(row => {
            return columns.some(column => {
                const value = row[column.key];
                return value && String(value).toLowerCase().includes(term);
            });
        });
    }, [data, searchTerm, columns, searchable]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortColumn || !sortable) return searchedData;

        return [...searchedData].sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            // Handle null/undefined
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            // Handle numbers
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            // Handle strings
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();

            if (sortDirection === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });
    }, [searchedData, sortColumn, sortDirection, sortable]);

    // Paginate data
    const paginatedData = useMemo(() => {
        if (!pagination) return sortedData;

        const start = (currentPage - 1) * rowsPerPageState;
        const end = start + rowsPerPageState;
        return sortedData.slice(start, end);
    }, [sortedData, currentPage, rowsPerPageState, pagination]);

    // Calculate total pages
    const totalPages = Math.ceil(sortedData.length / rowsPerPageState);

    // ============================================================================
    // HANDLERS
    // ============================================================================

    const handleSort = (columnKey) => {
        if (!sortable) return;

        let newDirection = 'asc';
        if (sortColumn === columnKey && sortDirection === 'asc') {
            newDirection = 'desc';
        }

        setSortColumn(columnKey);
        setSortDirection(newDirection);

        if (onSort) {
            onSort(columnKey, newDirection);
        }
    };

    const handleSelectAll = () => {
        let newSelected;
        if (selectedRows.length === paginatedData.length) {
            newSelected = [];
        } else {
            newSelected = paginatedData.map(row => row.id);
        }
        setSelectedRows(newSelected);
        if (onSelectionChange) onSelectionChange(newSelected);
    };

    const handleSelectRow = (rowId) => {
        let newSelected;
        if (selectedRows.includes(rowId)) {
            newSelected = selectedRows.filter(id => id !== rowId);
        } else {
            newSelected = [...selectedRows, rowId];
        }
        setSelectedRows(newSelected);
        if (onSelectionChange) onSelectionChange(newSelected);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPageState(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // ============================================================================
    // STYLES
    // ============================================================================

    const styles = {
        container: {
            backgroundColor: COLORS.white,
            borderRadius: '8px',
            overflow: 'hidden',
            border: `1px solid ${COLORS.gray[200]}`,
        },
        searchBar: {
            padding: '16px 20px',
            borderBottom: `1px solid ${COLORS.gray[200]}`,
            backgroundColor: COLORS.gray[50],
        },
        searchInput: {
            width: '100%',
            maxWidth: '300px',
            padding: '8px 12px',
            fontSize: '14px',
            border: `1px solid ${COLORS.gray[300]}`,
            borderRadius: '4px',
            outline: 'none',
            transition: 'all 0.2s',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
        },
        th: {
            textAlign: 'left',
            padding: compact ? '12px 16px' : '16px 20px',
            backgroundColor: COLORS.gray[50],
            borderBottom: `1px solid ${COLORS.gray[200]}`,
            color: COLORS.gray[600],
            fontWeight: 500,
            fontSize: '14px',
            cursor: sortable ? 'pointer' : 'default',
            userSelect: 'none',
        },
        td: {
            textAlign: 'left',
            padding: compact ? '12px 16px' : '16px 20px',
            borderBottom: `1px solid ${COLORS.gray[200]}`,
            color: COLORS.gray[700],
        },
        checkbox: {
            width: '18px',
            height: '18px',
            cursor: 'pointer',
        },
        sortIcon: {
            marginLeft: '4px',
            fontSize: '12px',
            display: 'inline-block',
        },
        pagination: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '12px 20px',
            borderTop: `1px solid ${COLORS.gray[200]}`,
            backgroundColor: COLORS.gray[50],
            gap: '16px',
        },
        pageButton: {
            padding: '6px 10px',
            border: `1px solid ${COLORS.gray[300]}`,
            backgroundColor: COLORS.white,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.2s',
        },
        activePageButton: {
            backgroundColor: COLORS.primary[500],
            color: COLORS.white,
            borderColor: COLORS.primary[500],
        },
        rowsPerPageSelect: {
            padding: '6px 8px',
            border: `1px solid ${COLORS.gray[300]}`,
            borderRadius: '4px',
            fontSize: '13px',
            cursor: 'pointer',
        },
    };

    // ============================================================================
    // RENDERERS
    // ============================================================================

    const renderSortIcon = (column) => {
        if (sortColumn !== column.key) {
            return <span style={styles.sortIcon}>⇅</span>;
        }
        return <span style={styles.sortIcon}>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const renderCellContent = (column, row, index) => {
        if (renderCell) {
            return renderCell(column, row, index);
        }
        return row[column.key];
    };

    // ============================================================================
    // LOADING STATE
    // ============================================================================

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ padding: '60px', textAlign: 'center' }}>
                    <LoadingSpinner size="md" message="Loading data..." />
                </div>
            </div>
        );
    }

    // ============================================================================
    // ERROR STATE
    // ============================================================================

    if (error) {
        return (
            <div style={styles.container}>
                <div style={{ padding: '60px', textAlign: 'center', color: COLORS.error }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px' }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill={COLORS.error} />
                    </svg>
                    <p>{errorMessage}</p>
                </div>
            </div>
        );
    }

    // ============================================================================
    // MAIN RENDER
    // ============================================================================

    return (
        <div style={styles.container} className={className} {...props}>
            {/* Search Bar */}
            {searchable && (
                <div style={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={styles.searchInput}
                        onFocus={(e) => e.target.style.borderColor = COLORS.primary[500]}
                        onBlur={(e) => e.target.style.borderColor = COLORS.gray[300]}
                    />
                </div>
            )}

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {/* Checkbox Column */}
                            {selectable && (
                                <th style={styles.th}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                                        onChange={handleSelectAll}
                                        style={styles.checkbox}
                                    />
                                </th>
                            )}

                            {/* Data Columns */}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    style={{
                                        ...styles.th,
                                        width: column.width,
                                        cursor: sortable && column.sortable !== false ? 'pointer' : 'default',
                                    }}
                                    onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                                >
                                    {renderHeader ? renderHeader(column) : column.label}
                                    {sortable && column.sortable !== false && renderSortIcon(column)}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0)}
                                    style={{
                                        ...styles.td,
                                        textAlign: 'center',
                                        color: COLORS.gray[500],
                                        padding: '48px',
                                    }}
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    style={{
                                        backgroundColor: (striped && rowIndex % 2 === 0) ? COLORS.gray[50] : COLORS.white,
                                        cursor: onRowClick ? 'pointer' : 'default',
                                        transition: hoverable ? 'background-color 0.2s' : 'none',
                                    }}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    onMouseEnter={(e) => {
                                        if (hoverable) {
                                            e.currentTarget.style.backgroundColor = COLORS.gray[100];
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (hoverable) {
                                            e.currentTarget.style.backgroundColor = (striped && rowIndex % 2 === 0) ? COLORS.gray[50] : COLORS.white;
                                        }
                                    }}
                                >
                                    {/* Checkbox */}
                                    {selectable && (
                                        <td style={styles.td}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                style={styles.checkbox}
                                            />
                                        </td>
                                    )}

                                    {/* Data Cells */}
                                    {columns.map((column) => (
                                        <td
                                            key={`${row.id || rowIndex}-${column.key}`}
                                            style={{
                                                ...styles.td,
                                                ...(column.cellStyle || {}),
                                            }}
                                        >
                                            {renderCellContent(column, row, rowIndex)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 0 && (
                <div style={styles.pagination}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: COLORS.gray[600] }}>Rows per page:</span>
                        <select
                            value={rowsPerPageState}
                            onChange={handleRowsPerPageChange}
                            style={styles.rowsPerPageSelect}
                        >
                            {rowsPerPageOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ fontSize: '13px', color: COLORS.gray[600] }}>
                        {((currentPage - 1) * rowsPerPageState) + 1} - {Math.min(currentPage * rowsPerPageState, sortedData.length)} of {sortedData.length}
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            style={{
                                ...styles.pageButton,
                                opacity: currentPage === 1 ? 0.5 : 1,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            «
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                ...styles.pageButton,
                                opacity: currentPage === 1 ? 0.5 : 1,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            ‹
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    style={{
                                        ...styles.pageButton,
                                        ...(currentPage === pageNum ? styles.activePageButton : {}),
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                ...styles.pageButton,
                                opacity: currentPage === totalPages ? 0.5 : 1,
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            }}
                        >
                            ›
                        </button>
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            style={{
                                ...styles.pageButton,
                                opacity: currentPage === totalPages ? 0.5 : 1,
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            }}
                        >
                            »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default Table;