import React from 'react';
import DynamicForm, { type FormField } from '../../../components/form/DynamicForm';
import { USER_TYPES } from '../../../types';
import FormModal from '../../../components/common/FormModal';

interface CustomerFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    loading?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading = false
}) => {
    const fields: FormField[] = [
        {
            name: 'name',
            label: 'Customer Name',
            type: 'text',
            placeholder: 'e.g. Acme Corp',
            validation: { required: 'Name is required' },
            grid: { sm: 6 }
        },
        {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            placeholder: 'admin@acme.com',
            validation: { required: 'Email is required' },
            grid: { sm: 6 }
        },
        {
            name: 'mobile',
            label: 'Mobile Number',
            type: 'text',
            placeholder: '9876543210',
            validation: { required: 'Mobile is required' },
            grid: { sm: 6 }
        },
        {
            name: 'type',
            label: 'User Role',
            type: 'select',
            options: [
                { label: 'Customer', value: USER_TYPES.CUSTOMER },
            ],
            validation: { required: 'Role is required' },
            grid: { sm: 6 }
        },
        ...(!initialData ? [{
            name: 'password',
            label: 'Access Password',
            type: 'password',
            placeholder: '••••••••',
            validation: { required: 'Password is required' },
            grid: { sm: 12 }
        } as FormField] : [])
    ];

    const formId = 'customer-management-form';

    // Ensure type is always CUSTOMER for new users
    const handleFormSubmit = (data: any) => {
        onSubmit({ ...data, type: USER_TYPES.CUSTOMER });
    };

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={initialData ? 'Update Customer Information' : 'Register New Customer'}
            isEdit={!!initialData}
            loading={loading}
            onSubmit={() => {
                const form = document.getElementById(formId) as HTMLFormElement;
                if (form) form.requestSubmit();
            }}
            maxWidth="md"
        >
            <DynamicForm
                formId={formId}
                fields={fields}
                onSubmit={handleFormSubmit}
                initialData={initialData || { type: USER_TYPES.CUSTOMER }}
                loading={loading}
            />
        </FormModal>
    );
};

export default CustomerForm;
