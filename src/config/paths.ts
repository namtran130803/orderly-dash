const dashboard = '/dashboard';

export const paths = {
    auth: {
        login: `/login`,
    },
    dashboard: {
        index: dashboard,
    },
    systemOverview: {
        index: `${dashboard}/overview`,
    },
    stores: {
        index: `${dashboard}/stores`,
    },
    categories: {
        index: `${dashboard}/categories`,
    },
    menuItems: {
        index: `${dashboard}/menu-items`,
    },
    areas: {
        index: `${dashboard}/areas`,
    },
    tables: {
        index: `${dashboard}/tables`,
    },
    statuses: {
        index: `${dashboard}/statuses`,
    },
    orders: {
        index: `${dashboard}/orders`,
    },
    expenses: {
        index: `${dashboard}/expenses`,
    },
    dashboardStats: {
        index: `${dashboard}/stats`,
    },
    roles: {
        index: `${dashboard}/roles`,
    },
    users: {
        index: `${dashboard}/users`,
    },
    paymentHistory: {
        index: `${dashboard}/payment-history`,
    },
    renewalHistory: {
        index: `${dashboard}/renewal-history`,
    },
    employees: {
        index: `${dashboard}/employees`,
    },
    storeRoles: {
        index: `${dashboard}/store-roles`,
    },
    attendance: {
        index: `${dashboard}/attendance`,
    },
    schedule: {
        index: `${dashboard}/schedule`,
    },
    payroll: {
        index: `${dashboard}/payroll`,
        employeeDetail: (id: number, month: number, year: number) =>
            `${dashboard}/payroll/employees/${id}/${month}/${year}`,
    },
    leave: {
        index: `${dashboard}/leave`,
    },
};
