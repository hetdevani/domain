import React from 'react';
import DynamicForm, { type FormField } from '../../../components/form/DynamicForm';
import FormModal from '../../../components/common/FormModal';
import { MONITOR_TYPE, USER_TYPES } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';

interface MonitorFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    loading?: boolean;
}

const MonitorForm: React.FC<MonitorFormProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading = false
}) => {
    const { user } = useAuth();
    const fields: FormField[] = [
        {
            name: 'name',
            label: 'Monitor Name',
            type: 'text',
            placeholder: 'e.g. My Website',
            validation: { required: 'Name is required' },
            grid: { sm: 6 }
        },
        {
            name: 'url',
            label: 'URL or IP',
            type: 'text',
            placeholder: 'https://example.com',
            validation: { required: 'URL is required' },
            grid: { sm: 6 }
        },
        {
            name: 'type',
            label: 'Check Type',
            type: 'select',
            options: [
                { label: 'HTTP(s)', value: MONITOR_TYPE.HTTP },
                { label: 'Ping', value: MONITOR_TYPE.PING },
                { label: 'TCP Port', value: MONITOR_TYPE.TCP },
                { label: 'DNS', value: MONITOR_TYPE.DNS },
                { label: 'Keyword', value: MONITOR_TYPE.KEYWORD },
            ],
            validation: { required: 'Type is required' },
            grid: { sm: 6 }
        },
        {
            name: 'checkInterval',
            label: 'Check Interval (minutes)',
            type: 'number',
            placeholder: '5',
            validation: {
                required: 'Interval is required',
                min: {
                    value: user?.type === USER_TYPES.MASTER_ADMIN ? 1 : (user?.plan?.minCheckInterval || 5),
                    message: `Minimum ${user?.type === USER_TYPES.MASTER_ADMIN ? 1 : (user?.plan?.minCheckInterval || 5)} minutes allowed in your plan`
                }
            },
            grid: { sm: 6 }
        },
        {
            name: 'keyword',
            label: 'Search Keyword (For Keyword Type)',
            type: 'text',
            placeholder: 'e.g. Welcome',
            grid: { sm: 6 },
            condition: (values) => values.type === MONITOR_TYPE.KEYWORD
        },
        {
            name: 'sslMonitoring',
            label: 'Monitor SSL Certificate',
            type: 'switch',
            grid: { sm: 6 },
            condition: (values) => [MONITOR_TYPE.HTTP, MONITOR_TYPE.TCP].includes(values.type)
        },
        {
            name: 'sslNotifyDays',
            label: 'Notify Before Expiry (Days)',
            type: 'number',
            placeholder: '7',
            grid: { sm: 6 },
            condition: (values) => !!values.sslMonitoring
        },
        {
            name: 'emailNotifications',
            label: 'Email Notifications',
            type: 'switch',
            grid: { sm: 6 },
            condition: () => user?.type === USER_TYPES.MASTER_ADMIN || !!user?.plan?.emailNotifications
        },
        {
            name: 'smsNotifications',
            label: 'SMS Notifications',
            type: 'switch',
            grid: { sm: 6 },
            condition: () => user?.type === USER_TYPES.MASTER_ADMIN || !!user?.plan?.smsNotifications
        },
        {
            name: 'notificationEmails',
            label: 'Notification Emails',
            type: 'text',
            placeholder: 'admin@example.com, alert@example.com',
            grid: { sm: 12 },
            condition: (values) => !!values.emailNotifications
        },
        {
            name: 'notificationCountryCode',
            label: 'Country Code',
            type: 'text',
            placeholder: '+91',
            grid: { sm: 4 },
            condition: (values) => !!values.smsNotifications
        },
        {
            name: 'notificationMobile',
            label: 'Mobile Number',
            type: 'text',
            placeholder: 'e.g. 9876543210',
            grid: { sm: 8 },
            condition: (values) => !!values.smsNotifications
        }
    ];

    const handleFormSubmit = (data: any) => {
        // Clean up object from joined queries to avoid Joi schema errors
        const submitData = { ...data };
        delete submitData.owner;
        delete submitData.plan;

        // For Keyword type, we store it as URL|Keyword
        if (submitData.type === MONITOR_TYPE.KEYWORD && submitData.keyword) {
            const baseUrl = submitData.url.split('|')[0]; // Clean existing pipe if editing
            submitData.url = `${baseUrl}|${submitData.keyword}`;
        }
        onSubmit(submitData);
    };

    const [customers, setCustomers] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (open && user?.type === USER_TYPES.MASTER_ADMIN) {
            // Fetch customers to populate the select dropdown
            import('../../users/api/userApi').then(({ userApi }) => {
                userApi.getPaginated({ filter: { type: USER_TYPES.CUSTOMER }, limit: 100 })
                    .then(res => setCustomers(res.data.data.data || []))
                    .catch(e => console.error("Could not fetch customers", e));
            });
        }
    }, [open, user]);

    if (user?.type === USER_TYPES.MASTER_ADMIN) {
        fields.unshift({
            name: 'ownerId',
            label: 'Assign to Customer (Optional)',
            type: 'select',
            options: [
                ...customers.map(c => ({ label: `${c.name} (${c.email})`, value: c.id }))
            ],
            grid: { sm: 12 }
        });
    }

    const initialDataWithKeyword = React.useMemo(() => {
        if (!initialData) {
            return {
                emailNotifications: user?.type === USER_TYPES.MASTER_ADMIN || !!user?.plan?.emailNotifications,
                smsNotifications: false,
                notificationCountryCode: '+91'
            };
        }

        const data = { ...initialData };
        if (data.type === MONITOR_TYPE.KEYWORD && data.url?.includes('|')) {
            const parts = data.url.split('|');
            data.url = parts[0];
            data.keyword = parts.length > 1 ? parts[1] : '';
        }
        return data;
    }, [initialData, user]);

    const formId = 'monitor-management-form';

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={initialData ? 'Update Monitor Settings' : 'Add New Monitor'}
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
                initialData={initialDataWithKeyword}
                loading={loading}
            />
        </FormModal>
    );
};

export default MonitorForm;
