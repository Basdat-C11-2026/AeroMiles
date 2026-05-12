"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const NavbarStaff: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const menuItems = (
    <>
      <li><Link href="/staff/dashboard">Dashboard</Link></li>
      <li><Link href="/staff/members">Kelola Member</Link></li>
      <li><Link href="/staff/claims">Kelola Klaim</Link></li>
      <li><Link href="/staff/rewards">Kelola Hadiah & Penyedia</Link></li>
      <li><Link href="/staff/partners">Kelola Mitra</Link></li>
      <li><Link href="/staff/reports">Laporan Transaksi</Link></li>
    </>
  );

  return (
    <div className="navbar bg-neutral text-neutral-content shadow-sm px-4 lg:px-8">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 text-base-content rounded-box w-52">
            {menuItems}
          </ul>
        </div>
        <Link href="/staff/dashboard" className="btn btn-ghost text-xl font-bold">
          AeroMiles <span className="text-xs font-normal text-neutral-content/70 ml-1">Staff Portal</span>
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-medium text-sm">
          {menuItems}
        </ul>
      </div>

      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-secondary text-secondary-content flex items-center justify-center border-2 border-neutral-content/20">
              <span className="text-lg font-bold">S</span>
            </div>
          </label>
          <ul tabIndex={0} className="mt-3 z-1 p-2 shadow menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box w-52">
            <li><Link href="/profile">Pengaturan Profil</Link></li>
            <li><button onClick={handleLogout} className="text-error font-semibold">Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavbarStaff;