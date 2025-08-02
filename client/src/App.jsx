import React, { useState, useEffect } from 'react';
import axios from 'axios';
import caseTypes from './config/config';
import Select from 'react-select';

function App() {
  const [formData, setFormData] = useState({
    caseType: '',
    caseNumber: '',
    filingYear: '',
    captchaInput: ''
  });

  const [captchaCode, setCaptchaCode] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const paginatedOrders = caseData?.orders
    ? caseData.orders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : [];

  const totalPages = caseData?.orders?.length
    ? Math.ceil(caseData.orders.length / rowsPerPage)
    : 0;

  const fetchCaptcha = () => {
    setCaptchaCode(null);
    axios.get('http://localhost:3000/api/get-captcha')
      .then(res => setCaptchaCode(res.data.captcha))
      .catch(() => setError('Failed to load CAPTCHA'));
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCaptchaCode(null);
    try {
      const res = await axios.post('http://localhost:3000/api/fetch-case', { ...formData });
      setCaseData(res.data);
    } catch (error) {
      setError(error.response?.data?.error || 'An unexpected error occurred. Please try again.');
    } finally {
      fetchCaptcha();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">📄 Court Data Fetcher</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <Select
        name="caseType"
        value={formData.caseType ? { value: formData.caseType, label: formData.caseType } : null}
        onChange={(selected) =>
          setFormData((prev) => ({ ...prev, caseType: selected?.value || '' }))
        }
        options={caseTypes.map((type) => ({ value: type, label: type }))}
        placeholder="Select Case Type"
        className="text-sm z-50"
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: '#ffffff',
            borderColor: '#d1d5db', // Tailwind gray-300
            color: '#000000',
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: '#ffffff',
            zIndex: 9999,
          }),
          singleValue: (base) => ({
            ...base,
            color: '#000000',
          }),
          option: (base, { isFocused }) => ({
            ...base,
            backgroundColor: isFocused ? '#f3f4f6' : '#ffffff', // Tailwind gray-100
            color: '#000000',
          }),
          placeholder: (base) => ({
            ...base,
            color: '#6b7280', // Tailwind gray-500
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        menuPortalTarget={document.body}
        isSearchable
      />

        <input
          name="caseNumber"
          placeholder="Case Number"
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          name="filingYear"
          placeholder="Filing Year"
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {captchaCode ? (
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Enter CAPTCHA: <span className="font-bold text-black">{captchaCode}</span>
            </label>
            <input
              name="captchaInput"
              placeholder="Enter CAPTCHA"
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ) : (
          <div className="text-gray-600 italic">🔄 Loading CAPTCHA...</div>
        )}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
          🔍 Fetch Case
        </button>
      </form>

      {error && <p className="text-red-600 mt-4 text-center font-semibold">{error}</p>}

      {caseData && (
        <div className="mt-8 bg-white p-6 rounded shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-2 text-blue-700">📘 Case Overview</h2>
          <ul className="space-y-1 text-gray-800">
            <li><strong>Title:</strong> {caseData.title}</li>
            <li><strong>Status:</strong> {caseData.status === 'P' ? 'Pending' : caseData.status}</li>
            <li><strong>History:</strong> <a href={caseData.historyLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">View History</a></li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-blue-700">📂 Metadata</h3>
          <ul className="space-y-1 text-gray-800">
            <li><strong>Petitioner:</strong> {caseData.metadata.petitioner}</li>
            <li><strong>Respondent:</strong> {caseData.metadata.respondent}</li>
            <li><strong>Filing Date:</strong> {caseData.metadata.filingDate}</li>
            <li><strong>Next Hearing:</strong> {caseData.metadata.nextHearing}</li>
            <li><strong>Latest Order:</strong> {caseData.orders?.length > 0 ? (
              <a href={caseData.orders[0].url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download</a>
            ) : (
              <span className="text-gray-500 italic">No orders available.</span>
            )}</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-blue-700">🗂️ All Orders</h3>

          {caseData.orders?.length === 0 ? (
            <p className="text-gray-500 italic">No orders available for this case.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border border-gray-300 rounded-md">
                  <thead className="bg-blue-100 text-blue-900">
                    <tr>
                      <th className="border p-2 text-left">Sr. No.</th>
                      <th className="border p-2 text-left">Case No / Order Link</th>
                      <th className="border p-2 text-left">Date of Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order, index) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="border p-2">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                        <td className="border p-2">
                          <a href={order.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {order.title}
                          </a>
                        </td>
                        <td className="border p-2">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="mt-4 flex justify-between items-center text-sm">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                >
                  ⬅️ Previous
                </button>
                <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                >
                  Next ➡️
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
