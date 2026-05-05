import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const DataContext = createContext(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}

/* ── helpers ─────────────────────────────────────────────── */
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ── Salon services ─────────────────────────────────────── */
export const SALON_SERVICES = [
  { id: 'haircut',        label: 'Hair Cut',            icon: '✂️'  },
  { id: 'beardcut',       label: 'Beard Cut',           icon: '🪒'  },
  { id: 'facial',         label: 'Facial',              icon: '💆'  },
  { id: 'detan',          label: 'Detan',               icon: '✨'  },
  { id: 'cleanup',        label: 'Clean Up',            icon: '🧴'  },
  { id: 'hairmassage',    label: 'Hair Massage',        icon: '💅'  },
  { id: 'hairwash',       label: 'Hair Wash',           icon: '🚿'  },
  { id: 'haircolor',      label: 'Hair Color',          icon: '🎨'  },
  { id: 'highlightcolor', label: 'Highlight Hair Color',icon: '🌈'  },
  { id: 'hairspa',        label: 'Hair Spa',            icon: '🛁'  },
  { id: 'manicure',       label: 'Manicure',            icon: '💅'  },
  { id: 'pedicure',       label: 'Pedicure',            icon: '🦶'  },
];

/* ── Initial data ─────────────────────────────────────── */
const INITIAL_INVENTORY = [
  { id: 'INV001', name: 'Wella Hair Shampoo',   category: 'Shampoo',   qty: 24, unit: 'bottle', price: 280, lowStock: 5  },
  { id: 'INV002', name: 'Gatsby Hair Gel',      category: 'Styling',   qty: 16, unit: 'tube',   price: 150, lowStock: 5  },
  { id: 'INV003', name: 'Schwarzkopf Color 4.0',category: 'Color',     qty: 8,  unit: 'tube',   price: 450, lowStock: 3  },
  { id: 'INV004', name: 'Beard Oil',            category: 'Beard',     qty: 12, unit: 'bottle', price: 320, lowStock: 4  },
  { id: 'INV005', name: 'Facial Kit',           category: 'Facial',    qty: 20, unit: 'pack',   price: 180, lowStock: 5  },
  { id: 'INV006', name: 'Hair Spa Cream',       category: 'Spa',       qty: 6,  unit: 'bottle', price: 550, lowStock: 3  },
  { id: 'INV007', name: 'Razor Blades (100pc)', category: 'Tools',     qty: 4,  unit: 'box',    price: 200, lowStock: 2  },
  { id: 'INV008', name: 'After Shave Lotion',   category: 'Beard',     qty: 10, unit: 'bottle', price: 160, lowStock: 4  },
];

const INITIAL_MEMBERS = [
  {
    id: 'MEM001',
    name: 'Rajesh Kumar',
    phone: '9876543210',
    months: 3,
    startDate: '2026-02-01',
    services: { haircut: 2, beardcut: 3, facial: 1, detan: 0, cleanup: 0, hairmassage: 0, hairwash: 2, haircolor: 0, highlightcolor: 0, hairspa: 0, manicure: 0, pedicure: 0 },
    amount: 1500,
    usageHistory: [],
  },
  {
    id: 'MEM002',
    name: 'Amit Patel',
    phone: '9123456789',
    months: 6,
    startDate: '2026-01-15',
    services: { haircut: 5, beardcut: 5, facial: 2, detan: 1, cleanup: 1, hairmassage: 3, hairwash: 5, haircolor: 0, highlightcolor: 0, hairspa: 1, manicure: 0, pedicure: 0 },
    amount: 3000,
    usageHistory: [],
  },
];

const INITIAL_SALES = [
  {
    id: 'SALE001',
    date: '2026-03-28T10:30:00',
    customer: 'Walk-in',
    items: [
      { name: 'Hair Cut', price: 100, qty: 1 },
      { name: 'Beard Cut', price: 80, qty: 1 },
    ],
    total: 180,
    note: '',
  },
  {
    id: 'SALE002',
    date: '2026-03-28T14:15:00',
    customer: 'Suresh Mehta',
    items: [
      { name: 'Facial', price: 400, qty: 1 },
      { name: 'Hair Wash', price: 80, qty: 1 },
    ],
    total: 480,
    note: 'Regular customer',
  },
  {
    id: 'SALE003',
    date: '2026-03-27T11:00:00',
    customer: 'Priya Sharma',
    items: [
      { name: 'Highlight Hair Color', price: 1200, qty: 1 },
      { name: 'Hair Spa', price: 600, qty: 1 },
    ],
    total: 1800,
    note: '',
  },
];

const INITIAL_APPOINTMENTS = [
  {
    id: 'APP001',
    customerName: 'Jayeshbhai',
    phone: '9876543210',
    services: 'Hair Cut, Beard Trim',
    employee: 'Rajesh',
    date: '2026-03-29',
    startTime: '22:00',
    endTime: '22:45',
    status: 'Scheduled', // Scheduled, Completed, Cancelled
  },
  {
    id: 'APP002',
    customerName: 'Suresh Kumar',
    phone: '9123456789',
    services: 'Facial, Hair Spa',
    employee: 'Amit',
    date: '2026-03-30',
    startTime: '10:00',
    endTime: '11:30',
    status: 'Scheduled',
  }
];

/* ── Provider ─────────────────────────────────────────── */
export function DataProvider({ children }) {
  const [inventory,  setInventoryState]  = useState([]);
  const [members,    setMembersState]    = useState([]);
  const [sales,      setSalesState]      = useState([]);
  const [appointments, setAppointmentsState] = useState([]);

  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState(null);

  const [loadingInventory, setLoadingInventory] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);

  const [loadingMembers, setLoadingMembers] = useState(true);
  const [memberError, setMemberError] = useState(null);

  const [loadingSales, setLoadingSales] = useState(true);
  const [saleError, setSaleError] = useState(null);

  /* fetch all from backend */
  useEffect(() => {
    const fetchAll = async () => {
      // Bookings
      try {
        setLoadingBookings(true);
        const res = await axios.get('http://localhost:5000/api/bookings');
        setAppointmentsState(res.data);
        setBookingError(null);
      } catch (err) {
        setBookingError(err.message);
        setAppointmentsState(load('wave_appointments', INITIAL_APPOINTMENTS));
      } finally {
        setLoadingBookings(false);
      }

      // Inventory
      try {
        setLoadingInventory(true);
        const res = await axios.get('http://localhost:5000/api/inventory');
        setInventoryState(res.data);
        setInventoryError(null);
      } catch (err) {
        setInventoryError(err.message);
        setInventoryState(load('wave_inventory', INITIAL_INVENTORY));
      } finally {
        setLoadingInventory(false);
      }

      // Members
      try {
        setLoadingMembers(true);
        const res = await axios.get('http://localhost:5000/api/members');
        setMembersState(res.data);
        setMemberError(null);
      } catch (err) {
        setMemberError(err.message);
        setMembersState(load('wave_members', INITIAL_MEMBERS));
      } finally {
        setLoadingMembers(false);
      }

      // Sales
      try {
        setLoadingSales(true);
        const res = await axios.get('http://localhost:5000/api/sales');
        setSalesState(res.data);
        setSaleError(null);
      } catch (err) {
        setSaleError(err.message);
        setSalesState(load('wave_sales', INITIAL_SALES));
      } finally {
        setLoadingSales(false);
      }
    };
    fetchAll();
  }, []);

  /* persist on change to localstorage (fallback cache) */
  useEffect(() => { if (!loadingInventory) save('wave_inventory', inventory); }, [inventory, loadingInventory]);
  useEffect(() => { if (!loadingMembers)   save('wave_members',   members);   }, [members, loadingMembers]);
  useEffect(() => { if (!loadingSales)     save('wave_sales',     sales);     }, [sales, loadingSales]);
  useEffect(() => { if (!loadingBookings)  save('wave_appointments', appointments); }, [appointments, loadingBookings]);

  /* ── inventory helpers ─────────────────────────── */
  async function addInventoryItem(item) {
    try {
      const res = await axios.post('http://localhost:5000/api/inventory', item);
      setInventoryState(prev => [res.data, ...prev]);
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      const newItem = { ...item, id: `INV${Date.now()}` };
      setInventoryState(prev => [newItem, ...prev]);
    }
  }
  async function updateInventoryItem(id, updates) {
    try {
      const res = await axios.put(`http://localhost:5000/api/inventory/${id}`, updates);
      setInventoryState(prev => prev.map(i => i.id === id ? res.data : i));
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      setInventoryState(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }
  }
  async function deleteInventoryItem(id) {
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${id}`);
      setInventoryState(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      setInventoryState(prev => prev.filter(i => i.id !== id));
    }
  }

  /* ── member helpers ────────────────────────────── */
  async function addMember(member) {
    try {
      const res = await axios.post('http://localhost:5000/api/members', member);
      setMembersState(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      const newMember = { ...member, id: `MEM${Date.now()}` };
      setMembersState(prev => [newMember, ...prev]);
      return newMember;
    }
  }
  async function updateMember(id, updates) {
    try {
      const res = await axios.put(`http://localhost:5000/api/members/${id}`, updates);
      setMembersState(prev => prev.map(m => m.id === id ? res.data : m));
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      setMembersState(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    }
  }
  async function deleteMember(id) {
    try {
      await axios.delete(`http://localhost:5000/api/members/${id}`);
      setMembersState(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      setMembersState(prev => prev.filter(m => m.id !== id));
    }
  }
  async function updateMemberService(id, serviceId, delta) {
    const member = members.find(m => m.id === id);
    if (!member) return;

    const current = member.services?.[serviceId] || 0;
    const updatedCount = Math.max(0, current + delta);
    
    let newUsageHistory = member.usageHistory || [];
    if (delta < 0 && current > 0) {
      newUsageHistory = [
        {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          serviceId,
          date: new Date().toISOString()
        },
        ...newUsageHistory
      ];
    }

    const updates = { 
      services: { ...member.services, [serviceId]: updatedCount },
      usageHistory: newUsageHistory
    };

    try {
      const res = await axios.put(`http://localhost:5000/api/members/${id}`, updates);
      setMembersState(prev => prev.map(m => m.id === id ? res.data : m));
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      setMembersState(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    }
  }

  /* ── sales helpers ─────────────────────────────── */
  async function addSale(sale) {
    try {
      const res = await axios.post('http://localhost:5000/api/sales', sale);
      setSalesState(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      const newSale = { ...sale, id: `SALE${Date.now()}` };
      setSalesState(prev => [newSale, ...prev]);
      return newSale;
    }
  }
  async function deleteSale(id) {
    try {
      await axios.delete(`http://localhost:5000/api/sales/${id}`);
      setSalesState(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      setSalesState(prev => prev.filter(s => s.id !== id));
    }
  }

  /* ── appointments helpers ──────────────────────── */
  async function addAppointment(appt) {
    try {
      const res = await axios.post('http://localhost:5000/api/bookings', appt);
      setAppointmentsState(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      const newAppt = { ...appt, id: `APP${Date.now()}` };
      setAppointmentsState(prev => [newAppt, ...prev]);
      return newAppt;
    }
  }
  async function updateAppointment(id, updates) {
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${id}`, updates);
      setAppointmentsState(prev => prev.map(a => a.id === id ? res.data : a));
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      setAppointmentsState(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    }
  }
  async function deleteAppointment(id) {
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`);
      setAppointmentsState(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.warn("Backend error (fallback to local): " + err.message);
      setAppointmentsState(prev => prev.filter(a => a.id !== id));
    }
  }

  return (
    <DataContext.Provider value={{
      inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, loadingInventory, inventoryError,
      members, addMember, updateMember, deleteMember, updateMemberService, loadingMembers, memberError,
      sales, addSale, deleteSale, loadingSales, saleError,
      appointments, addAppointment, updateAppointment, deleteAppointment, loadingBookings, bookingError,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export default DataContext;
