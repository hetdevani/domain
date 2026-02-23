import React from 'react';
import DynamicForm, { type FormField } from '../../../components/form/DynamicForm';
import { USER_TYPES } from '../../../types';
import FormModal from '../../../components/common/FormModal';

interface UserFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading = false
}) => {
    const fields: FormField[] = [
        {
            name: 'name',
            label: 'Full Name',
            type: 'text',
            placeholder: 'e.g. John Doe',
            validation: { required: 'Name is required' },
            grid: { sm: 6 }
        },
        {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            placeholder: 'john@example.com',
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
                { label: 'Admin', value: USER_TYPES.ADMIN },
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

    const formId = 'user-management-form';

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={initialData ? 'Update User Information' : 'Register New User'}
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
                onSubmit={onSubmit}
                initialData={initialData}
                loading={loading}
            />
        </FormModal>
    );
};

export default UserForm;

