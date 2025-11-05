import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Registration {
  _id: string;
  name: string;
  phone: string;
  userType: string;
  institutionName?: string;
  municipality?: string;
  wardNumber?: string;
  quantity: number;
  totalAmount: number;
  date: string;
  screenshot?: string;
}

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Your backend URL (Render web service)
  const API_BASE = "https://donation-qismat.onrender.com";

  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/registrations`);
      setRegistrations(res.data);
    } catch (err) {
      console.error("❌ Error fetching registrations:", err);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Filtered results
  const filtered = registrations.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.institutionName?.toLowerCase().includes(search.toLowerCase()) ||
      r.municipality?.toLowerCase().includes(search.toLowerCase())
  );

  // Export to Excel
  const exportToExcel = () => {
    if (registrations.length === 0) {
      alert("No data available to export!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      registrations.map((r, i) => ({
        S_No: i + 1,
        Name: r.name,
        Phone: r.phone,
        UserType: r.userType,
        Institution: r.institutionName || "-",
        Municipality: r.municipality || "-",
        Ward: r.wardNumber || "-",
        Quantity: r.quantity,
        Amount: r.totalAmount,
        Date: new Date(r.date).toLocaleString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `Qismat_Registrations_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    window.location.href = "/admin-login";
  };

  // Delete record
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE}/registrations/${id}`);
      console.log("✅ Deleted:", response.data);
      alert("Deleted successfully!");
      fetchRegistrations();
    } catch (err: any) {
      console.error("❌ Error deleting record:", err.response?.data || err.message);
      alert("Failed to delete record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard — Qismat Registrations</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow"
        >
          Logout
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name, phone, or institution..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-2/3 border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow"
        >
          📤 Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto border rounded-xl shadow-md">
        <table className="min-w-full border-collapse bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">#</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Institution / Municipality</th>
              <th className="p-3 border">Ward</th>
              <th className="p-3 border">Qty</th>
              <th className="p-3 border">Amount (₹)</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Screenshot</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, i) => (
              <tr key={r._id} className="hover:bg-gray-50 transition">
                <td className="p-3 border text-center">{i + 1}</td>
                <td className="p-3 border">{r.name}</td>
                <td className="p-3 border">{r.phone}</td>
                <td className="p-3 border">{r.userType}</td>
                <td className="p-3 border">
                  {r.userType === "student" ? r.institutionName : r.municipality}
                </td>
                <td className="p-3 border text-center">{r.wardNumber || "-"}</td>
                <td className="p-3 border text-center">{r.quantity}</td>
                <td className="p-3 border text-center font-semibold text-green-600">
                  ₹{r.totalAmount}
                </td>
                <td className="p-3 border text-sm text-gray-500">
                  {new Date(r.date).toLocaleString()}
                </td>
                <td className="p-3 text-center">
                  {r.screenshot ? (
                    <a
                      href={`${API_BASE}${r.screenshot}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={r.screenshot}
                        alt="Payment Screenshot"
                        className="w-20 h-20 object-cover rounded-lg border mx-auto"
                      />
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">No image</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-6">No registrations found.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
