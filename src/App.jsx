import React, { createContext, useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminMasterPage from './Components/Admin/inc/AdminMasterPage'
import Login from './Components/Admin/Login';
import Dashboard from './Components/Admin/Dashboard'
import PleaseWait from './Components/comm/PleaseWait';
import Member from './Components/Admin/Member';
import Admin from './Components/Admin/Admin';
import Trainer from './Components/Admin/Trainer';
import Service from './Components/Admin/Service';
import Package from './Components/Admin/Package';
import Membershippackages from './Components/Admin/Membershippackages';
import UserMembership from './Components/Admin/UserMembership';
import AddUserMembership from './Pages/UserMembership/AddUserMembership';
import ExpiringMemberships from './Pages/UserMembership/ExpiringMemberships';
import Appointment from './Components/Admin/Appointment';
import AddAppointment from './Pages/Appointment/AddAppointment';
import Level from './Components/Admin/Level';
import EquipmentList from './Components/Admin/EquipmentList';
import FitnessGoal from './Components/Admin/FitnessGoal';
import InvoiceList from './Components/Admin/InvoiceList';
import PaymentList from './Components/Admin/PaymentList';
import SalesRegister from './Components/Admin/SalesRegister';
import CashReport from './Components/Admin/CashReport';
import GstReport from './Components/Admin/GstReport';
import Profile from './Pages/Admin/Profile';
import MemberDetails from './Pages/Member/MemberDetails';
import Inquiries from './Components/Admin/Inquiries';
export const rootContext = createContext();
export default function App() {
  const [loading, setLoading] = useState(false);
  return <>
    <rootContext.Provider value={[setLoading]} >
      <BrowserRouter>
        <Routes>
          <Route path='login' element={<Login />} />
          <Route path='/admin' element={<AdminMasterPage />}>
          <Route path='profile' element={<Profile />} />
            <Route path="Dashboard" element={<Dashboard />} />
            <Route path='inquires' element={<Inquiries />} />
            <Route path="Members" element={<Member />} />
            <Route path="member-details/:id" element={<MemberDetails />} />
            <Route path="admin" element={<Admin />} />
            <Route path="trainer" element={<Trainer />} />
            <Route path="appointment" element={<Appointment />} />
            <Route path="add-appointment" element={<AddAppointment />} />
            <Route path="Service" element={<Service />} />
            <Route path="Package" element={<Package />} />
            <Route path='membership-packages' element={<Membershippackages />} />
            <Route path='user-membership' element={<UserMembership />} />
            <Route path="AddUserMembership" element={<AddUserMembership />}/>
            <Route path='ExpiringMembership' element={<ExpiringMemberships />} />
            <Route path='level-list' element={<Level /> } />
            <Route path='equipment-list' element={<EquipmentList />} />
            <Route path='fitness-goal' element={<FitnessGoal />} />
            <Route path='invoices'element={<InvoiceList />} />
            <Route path='payments' element={<PaymentList />} />
            <Route path='sales-register' element={<SalesRegister />} />
            <Route path='cash-report' element={<CashReport />} />
            <Route path='gst-report' element={<GstReport />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <PleaseWait show={loading} />
    </rootContext.Provider>
  </>
}
