import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Sidebar
    home: 'Home',
    orders: 'Orders',
    inventory: 'Inventory',
    employees: 'Employees',
    transactions: 'Transactions',
    salary: 'Salary',
    profile: 'Profile',
    logout: 'Logout',
    welcome: 'Welcome',
    admin: 'Admin',
    employee: 'Employee',

    // Language toggle
    language: 'Language',
    english: 'English',
    gujarati: 'ગુજરાતી',

    // Dashboard - Admin
    toReceive: 'TO RECEIVE (RECEIVABLE)',
    toPay: 'TO PAY (PAYABLE)',
    pendingOrders: 'PENDING ORDERS',
    netBalance: 'NET BALANCE',
    receivedPayments: 'received payments →',
    pendingPayments: 'pending payments →',
    delivered: 'delivered →',
    receivableMinusPayable: 'Receivable − Payable →',
    paymentsToReceive: 'Payments to Receive',
    paymentsToMake: 'Payments to Make',
    pendingOrdersProduction: 'Pending Orders – Production Status',
    viewAllOrders: 'View All Orders →',
    orderId: 'Order ID',
    customer: 'Customer',
    product: 'Product',
    qty: 'Qty',
    dueDate: 'Due Date',
    progress: 'Progress',
    status: 'Status',
    sell: 'Sell →',
    overdue: 'OVERDUE',
    upcoming: 'UPCOMING',

    // Dashboard - Employee
    todaysSales: "TODAY'S SALES",
    lowStockItems: 'LOW STOCK ITEMS',
    recentTransactions: 'RECENT TRANSACTIONS',
    itemsSold: 'items sold →',
    needsRestock: 'Needs restock →',
    latestActivity: 'Latest activity →',
    lowStockAlerts: 'Low Stock Alerts',
    productId: 'Product ID',
    productName: 'Product Name',
    stockLevel: 'Stock Level',
    noLowStock: 'No low stock items',
    todaysTransactions: "Today's Transactions",
    txId: 'Tx ID',
    type: 'Type',
    party: 'Party',
    amount: 'Amount',
    noTransactionsToday: 'No transactions today',
    units: 'units',

    // Orders
    ordersManagement: 'Orders Management',
    createNewOrder: '+ Create New Order',
    searchOrders: 'Search orders...',
    all: 'All',
    pending: 'Pending',
    inProduction: 'In Production',
    ready: 'Ready',
    price: 'Price',
    production: 'Production',
    actions: 'Actions',
    view: 'View',
    edit: 'Edit',
    del: 'Del',
    dispatch: 'Dispatch',
    orderDetails: 'Order Details',
    email: 'Email',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    totalAmount: 'Total Amount',
    close: 'Close',
    newOrder: 'New Order',
    editOrder: 'Edit Order',
    orderIdAuto: 'Order ID (Auto)',
    customerName: 'Customer Name',
    productIdLabel: 'Product ID',
    saveOrder: 'Save Order',
    cancel: 'Cancel',
    na: 'N/A',

    // Inventory
    inventoryManagement: 'Inventory Management',
    addNewProduct: '+ Add New Product',
    searchInventory: 'Search by name or RI ID...',
    currentStock: 'Current Stock',
    productionStages: 'Production Stages',
    overallProgress: 'Overall Progress',
    productInfo: 'Product Info',
    name: 'Name',
    stockLevelLabel: 'Stock Level',
    productionTracking: 'Production Tracking',
    done: 'Done',
    pendingLabel: 'Pending',
    casting: 'Casting',
    goldPlating: 'Gold Plating',
    packaging: 'Packaging',
    noProducts: 'No products available.',
    low: '(Low)',
    saveChanges: 'Save Changes',
    createProduct: 'Create Product',
    productIdAuto: 'PRODUCT ID (Auto)',
    stock: 'STOCK',
    productionStagesLabel: 'PRODUCTION STAGES',
    editProductLabel: 'Edit Product',
    addNewProductLabel: 'Add New Product',

    // Transactions
    buy: 'Buy',
    history: 'History',
    duePayments: 'Due Payments',
    newPurchase: 'New Purchase (Buy)',
    newSale: 'New Sale (Sell)',
    transactionRecords: 'Transaction Records',
    searchHistory: 'Search history...',
    transactionIdAuto: 'Transaction ID (Auto)',
    fromSupplier: 'From (Supplier Name)',
    paymentMethod: 'Payment Method',
    date: 'Date',
    unitPriceLabel: 'Unit Price (₹)',
    totalAmountLabel: 'Total Amount (₹)',
    completePurchase: 'Complete Purchase',
    toCustomer: 'To (Customer Name)',
    sellingPrice: 'Selling Price (₹)',
    completeSale: 'Complete Sale',
    productIdCol: 'Product (ID)',
    totalAmountCol: 'Total Amount',
    noPendingPayments: 'No pending payments.',
    payNow: 'Pay Now',
    markReceived: 'Mark Received',
    editRecord: 'Edit Record',
    partyName: 'Party Name',
    update: 'Update',
    cash: 'Cash',
    upi: 'UPI',
    bankTransfer: 'Bank Transfer',
    description: 'Description',
    action: 'Action',
    bill: 'Bill',

    // Salary
    advanceSalaryRequests: 'Advance Salary Requests',
    pendingRequests: 'Pending Requests',
    employee: 'Employee',
    reasonDescription: 'Reason (Description)',
    noPendingRequests: 'No pending requests.',
    mySalaryAdvances: 'My Salary & Advances',
    requestAdvance: '+ Request Advance',
    myPaymentHistory: 'My Payment History',
    noPaymentHistory: 'No payment history found.',
    requestAdvanceSalary: 'Request Advance Salary',
    amountRs: 'Amount (₹)',
    reasonNote: 'Reason / Note',
    submitRequest: 'Submit Request',
    advanceRequested: 'Advance requested successfully.',
    approveAdvance: 'Approve advance request of',
    for: 'for',

    // Employees page
    employeeList: 'Employee List',
    addEmployee: '+ Add Employee',
    searchEmployees: 'Search employees...',
    employeeName: 'Employee Name',
    role: 'Role',
    employeeDetails: 'Employee Details',
    paySalary: 'Pay Salary',

    // Profile
    myProfile: 'My Profile',
    editProfile: 'Edit Profile',
    changePassword: 'Change Password',

    // Common statuses
    paid: 'Paid',
    received: 'Received',
    cancelled: 'Cancelled',
    delivered2: 'Delivered',
    advance: 'Advance',
  },

  gu: {
    // Sidebar
    home: 'હોમ',
    orders: 'ઓર્ડર',
    inventory: 'ઇન્વેન્ટરી',
    employees: 'કર્મચારીઓ',
    transactions: 'વ્યવહારો',
    salary: 'પગાર',
    profile: 'પ્રોફાઇલ',
    logout: 'લૉગ આઉટ',
    welcome: 'સ્વાગત',
    admin: 'એડમિન',
    employee: 'કર્મચારી',

    // Language toggle
    language: 'ભાષા',
    english: 'English',
    gujarati: 'ગુજરાતી',

    // Dashboard - Admin
    toReceive: 'મેળવવાનું (પ્રાપ્ય)',
    toPay: 'ચૂકવવાનું (દેણ)',
    pendingOrders: 'બાકી ઓર્ડર',
    netBalance: 'ચોખ્ખું બૅલેન્સ',
    receivedPayments: 'મળેલ ચૂકવણીઓ →',
    pendingPayments: 'બાકી ચૂકવણીઓ →',
    delivered: 'ડિલિવર થઈ →',
    receivableMinusPayable: 'પ્રાપ્ય − દેણ →',
    paymentsToReceive: 'મળવાના ચૂકવણી',
    paymentsToMake: 'કરવાના ચૂકવણી',
    pendingOrdersProduction: 'બાકી ઓર્ડર – ઉત્પાદન સ્થિતિ',
    viewAllOrders: 'બધા ઓર્ડર જુઓ →',
    orderId: 'ઓર્ડર ID',
    customer: 'ગ્રાહક',
    product: 'ઉત્પાદન',
    qty: 'જથ્થો',
    dueDate: 'નિયત તારીખ',
    progress: 'પ્રગતિ',
    status: 'સ્થિતિ',
    sell: 'વેચ →',
    overdue: 'મોડું',
    upcoming: 'આગામી',

    // Dashboard - Employee
    todaysSales: 'આજની વેચાણ',
    lowStockItems: 'ઓછો સ્ટૉક',
    recentTransactions: 'તાજા વ્યવહારો',
    itemsSold: 'વસ્તુઓ વેચાઈ →',
    needsRestock: 'નવો સ્ટૉક જોઈએ →',
    latestActivity: 'છેલ્લી પ્રવૃત્તિ →',
    lowStockAlerts: 'ઓછા સ્ટૉક ચેતવણી',
    productId: 'ઉત્પાદન ID',
    productName: 'ઉત્પાદનનું નામ',
    stockLevel: 'સ્ટૉક સ્તર',
    noLowStock: 'કોઈ ઓછો સ્ટૉક નથી',
    todaysTransactions: 'આજના વ્યવહારો',
    txId: 'Tx ID',
    type: 'પ્રકાર',
    party: 'પક્ષ',
    amount: 'રકમ',
    noTransactionsToday: 'આજે કોઈ વ્યવહાર નથી',
    units: 'એકમો',

    // Orders
    ordersManagement: 'ઓર્ડર વ્યવસ્થાપન',
    createNewOrder: '+ નવો ઓર્ડર',
    searchOrders: 'ઓર્ડર શોધો...',
    all: 'બધા',
    pending: 'બાકી',
    inProduction: 'ઉત્પાદનમાં',
    ready: 'તૈયાર',
    price: 'ભાવ',
    production: 'ઉત્પાદન',
    actions: 'ક્રિયાઓ',
    view: 'જુઓ',
    edit: 'ફેરફાર',
    del: 'ડિલીટ',
    dispatch: 'મોકલો',
    orderDetails: 'ઓર્ડર વિગતો',
    email: 'ઈ-મેઇલ',
    quantity: 'જથ્થો',
    unitPrice: 'એકમ ભાવ',
    totalAmount: 'કુલ રકમ',
    close: 'બંધ',
    newOrder: 'નવો ઓર્ડર',
    editOrder: 'ઓર્ડર ફેરફાર',
    orderIdAuto: 'ઓર્ડર ID (આપોઆપ)',
    customerName: 'ગ્રાહકનું નામ',
    productIdLabel: 'ઉત્પાદન ID',
    saveOrder: 'ઓર્ડર સેવ કરો',
    cancel: 'રદ',
    na: 'ઉ/ન',

    // Inventory
    inventoryManagement: 'ઇન્વેન્ટરી વ્યવસ્થાપન',
    addNewProduct: '+ નવી ચીજ ઉમેરો',
    searchInventory: 'નામ અથવા ID થી શોધો...',
    currentStock: 'હાલ સ્ટૉક',
    productionStages: 'ઉત્પાદન તબક્કાઓ',
    overallProgress: 'એકંદર પ્રગતિ',
    productInfo: 'ઉત્પાદ માહિતી',
    name: 'નામ',
    stockLevelLabel: 'સ્ટૉક સ્તર',
    productionTracking: 'ઉત્પાદન ટ્રેકિંગ',
    done: 'થઈ ગયું',
    pendingLabel: 'બાકી',
    casting: 'કાસ્ટિંગ',
    goldPlating: 'સોના ચડાવ',
    packaging: 'પૅકેજિંગ',
    noProducts: 'કોઈ ઉત્પાદ ઉપલબ્ધ નથી.',
    low: '(ઓછો)',
    saveChanges: 'ફેરફાર સેવ',
    createProduct: 'ઉત્પાદ બનાવો',
    productIdAuto: 'ઉત્પાદ ID (આપોઆપ)',
    stock: 'સ્ટૉક',
    productionStagesLabel: 'ઉત્પાદન તબક્કા',
    editProductLabel: 'ઉત્પાદ ફેરફાર',
    addNewProductLabel: 'નવો ઉત્પાદ ઉમેરો',

    // Transactions
    buy: 'ખરીદી',
    history: 'ઇતિહાસ',
    duePayments: 'બાકી ચૂકવણી',
    newPurchase: 'નવી ખરીદી',
    newSale: 'નવું વેચાણ',
    transactionRecords: 'વ્યવહાર નોંધ',
    searchHistory: 'ઇતિહાસ શોધો...',
    transactionIdAuto: 'વ્યવહાર ID (આપોઆપ)',
    fromSupplier: 'પૂરવઠાદારનું નામ',
    paymentMethod: 'ચૂકવણી પ્રકાર',
    date: 'તારીખ',
    unitPriceLabel: 'એકમ ભાવ (₹)',
    totalAmountLabel: 'કુલ રકમ (₹)',
    completePurchase: 'ખરીદી પૂર્ણ',
    toCustomer: 'ગ્રાહકનું નામ',
    sellingPrice: 'વેચાણ ભાવ (₹)',
    completeSale: 'વેચાણ પૂર્ણ',
    productIdCol: 'ઉત્પાદ (ID)',
    totalAmountCol: 'કુલ રકમ',
    noPendingPayments: 'કોઈ બાકી ચૂકવણી નથી.',
    payNow: 'હવે ચૂકવો',
    markReceived: 'પ્રાપ્ત ચિહ્નિત',
    editRecord: 'નોંધ ફેરફાર',
    partyName: 'પક્ષ નામ',
    update: 'અપડેટ',
    cash: 'રોકડ',
    upi: 'UPI',
    bankTransfer: 'બૅન્ક ટ્રાન્સફર',
    description: 'વર્ણન',
    action: 'ક્રિયા',
    bill: 'બિલ',

    // Salary
    advanceSalaryRequests: 'છૂટ પગાર વિનંતી',
    pendingRequests: 'બાકી વિનંતીઓ',
    employee: 'કર્મચારી',
    reasonDescription: 'કારણ (વર્ણન)',
    noPendingRequests: 'કોઈ બાકી વિનંતી નથી.',
    mySalaryAdvances: 'મારો પગાર અને છૂટ',
    requestAdvance: '+ છૂટ માટે વિનંતી',
    myPaymentHistory: 'મારો ચૂકવણી ઇતિહાસ',
    noPaymentHistory: 'કોઈ ચૂકવણી ઇતિહાસ નથી.',
    requestAdvanceSalary: 'છૂટ પગારની વિનંતી',
    amountRs: 'રકમ (₹)',
    reasonNote: 'કારણ / નૉધ',
    submitRequest: 'વિનંતી સબમિટ',
    advanceRequested: 'છૂટ સફળ. )', 
    approveAdvance: '​​​​​​ ​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​',
    for: 'માટે',

    // Employees page
    employeeList: 'કર્મચારી સૂચિ',
    addEmployee: '+ કર્મચારી ઉમેરો',
    searchEmployees: 'કર્મચારી શોધો...',
    employeeName: 'કર્મચારીનું નામ',
    role: 'ભૂમિકા',
    employeeDetails: 'કર્મચારી વિગત',
    paySalary: 'પગાર આપો',

    // Profile
    myProfile: 'મારી પ્રોફાઇલ',
    editProfile: 'પ્રોફાઇલ ફેરફાર',
    changePassword: 'પાસવર્ડ બદલો',

    // Common statuses
    paid: 'ચૂકવ્યું',
    received: 'મળ્યું',
    cancelled: 'રદ',
    delivered2: 'ડિલિવર',
    advance: 'છૂટ',
  },
};

const GU_DIGITS = ['૦','૧','૨','૩','૪','૫','૬','૭','૮','૯'];

function toGujaratiNum(str) {
  return String(str).replace(/[0-9]/g, d => GU_DIGITS[Number(d)]);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('ri_lang') || 'en');

  function toggleLanguage() {
    const newLang = lang === 'en' ? 'gu' : 'en';
    setLang(newLang);
    localStorage.setItem('ri_lang', newLang);
  }

  const t = translations[lang];

  // g() converts numbers/digits to Gujarati when lang=gu, otherwise returns as-is
  function g(val) {
    if (val === null || val === undefined) return '';
    if (lang === 'gu') return toGujaratiNum(val);
    return String(val);
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t, g }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
