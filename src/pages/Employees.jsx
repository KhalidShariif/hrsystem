import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import { fetchWithAuth } from '../utils/api';
import {
  Users,
  UserCheck,
  CalendarDays,
  Building2,
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { DISTRICT_MAP, CITIES } from '../utils/constants';

import { PageHeader, StatCard, ActionButton, TYPOGRAPHY, UI_CLASSES } from '../components/ui/DesignSystem';

const Employees = ({ isHR = false }) => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [todaysAttendance, setTodaysAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaves, setLeaves] = useState([]);

  const loadEmployees = async (city = 'all', district = 'all', dept = 'all', search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (city !== 'all') params.append('city', city);
      if (district !== 'all') params.append('district', district);
      if (dept !== 'all') params.append('department', dept);
      if (search) params.append('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';

      const [empData, attData, leaveData, allEmpData] = await Promise.all([
        fetchWithAuth(`/employees${query}`),
        fetchWithAuth('/attendance?date=today').catch(() => []),
        fetchWithAuth('/leaves').catch(() => []),
        fetchWithAuth('/employees') // always fetch all for stats
      ]);
      setEmployees(Array.isArray(empData) ? empData : []);
      setAllEmployees(Array.isArray(allEmpData) ? allEmpData : []);
      setLeaves(Array.isArray(leaveData) ? leaveData : []);

      const attendedEmpIds = (Array.isArray(attData) ? attData : []).map(
        a => a.employee?._id || a.employee
      );
      setTodaysAttendance(attendedEmpIds);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadEmployees(cityFilter, districtFilter, deptFilter, searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [cityFilter, districtFilter, deptFilter, searchQuery]);

  const basePath = isHR ? '/hr' : '/admin';

  const handleDeleteClick = (e, emp) => {
    e.stopPropagation();
    setSelectedEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await fetchWithAuth(`/employees/${selectedEmployee._id}`, { method: 'DELETE' });
      await loadEmployees();
    } catch (error) {
      console.error('Failed to delete employee', error);
    }
    setIsDeleteModalOpen(false);
  };

  const navigateToAttendance = (e, emp) => {
    e.stopPropagation();
    navigate(`${basePath}/attendance?employeeId=${emp._id}`);
  };

  const exportToExcel = () => {
    if (employees.length === 0) return;
    const exportData = employees.map(e => ({
      'Employee ID': e.employeeId,
      'Full Name': `${e.firstName} ${e.lastName}`,
      'Department': e.department?.name || 'N/A',
      'Position': e.position,
      'City': e.city,
      'Email': e.email,
      'Salary': e.salary || 'N/A',
      'Joined Date': e.joinedDate ? new Date(e.joinedDate).toLocaleDateString() : 'N/A',
      'Status': e.status || 'Active'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Directory');
    XLSX.writeFile(wb, `employees-report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totalForce = allEmployees.length;
  const activeCount = allEmployees.filter(e => e.status !== 'inactive').length;
  const onLeaveCount = allEmployees.filter(emp =>
    leaves.some(l => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      const empId = l.employee?._id || l.employee;
      return empId === emp._id && l.status === 'approved' && today >= start && today <= end;
    })
  ).length;
  const officeCount = [...new Set(allEmployees.map(e => e.city).filter(Boolean))].length || 2;

  const statsList = [
    { label: 'Total Force', value: totalForce, icon: Users, sub: 'Employees', color: 'bg-primary/10 text-primary' },
    { label: 'Active', value: activeCount, icon: CheckCircle2, sub: 'Working Now', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'On Leave', value: onLeaveCount, icon: Calendar, sub: 'Approved', color: 'bg-amber-50 text-amber-600' },
    { label: 'Branches', value: officeCount, icon: Building2, sub: 'Locations', color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <>
      <PageHeader 
        title="Employees" 
        subtitle="Personnel Directory & Management"
        actions={
          <>
            <ActionButton variant="secondary" icon={Printer} onClick={() => window.print()}>Print</ActionButton>
            <ActionButton icon={Plus} onClick={() => navigate(`${basePath}/employees/add`)}>New Employee</ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10 px-1">
        {statsList.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.label}
            value={stat.value}
            subValue={stat.sub}
            icon={stat.icon}
            colorClass={stat.color}
          />
        ))}
      </div>

      <div className={UI_CLASSES.CARD + " mb-10 flex flex-col gap-6 no-print mx-1"}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">
          <div className="relative flex-1 group w-full min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform duration-200 stroke-[3]" size={18} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={UI_CLASSES.INPUT + " pl-12 font-semibold"}
            />
          </div>
          <div className="grid grid-cols-2 lg:flex items-center gap-2 w-full lg:w-auto">
            <div className="relative bg-surface-container-low rounded-xl px-4 py-2.5 border border-surface-container group">
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="appearance-none w-full bg-transparent border-none text-[10px] font-black text-primary uppercase tracking-widest focus:ring-0 cursor-pointer pr-8 min-w-[120px]"
              >
                <option value="all">Depts</option>
                {[...new Set(allEmployees.map(e => e.department?.name).filter(Boolean))].map(d => (
                   <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary -rotate-90 stroke-[4]" size={12} />
            </div>
            <div className="relative bg-surface-container-low rounded-xl px-4 py-2.5 border border-surface-container group">
              <select
                value={cityFilter}
                onChange={e => {
                  setCityFilter(e.target.value);
                  setDistrictFilter('all');
                }}
                className="appearance-none w-full bg-transparent border-none text-[10px] font-black text-primary uppercase tracking-widest focus:ring-0 cursor-pointer pr-8 min-w-[120px]"
              >
                <option value="all">Cities</option>
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary stroke-[3]" size={12} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full">
          <ActionButton icon={Filter} variant="secondary" onClick={() => setIsFilterModalOpen(true)}>Filters</ActionButton>
          <ActionButton icon={Download} variant="secondary" onClick={exportToExcel}>Export</ActionButton>
        </div>
      </div>

        <div id="print-area-employees" className="print-area">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-surface-container">
                  <th className={"px-8 py-5 " + TYPOGRAPHY.TABLE_HEADER}>Employee ID</th>
                  <th className={"px-8 py-5 " + TYPOGRAPHY.TABLE_HEADER}>Full Name</th>
                  <th className={"px-8 py-5 " + TYPOGRAPHY.TABLE_HEADER}>Department</th>
                  <th className={"px-8 py-5 " + TYPOGRAPHY.TABLE_HEADER + " text-right no-print"}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-10 text-on-surface-variant font-bold text-xs">Loading employees...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-on-surface-variant font-bold text-xs uppercase tracking-widest opacity-50">
                    {cityFilter !== 'all' ? `No employees found in ${cityFilter}` : 'No employees found'}
                  </td></tr>
                ) : employees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer"
                    onClick={() => navigate(`${basePath}/employees/${emp._id}`)}
                  >
                    <td className="px-8 py-6">
                      <span className="font-bold text-sm text-primary font-headline tracking-tight">{emp.employeeId}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-110 transition-transform shrink-0">
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-on-surface text-base leading-none truncate">{emp.firstName} {emp.lastName}</p>
                            {leaves.some(l => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const start = new Date(l.startDate);
                              const end = new Date(l.endDate);
                              const empId = l.employee?._id || l.employee;
                              return empId === emp._id && l.status === 'approved' && today >= start && today <= end;
                            }) && (
                                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-bold uppercase rounded-md tracking-widest ring-1 ring-amber-100 whitespace-nowrap">Leave</span>
                              )}
                          </div>
                          <p className={TYPOGRAPHY.SMALL + " uppercase tracking-widest mt-1.5 truncate"}>{emp.position} · {emp.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-md uppercase tracking-widest">{emp.department?.name || 'HQ'}</span>
                    </td>
                    <td className="px-8 py-6 text-right no-print">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!todaysAttendance.includes(emp._id)) navigateToAttendance(e, emp);
                          }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${todaysAttendance.includes(emp._id) ? 'bg-surface-container text-outline/40 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        >
                          <UserPlus size={16} className="stroke-[2.5]" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`${basePath}/employees/edit/${emp._id}`); }}
                          className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center hover:bg-primary/10 transition-all active:scale-90"
                        >
                          <Edit2 size={16} className="stroke-[2.5]" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, emp)}
                          className="w-10 h-10 rounded-xl bg-red-50 text-error flex items-center justify-center hover:bg-red-100 transition-all active:scale-90"
                        >
                          <Trash2 size={16} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-8 flex flex-col sm:flex-row items-center justify-between border-t border-surface-container no-print bg-surface-container-low/10 gap-4">
          <p className={TYPOGRAPHY.SMALL + " uppercase tracking-widest"}>
            Showing {employees.length} Employees
          </p>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-surface-container text-primary hover:bg-surface-container-low transition-all active:scale-90">
              <ChevronLeft size={18} className="stroke-[3]" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-surface-container text-primary text-xs font-bold hover:bg-surface-container-low">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-surface-container text-primary text-xs font-bold hover:bg-surface-container-low">3</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-surface-container text-primary hover:bg-surface-container-low transition-all active:scale-90">
              <ChevronRight size={18} className="stroke-[3]" />
            </button>
          </div>
        </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message={`Warning: You are about to delete the employee record for ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}. This action is permanent.`}
      />

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Search Filters"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={TYPOGRAPHY.SMALL + " uppercase tracking-widest ml-1"}>City</label>
              <select
                value={cityFilter}
                onChange={e => { setCityFilter(e.target.value); setDistrictFilter('all'); }}
                className={UI_CLASSES.INPUT + " font-bold"}
              >
                <option value="all">All Cities</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {cityFilter !== 'all' && (
              <div className="space-y-2">
                <label className={TYPOGRAPHY.SMALL + " uppercase tracking-widest ml-1"}>District</label>
                <select
                  value={districtFilter}
                  onChange={e => setDistrictFilter(e.target.value)}
                  className={UI_CLASSES.INPUT + " font-bold"}
                >
                  <option value="all">All Districts</option>
                  {(DISTRICT_MAP[cityFilter] || []).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
          </div>
          <ActionButton className="w-full" onClick={() => setIsFilterModalOpen(false)}>Apply Filters</ActionButton>
        </div>
      </Modal>
    </>
  );
};

export default Employees;
