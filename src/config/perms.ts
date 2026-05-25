export const PERMS = {
  users: {
    list: "users.list",
    role_list: "users.role_list",
    role_assign: "users.role_assign",
    role_remove: "users.role_remove",
  },
  roles: {
    list: "roles.list",
    create: "roles.create",
    update: "roles.update",
    delete: "roles.delete",
  },
  stores: {
    update: "stores.update",
    delete: "stores.delete",
    bypass_owner: "stores.bypass_owner",
    role_modules: "stores.role_modules",
  },
  store_roles: {
    list: "store_roles.list",
    create: "store_roles.create",
    update: "store_roles.update",
    delete: "store_roles.delete",
  },
  employees: {
    list: "employees.list",
    create: "employees.create",
    update: "employees.update",
    delete: "employees.delete",
    assign_role: "employees.assign_role",
    remove_role: "employees.remove_role",
  },
  system: {
    modules: "system.modules",
  },
  categories: {
    list: "categories.list",
    create: "categories.create",
    update: "categories.update",
    delete: "categories.delete",
    reorder: "categories.reorder",
  },
  menu_items: {
    list: "menu_items.list",
    create: "menu_items.create",
    update: "menu_items.update",
    delete: "menu_items.delete",
  },
  areas: {
    list: "areas.list",
    create: "areas.create",
    update: "areas.update",
    delete: "areas.delete",
    reorder: "areas.reorder",
  },
  tables: {
    list: "tables.list",
    update: "tables.update",
    delete: "tables.delete",
  },
  statuses: {
    list: "statuses.list",
    create: "statuses.create",
    update: "statuses.update",
    delete: "statuses.delete",
    reorder: "statuses.reorder",
  },
  orders: {
    list: "orders.list",
    create: "orders.create",
    detail: "orders.detail",
    update: "orders.update",
    delete: "orders.delete",
    advance: "orders.advance",
    revert: "orders.revert",
  },
  expenses: {
    list: "expenses.list",
    create: "expenses.create",
    update: "expenses.update",
    delete: "expenses.delete",
  },
  dashboard: {
    stats: "dashboard.stats",
  },
  attendance: {
    list: "attendance.list",
    detail: "attendance.detail",
    create: "attendance.create",
    edit: "attendance.edit",
    qr: "attendance.qr",
    scan: "attendance.scan",
  },
  schedule: {
    view: "schedule.view",
    manage: "schedule.manage",
  },
  leave: {
    list: "leave.list",
    create: "leave.create",
    approve: "leave.approve",
    reject: "leave.reject",
  },
  payroll: {
    preview: "payroll.preview",
    detail: "payroll.detail",
    lock: "payroll.lock",
    unlock: "payroll.unlock",
  },
  ai: {
    menu_analyze: "ai.menu_analyze",
    menu_generate: "ai.menu_generate",
    expense_analyze: "ai.expense_analyze",
    expense_generate: "ai.expense_generate",
  },
} as const;

export type PermissionCode = string;
