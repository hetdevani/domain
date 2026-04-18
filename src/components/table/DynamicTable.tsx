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
    TableSortLabel,
    Popover,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Badge
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
import { BRAND } from '../../theme';

export interface FilterField {
    key: string;
    label: string;
    type: 'select';
    options: { label: string; value: any }[];
}

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
    filterConfig?: FilterField[];
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
    titleComponent,
    filterConfig = []
}) => {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<any>({});
    const [sortBy, setSortBy] = useState<Record<string, number>>({ createdAt: -1 });
    const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
    const [pendingFilters, setPendingFilters] = useState<any>({});

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
        bgcolor: BRAND.bgMuted,
        color: BRAND.textSecondary,
        fontWeight: 700,
        fontSize: '0.69rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        borderBottom: `1px solid ${BRAND.borderLight}`,
        py: 1.75,
        whiteSpace: 'nowrap' as const,
        fontFamily: '"DM Sans", sans-serif',
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
                    <Typography variant="h5" sx={{ fontWeight: 800, color: BRAND.textPrimary, letterSpacing: '-0.02em', fontFamily: '"Outfit","DM Sans",sans-serif' }}>
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
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                letterSpacing: '0.01em',
                                px: 2.5,
                                background: `linear-gradient(135deg, ${BRAND.amberLt} 0%, ${BRAND.amber} 55%, ${BRAND.amberDk} 100%)`,
                                color: '#0a0f1e',
                                boxShadow: `0 4px 14px ${BRAND.amberGlow}`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${BRAND.amberLt} 0%, ${BRAND.amber} 55%, ${BRAND.amberDk} 100%)`,
                                    filter: 'brightness(1.08)',
                                    boxShadow: `0 6px 20px ${BRAND.amberGlow}`,
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
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            letterSpacing: '0.01em',
                            borderColor: BRAND.borderLight,
                            color: BRAND.textSecondary,
                            '&:hover': { borderColor: BRAND.amberBorder, color: BRAND.amberDk, bgcolor: BRAND.amberBg }
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
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: BRAND.amber },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: BRAND.amber },
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
                    {filterConfig.length > 0 && (
                        <>
                            <Tooltip title="Filters">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        setPendingFilters({ ...filters });
                                        setFilterAnchor(e.currentTarget);
                                    }}
                                    sx={{ bgcolor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.08)', '&:hover': { bgcolor: '#F1F5F9' } }}
                                >
                                    <Badge
                                        badgeContent={Object.keys(filters).filter(k => filters[k] !== '' && filters[k] !== undefined).length}
                                        color="primary"
                                        sx={{ '& .MuiBadge-badge': { bgcolor: BRAND.amber, color: '#0a0f1e', fontSize: '0.6rem', minWidth: 16, height: 16 } }}
                                    >
                                        <Filter size={16} color={Object.keys(filters).length > 0 ? BRAND.amber : BRAND.textMuted} />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                            <Popover
                                open={Boolean(filterAnchor)}
                                anchorEl={filterAnchor}
                                onClose={() => setFilterAnchor(null)}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                PaperProps={{
                                    sx: {
                                        mt: 1, p: 2.5, borderRadius: '14px', minWidth: 260,
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                        border: '1px solid rgba(0,0,0,0.08)'
                                    }
                                }}
                            >
                                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: BRAND.textSecondary, mb: 2 }}>Filter by</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {filterConfig.map((field) => (
                                        <FormControl key={field.key} size="small" fullWidth>
                                            <InputLabel sx={{ fontSize: '0.85rem' }}>{field.label}</InputLabel>
                                            <Select
                                                value={pendingFilters[field.key] ?? ''}
                                                label={field.label}
                                                onChange={(e) => setPendingFilters((prev: any) => ({ ...prev, [field.key]: e.target.value }))}
                                                sx={{ fontSize: '0.875rem', borderRadius: '8px' }}
                                            >
                                                <MenuItem value=""><em>All</em></MenuItem>
                                                {field.options.map((opt) => (
                                                    <MenuItem key={String(opt.value)} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ))}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mt: 2.5 }}>
                                    <Button
                                        fullWidth variant="outlined" size="small"
                                        onClick={() => { setFilters({}); setPendingFilters({}); setFilterAnchor(null); }}
                                        sx={{ borderRadius: '8px', fontWeight: 600, borderColor: BRAND.borderLight, color: BRAND.textSecondary }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        fullWidth variant="contained" size="small"
                                        onClick={() => {
                                            const applied: any = {};
                                            Object.entries(pendingFilters).forEach(([k, v]) => {
                                                if (v !== '' && v !== undefined) applied[k] = v;
                                            });
                                            setFilters(applied);
                                            setFilterAnchor(null);
                                        }}
                                        sx={{ borderRadius: '8px', fontWeight: 700, background: `linear-gradient(135deg, ${BRAND.amber}, ${BRAND.amberDk})`, color: '#0a0f1e', '&:hover': { filter: 'brightness(1.08)' } }}
                                    >
                                        Apply
                                    </Button>
                                </Box>
                            </Popover>
                        </>
                    )}
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
                                        <CircularProgress size={36} sx={{ color: BRAND.amber }} />
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
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND.textSecondary, letterSpacing: '-0.01em', mb: 0.5, fontFamily: '"Outfit",sans-serif' }}>No results found</Typography>
                                        <Typography variant="body2" sx={{ color: BRAND.textMuted, fontSize: '0.875rem' }}>Try adjusting your search or filters</Typography>
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
                                                bgcolor: BRAND.bgSection + ' !important',
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
