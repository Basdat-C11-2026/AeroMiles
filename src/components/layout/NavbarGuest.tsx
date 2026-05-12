import Link from 'next/link';
import React from 'react';

const NavbarGuest: React.FC = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm px-4 lg:px-8">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
          AeroMiles
        </Link>
      </div>
      <div className="flex-none hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-medium">
          <li><Link href="/login">Login</Link></li>
          <li>
            <details>
              <summary>Registrasi</summary>
              <ul className="p-2 bg-base-100 rounded-t-none z-10 shadow-lg">
                <li><Link href="/register/member">Sebagai Member</Link></li>
                <li><Link href="/register/staff">Sebagai Staf</Link></li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
      
      {/* Mobile Menu */}
      <div className="dropdown dropdown-end lg:hidden">
        <label tabIndex={0} className="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </label>
        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 rounded-box w-52">
          <li><Link href="/login">Login</Link></li>
          <li><Link href="/register/member">Registrasi Member</Link></li>
          <li><Link href="/register/staff">Registrasi Staf</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default NavbarGuest;