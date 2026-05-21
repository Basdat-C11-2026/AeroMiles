export default function StaffDashboardPage() {
  const user = {
    name: 'Staff User',
    // ...other staff-specific data
  };

  return (
    <div>
      <h1>Dashboard Staf</h1>
      <p>Selamat datang, {user.name}!</p>
      {/* Tambahkan komponen dan data staf lainnya di sini */}
    </div>
  );
}
