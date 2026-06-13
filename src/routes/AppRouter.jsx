import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HRLayout from '../layouts/HRLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import Employees from '../pages/Employees';
import Departments from '../pages/Departments';
import Attendance from '../pages/Attendance';
import Payroll from '../pages/Payroll';
import PayrollDetails from '../pages/PayrollDetails';
import Settings from '../pages/Settings';
import HRManagers from '../pages/HRManagers';
import LeaveManagement from '../pages/LeaveManagement';
import Recruitment from '../pages/Recruitment';
import Reports from '../pages/Reports';
import AddEmployee from '../pages/AddEmployee';
import EmployeeDetails from '../pages/EmployeeDetails';
import PostJob from '../pages/PostJob';
import Careers from '../pages/Careers';
import CandidateDetails from '../pages/CandidateDetails';
import EmployeeLayout from '../layouts/EmployeeLayout';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import EmployeeProfile from '../pages/EmployeeProfile';
import EmployeeAttendance from '../pages/EmployeeAttendance';
import EmployeeEvents from '../pages/EmployeeEvents';
import EmployeeSettings from '../pages/EmployeeSettings';
import Announcements from '../pages/Announcements';
import ConductReports from '../pages/ConductReports';
import ConductReportDetails from '../pages/ConductReportDetails';

import ProtectedRoute from '../components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/careers',
    element: <Careers />,
  },
  {
    path: '/careers/apply/:jobId',
    element: <Careers />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'hr-managers', element: <HRManagers /> },
      { path: 'employees', element: <Employees /> },
      { path: 'employees/add', element: <AddEmployee /> },
      { path: 'employees/:id', element: <EmployeeDetails /> },
      { path: 'employees/edit/:id', element: <AddEmployee isEdit={true} /> },
      { path: 'departments', element: <Departments /> },
      { path: 'attendance', element: <Attendance /> },
      { path: 'leave-management', element: <LeaveManagement /> },
      { path: 'payroll', element: <Payroll /> },
      { path: 'payroll/:id', element: <PayrollDetails /> },
      { path: 'recruitment', element: <Recruitment /> },
      { path: 'recruitment/candidates/:id', element: <CandidateDetails /> },
      { path: 'recruitment/post-job', element: <PostJob /> },
      { path: 'reports', element: <Reports /> },
      { path: 'conduct-reports', element: <ConductReports /> },
      { path: 'conduct-reports/:id', element: <ConductReportDetails /> },
      { path: 'announcements', element: <Announcements /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '/hr',
    element: (
      <ProtectedRoute allowedRoles={['hr_manager', 'admin']}>
        <HRLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/hr/employees" replace /> },
      { path: 'employees', element: <Employees isHR={true} /> },
      { path: 'employees/add', element: <AddEmployee isHR={true} /> },
      { path: 'employees/:id', element: <EmployeeDetails isHR={true} /> },
      { path: 'employees/edit/:id', element: <AddEmployee isEdit={true} isHR={true} /> },
      { path: 'departments', element: <Departments isHR={true} /> },
      { path: 'attendance', element: <Attendance isHR={true} /> },
      { path: 'leave-management', element: <LeaveManagement isHR={true} /> },
      { path: 'recruitment', element: <Recruitment isHR={true} /> },
      { path: 'recruitment/candidates/:id', element: <CandidateDetails isHR={true} /> },
      { path: 'recruitment/post-job', element: <PostJob isHR={true} /> },
      { path: 'announcements', element: <Announcements isHR={true} /> },
      { path: 'settings', element: <Settings isHR={true} /> },
    ],
  },
  {
    path: '/employee',
    element: (
      <ProtectedRoute allowedRoles={['employee']}>
        <EmployeeLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/employee/dashboard" replace /> },
      { path: 'dashboard', element: <EmployeeDashboard /> },
      { path: 'profile', element: <EmployeeProfile /> },
      { path: 'attendance', element: <EmployeeAttendance /> },
      { path: 'events', element: <EmployeeEvents /> },
      { path: 'settings', element: <EmployeeSettings /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
