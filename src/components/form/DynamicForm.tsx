import React from 'react';
import {
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Switch,
    FormControlLabel,
    Grid,
    FormHelperText
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'password' | 'select' | 'switch' | 'date' | 'textarea';
    options?: { label: string; value: any }[];
    validation?: any;
    grid?: { xs?: number; sm?: number; md?: number };
    placeholder?: string;
    condition?: (values: any) => boolean;
    disabled?: boolean;
}

interface DynamicFormProps {
    fields: FormField[];
    onSubmit: (data: any) => void;
    initialData?: any;
    formId?: string;
    loading?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
    fields,
    onSubmit,
    initialData = {},
    formId,
    loading = false
}) => {
    const { control, handleSubmit, formState: { errors }, watch } = useForm({
        defaultValues: initialData
    });

    const formValues = watch();

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                {fields.filter(f => !f.condition || f.condition(formValues)).map((field) => (
                    <Grid key={field.name} size={field.grid || { xs: 12 }}>
                        <Controller
                            name={field.name}
                            control={control}
                            rules={field.validation}
                            render={({ field: { onChange, value } }) => {
                                const error = !!errors[field.name];
                                const helperText = errors[field.name]?.message as string;

                                if (field.type === 'switch') {
                                    return (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={!!value}
                                                    onChange={onChange}
                                                    color="primary"
                                                    disabled={loading || field.disabled}
                                                />
                                            }
                                            label={field.label}
                                            sx={{
                                                '& .MuiTypography-root': {
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    color: 'text.secondary'
                                                }
                                            }}
                                        />
                                    );
                                }

                                if (field.type === 'select') {
                                    return (
                                        <FormControl fullWidth size="small" error={error}>
                                            <InputLabel sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{field.label}</InputLabel>
                                            <Select
                                                value={value || ''}
                                                label={field.label}
                                                onChange={onChange}
                                                disabled={loading || field.disabled}
                                                sx={{
                                                    borderRadius: '12px',
                                                    '& .MuiSelect-select': { fontWeight: 500 }
                                                }}
                                            >
                                                {field.options?.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value} sx={{ fontWeight: 500 }}>
                                                        {opt.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {error && <FormHelperText>{helperText}</FormHelperText>}
                                        </FormControl>
                                    );
                                }

                                return (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={field.label}
                                        type={field.type === 'textarea' ? 'text' : field.type}
                                        multiline={field.type === 'textarea'}
                                        rows={field.type === 'textarea' ? 4 : 1}
                                        placeholder={field.placeholder}
                                        value={value || ''}
                                        onChange={onChange}
                                        error={error}
                                        helperText={helperText}
                                        variant="outlined"
                                        disabled={loading || field.disabled}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                backgroundColor: 'rgba(0,0,0,0.01)',
                                                '&:hover fieldset': { borderColor: 'primary.main' },
                                            },
                                            '& .MuiInputBase-input': { fontWeight: 500 },
                                            '& .MuiInputLabel-root': { fontWeight: 600, fontSize: '0.85rem' }
                                        }}
                                    />
                                );
                            }}
                        />
                    </Grid>
                ))}
            </Grid>
        </form>
    );
};

export default DynamicForm;

