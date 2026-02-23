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

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {title}
                    </Typography>
                    {titleComponent}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {onCreate && (
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            onClick={onCreate}
                        >
                            Add New
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<Download size={18} />}
                        color="inherit"
                    >
                        Export
                    </Button>
                </Box>
            </Box >

            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 1 }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: alpha('#f8fafc', 0.5) }}>
                    <TextField
                        placeholder={searchPlaceholder}
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} color="#94a3b8" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flexGrow: 1, maxWidth: 400 }}
                    />
                    <IconButton onClick={() => setFilters({})} size="small" title="Reset Filters">
                        <RotateCcw size={18} />
                    </IconButton>
                    <IconButton size="small" title="Filters">
                        <Filter size={18} />
                    </IconButton>
                </Box>

                <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.sortable ? (
                                            <TableSortLabel
                                                active={sortBy[column.id] !== undefined}
                                                direction={sortBy[column.id] === 1 ? 'asc' : 'desc'}
                                                onClick={() => handleRequestSort(column.id)}
                                            >
                                                {column.label}
                                            </TableSortLabel>
                                        ) : (
                                            column.label
                                        )}
                                    </TableCell>
                                ))}
                                {actions && (
                                    <TableCell align="center" style={{ minWidth: 100 }}>
                                        Actions
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={40} />
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 10 }}>
                                        <Typography color="text.secondary">No data found</Typography>
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
                                        sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                    >
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.format ? column.format(value, row) : value}
                                                </TableCell>
                                            );
                                        })}
                                        {actions && (
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                    {onView && (
                                                        <Tooltip title="View">
                                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onView(row); }}>
                                                                <Eye size={16} color="#64748b" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {onEdit && (
                                                        <Tooltip title="Edit">
                                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(row); }}>
                                                                <Edit size={16} color="#0ea5e9" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {onDelete && (
                                                        <Tooltip title="Delete">
                                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(row); }}>
                                                                <Trash2 size={16} color="#ef4444" />
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
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box >
    );
};

export default DynamicTable;
