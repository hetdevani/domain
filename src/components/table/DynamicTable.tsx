import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    TextField,
    Box,
    IconButton,
    Tooltip,
    CircularProgress,
    Typography,
    InputAdornment,
    Button,
    alpha,
    TableSortLabel
} from '@mui/material';
import {
    Search,
    Filter,
    RotateCcw,
    Download,
    Plus,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';

export interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'right' | 'left' | 'center';
    format?: (value: any, row: any) => React.ReactNode;
    sortable?: boolean;
}

interface DynamicTableProps {
    columns: Column[];
    fetchData: (params: any) => Promise<{ data: any[]; total: number }>;
    onRowClick?: (row: any) => void;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onView?: (row: any) => void;
    onCreate?: () => void;
    title: string;
    searchPlaceholder?: string;
    searchKeys?: string[];
    actions?: boolean;
    renderExtraActions?: (row: any) => React.ReactNode;
    titleComponent?: React.ReactNode;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
    columns,
    fetchData,
    onRowClick,
    onEdit,
    onDelete,
    onView,
    onCreate,
    title,
    searchPlaceholder = 'Search...',
    searchKeys = ['name'],
    actions = true,
    renderExtraActions,
    titleComponent
}) => {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<any>({});
    const [sortBy, setSortBy] = useState<Record<string, number>>({ createdAt: -1 });

    const loadData = async () => {
        setLoading(true);
        try {
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                search: {
                    keys: searchKeys,
                    keyword: search
                },
                filter: filters,
                sortBy: sortBy
            };
            const result = await fetchData(params);
            setData(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadData();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [page, rowsPerPage, search, filters, sortBy]);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleRequestSort = (property: string) => {
        const isAsc = sortBy[property] === 1;
        setSortBy({ [property]: isAsc ? -1 : 1 });
    };

    const headerCellSx = {
        bgcolor: '#F1F5F9',
        color: '#64748B',
        fontWeight: 700,
        fontSize: '0.7rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        py: 1.75,
        whiteSpace: 'nowrap' as const,
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Page-level header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0A3D62', letterSpacing: '-0.01em' }}>
                        {title}
                    </Typography>
                    {titleComponent}
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {onCreate && (
                        <Button
                            variant="contained"
                            startIcon={<Plus size={17} />}
                            onClick={onCreate}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                px: 2.5,
                                boxShadow: '0 4px 12px rgba(10,61,98,0.25)',
                                bgcolor: '#0A3D62',
                                '&:hover': {
                                    bgcolor: '#0d4d7a',
                                    boxShadow: '0 6px 16px rgba(10,61,98,0.35)',
                                }
                            }}
                        >
                            Add New
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<Download size={17} />}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            borderColor: 'rgba(0,0,0,0.15)',
                            color: 'text.secondary',
                            '&:hover': { borderColor: 'rgba(0,0,0,0.25)', bgcolor: 'rgba(0,0,0,0.03)' }
                        }}
                    >
                        Export
                    </Button>
                </Box>
            </Box>

            <Paper sx={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: 3,
                boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
                border: '1px solid rgba(0,0,0,0.06)',
            }}>
                {/* Toolbar */}
                <Box sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: '#FFFFFF',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}>
                    <TextField
                        placeholder={searchPlaceholder}
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={16} color="#94a3b8" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            flexGrow: 1,
                            maxWidth: 420,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: '#F8FAFC',
                                fontSize: '0.875rem',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0A3D62' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0A3D62' },
                            }
                        }}
                    />
                    <Tooltip title="Reset Filters">
                        <IconButton
                            onClick={() => setFilters({})}
                            size="small"
                            sx={{ bgcolor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.08)', '&:hover': { bgcolor: '#F1F5F9' } }}
                        >
                            <RotateCcw size={16} color="#64748b" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Filters">
                        <IconButton
                            size="small"
                            sx={{ bgcolor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.08)', '&:hover': { bgcolor: '#F1F5F9' } }}
                        >
                            <Filter size={16} color="#64748b" />
                        </IconButton>
                    </Tooltip>
                </Box>

                <TableContainer>
                    <Table aria-label="data table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                        sx={headerCellSx}
                                    >
                                        {column.sortable ? (
                                            <TableSortLabel
                                                active={sortBy[column.id] !== undefined}
                                                direction={sortBy[column.id] === 1 ? 'asc' : 'desc'}
                                                onClick={() => handleRequestSort(column.id)}
                                                sx={{ color: 'inherit !important', '& .MuiTableSortLabel-icon': { color: 'inherit !important' } }}
                                            >
                                                {column.label}
                                            </TableSortLabel>
                                        ) : (
                                            column.label
                                        )}
                                    </TableCell>
                                ))}
                                {actions && (
                                    <TableCell align="center" style={{ minWidth: 120 }} sx={headerCellSx}>
                                        Actions
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 12, border: 0 }}>
                                        <CircularProgress size={36} sx={{ color: '#0A3D62' }} />
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading data...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 12, border: 0 }}>
                                        <Box sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 56,
                                            height: 56,
                                            borderRadius: '50%',
                                            bgcolor: '#F1F5F9',
                                            mb: 2
                                        }}>
                                            <Search size={24} color="#94a3b8" />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#64748b', mb: 0.5 }}>No results found</Typography>
                                        <Typography variant="body2" color="text.disabled">Try adjusting your search or filters</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row, index) => (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={row.id || index}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        sx={{
                                            cursor: onRowClick ? 'pointer' : 'default',
                                            bgcolor: index % 2 === 0 ? '#FFFFFF' : '#FAFBFE',
                                            transition: 'background-color 0.15s ease',
                                            '&:hover': {
                                                bgcolor: alpha('#0A3D62', 0.04) + ' !important',
                                            },
                                            '&:last-child td': { borderBottom: 0 },
                                        }}
                                    >
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align}
                                                    sx={{ py: 1.5, fontSize: '0.875rem', borderColor: 'rgba(0,0,0,0.04)' }}
                                                >
                                                    {column.format ? column.format(value, row) : value}
                                                </TableCell>
                                            );
                                        })}
                                        {actions && (
                                            <TableCell align="center" sx={{ py: 1, borderColor: 'rgba(0,0,0,0.04)' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                    {onView && (
                                                        <Tooltip title="View">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => { e.stopPropagation(); onView(row); }}
                                                                sx={{
                                                                    bgcolor: 'rgba(100, 116, 139, 0.08)',
                                                                    '&:hover': { bgcolor: 'rgba(100, 116, 139, 0.18)' }
                                                                }}
                                                            >
                                                                <Eye size={15} color="#64748b" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {onEdit && (
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                                                                sx={{
                                                                    bgcolor: 'rgba(14, 165, 233, 0.08)',
                                                                    '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.18)' }
                                                                }}
                                                            >
                                                                <Edit size={15} color="#0ea5e9" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {onDelete && (
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                                                                sx={{
                                                                    bgcolor: 'rgba(239, 68, 68, 0.08)',
                                                                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.18)' }
                                                                }}
                                                            >
                                                                <Trash2 size={15} color="#ef4444" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {renderExtraActions && renderExtraActions(row)}
                                                </Box>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', bgcolor: '#FAFBFE' }}>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component="div"
                        count={total}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{ '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.8125rem' } }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default DynamicTable;
