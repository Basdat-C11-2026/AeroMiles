export default function MemberDashboardPage() {
  const user = {
    name: 'Member User',
    milesBalance: 123456,
    // ...other member-specific data
  };

  return (
    <div>
      <h1>Dashboard Member</h1>
      <p>Selamat datang, {user.name}!</p>
      <p>Total Miles: {user.milesBalance.toLocaleString()}</p>
      {/* Tambahkan komponen dan data member lainnya di sini */}
    </div>
  );
}
