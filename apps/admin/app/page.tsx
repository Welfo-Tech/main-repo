import AdminLayout from "../components/layout/AdminLayout";
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/login");
}
// export default function DashboardPage() {
//   return (
//     <AdminLayout>
//       <h1>Dashboard</h1>
//       <p>Welcome to Welfo Admin</p>
//     </AdminLayout>
//   );
// }
