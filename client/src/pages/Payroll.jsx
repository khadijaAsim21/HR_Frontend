import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, FileText, Download, TrendingUp, Calculator } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const API_URL = 'http://localhost:3000/api/payroll';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showDeductionForm, setShowDeductionForm] = useState(false);
  const [showBonusForm, setShowBonusForm] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: '',
    pay_period_start: '',
    pay_period_end: '',
    payment_date: '',
    basic_salary: '',
    house_rent_allowance: '',
    transport_allowance: '',
    medical_allowance: '',
    other_allowances: '',
    working_days: 22,
    present_days: 22,
    absent_days: 0,
    leaves_taken: 0,
    overtime_hours: 0,
    overtime_pay: 0,
    currency: 'PKR',
    status: 'draft',
    payment_method: 'bank_transfer',
    bank_code: '',
    bank_account_number: '',
    notes: '',
    processed_by: 'HR Manager'
  });

  const [deductionForm, setDeductionForm] = useState({
    deduction_type: 'tax',
    description: '',
    amount: '',
    percentage: '',
    is_recurring: false
  });

  const [bonusForm, setBonusForm] = useState({
    bonus_type: 'performance',
    description: '',
    amount: '',
    is_recurring: false
  });

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    processed: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  // Currency helper
  const getCurrencySymbol = (currency) => {
    return currency === 'USD' ? '$' : 'Rs';
  };

  const formatCurrency = (amount, currency = 'PKR') => {
    const symbol = getCurrencySymbol(currency);
    const formattedAmount = parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return currency === 'USD' ? `${symbol}${formattedAmount}` : `${symbol} ${formattedAmount}`;
  };

  // Fetch payroll records
  const fetchPayrolls = async () => {
    console.log('🔄 FETCHING PAYROLLS...');
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL);
      console.log('📡 Fetch response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Fetched data:', data);
      
      if (data.success) {
        console.log(`✅ Found ${data.data.length} payroll records`);
        setPayrolls(data.data);
      } else {
        console.error('❌ Fetch failed:', data.message);
        setError(data.message);
      }
    } catch (err) {
      console.error('❌ FETCH ERROR:', err);
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/employees');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  // Fetch banks for dropdown
  const fetchBanks = async () => {
    try {
      console.log('🏦 Fetching banks...');
      const response = await fetch('http://localhost:3000/api/banks');
      const data = await response.json();
      console.log('🏦 Banks response:', data);
      if (data.success) {
        setBanks(data.data);
        console.log(`✅ Loaded ${data.data.length} banks`);
      }
    } catch (err) {
      console.error('❌ Error fetching banks:', err);
    }
  };

  // Fetch payroll details with deductions and bonuses
  const viewPayrollDetails = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedPayroll(data.data);
      }
    } catch (err) {
      setError('Error fetching payroll details: ' + err.message);
    }
  };

  // Calculate gross salary
  const calculateGross = () => {
    const basic = parseFloat(formData.basic_salary || 0);
    const hra = parseFloat(formData.house_rent_allowance || 0);
    const ta = parseFloat(formData.transport_allowance || 0);
    const ma = parseFloat(formData.medical_allowance || 0);
    const oa = parseFloat(formData.other_allowances || 0);
    const otp = parseFloat(formData.overtime_pay || 0);
    
    return basic + hra + ta + ma + oa + otp;
  };

  // Auto-fill salary from employee data
  const handleEmployeeSelect = (employeeId) => {
    console.log('👤 Employee selected:', employeeId);
    const employee = employees.find(e => e.id === parseInt(employeeId));
    if (employee) {
      console.log('✅ Found employee:', employee.name, '- Salary:', employee.salary);
      setFormData({
        ...formData,
        employee_id: parseInt(employeeId),
        basic_salary: employee.salary,
        house_rent_allowance: (employee.salary * 0.3).toFixed(2),
        transport_allowance: (employee.salary * 0.1).toFixed(2),
        medical_allowance: (employee.salary * 0.05).toFixed(2),
        other_allowances: 0
      });
    } else {
      console.log('⚠️ Employee not found, just setting ID');
      setFormData({ ...formData, employee_id: parseInt(employeeId) });
    }
  };

  // Create or update payroll
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('🚀 SUBMIT STARTED:', editingPayroll ? 'UPDATE' : 'CREATE');
    console.log('📋 Form Data:', formData);
    
    if (!formData.employee_id) {
      setError('Please select an employee');
      setLoading(false);
      return;
    }
    
    if (!formData.pay_period_start || !formData.pay_period_end || !formData.payment_date) {
      setError('Pay period start, end, and payment date are required');
      setLoading(false);
      return;
    }
    
    if (!formData.basic_salary || parseFloat(formData.basic_salary) <= 0) {
      setError('Basic salary is required and must be greater than 0');
      setLoading(false);
      return;
    }

    // Validate dates
    const startDate = new Date(formData.pay_period_start);
    const endDate = new Date(formData.pay_period_end);
    const paymentDate = new Date(formData.payment_date);

    if (endDate < startDate) {
      setError('Pay period end date must be after or equal to start date');
      setLoading(false);
      return;
    }

    // Validate working days and present days
    const workingDays = parseInt(formData.working_days) || 0;
    const presentDays = parseInt(formData.present_days) || 0;

    if (workingDays < 0 || workingDays > 31) {
      setError('Working days must be between 0 and 31');
      setLoading(false);
      return;
    }

    if (presentDays < 0 || presentDays > workingDays) {
      setError('Present days must be between 0 and working days');
      setLoading(false);
      return;
    }

    // Validate bank details if payment method is bank_transfer
    if (formData.payment_method === 'bank_transfer') {
      if (!formData.bank_code) {
        setError('Please select a bank for bank transfer');
        setLoading(false);
        return;
      }
      if (!formData.bank_account_number || formData.bank_account_number.trim() === '') {
        setError('Please enter bank account number for bank transfer');
        setLoading(false);
        return;
      }
    }

    try {
      const url = editingPayroll ? `${API_URL}/${editingPayroll.id}` : API_URL;
      const method = editingPayroll ? 'PUT' : 'POST';
      
      // Prepare payload with all required fields
      const payload = {
        employee_id: parseInt(formData.employee_id),
        pay_period_start: formData.pay_period_start,
        pay_period_end: formData.pay_period_end,
        payment_date: formData.payment_date,
        basic_salary: parseFloat(formData.basic_salary) || 0,
        house_rent_allowance: parseFloat(formData.house_rent_allowance) || 0,
        transport_allowance: parseFloat(formData.transport_allowance) || 0,
        medical_allowance: parseFloat(formData.medical_allowance) || 0,
        other_allowances: parseFloat(formData.other_allowances) || 0,
        overtime_pay: parseFloat(formData.overtime_pay) || 0,
        overtime_hours: parseFloat(formData.overtime_hours) || 0,
        working_days: parseInt(formData.working_days) || 22,
        present_days: parseInt(formData.present_days) || 22,
        absent_days: parseInt(formData.absent_days) || 0,
        leaves_taken: parseInt(formData.leaves_taken) || 0,
        currency: formData.currency || 'PKR',
        status: formData.status || 'draft',
        payment_method: formData.payment_method || 'bank_transfer',
        bank_code: formData.bank_code || null,
        bank_account_number: formData.bank_account_number || null,
        notes: formData.notes || '',
        processed_by: 'HR Manager'
      };
      
      console.log('📤 REQUEST:', method, url);
      console.log('📦 PAYLOAD:', payload);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('📡 RESPONSE STATUS:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📥 RESPONSE DATA:', data);
      
      if (data.success) {
        alert(editingPayroll ? '✅ Payroll updated and saved to database!' : '✅ Payroll created and saved to database!');
        console.log('✅ SUCCESS - Refreshing payroll list...');
        await fetchPayrolls();
        console.log('✅ List refreshed, resetting form...');
        resetForm();
      } else {
        console.error('❌ FAILED:', data.message || data.errors);
        setError(data.message || data.errors?.join(', ') || 'Failed to save payroll');
      }
    } catch (err) {
      setError('Error saving payroll: ' + err.message);
      console.error('Payroll save error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete payroll
  const handleDelete = async (id) => {
    if (!confirm('⚠️ Are you sure you want to delete this payroll record? This will also delete all associated deductions and bonuses. This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Payroll record deleted from database successfully!');
        await fetchPayrolls();
        if (selectedPayroll?.id === id) {
          setSelectedPayroll(null);
        }
      } else {
        setError(data.message || 'Failed to delete payroll');
      }
    } catch (err) {
      setError('Error deleting payroll: ' + err.message);
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit payroll
  const handleEdit = (payroll) => {
    setEditingPayroll(payroll);
    
    // Format dates for input fields (YYYY-MM-DD)
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    setFormData({
      employee_id: payroll.employee_id,
      pay_period_start: formatDate(payroll.pay_period_start),
      pay_period_end: formatDate(payroll.pay_period_end),
      payment_date: formatDate(payroll.payment_date),
      basic_salary: payroll.basic_salary,
      house_rent_allowance: payroll.house_rent_allowance || 0,
      transport_allowance: payroll.transport_allowance || 0,
      medical_allowance: payroll.medical_allowance || 0,
      other_allowances: payroll.other_allowances || 0,
      working_days: payroll.working_days,
      present_days: payroll.present_days,
      absent_days: payroll.absent_days,
      leaves_taken: payroll.leaves_taken,
      overtime_hours: payroll.overtime_hours || 0,
      overtime_pay: payroll.overtime_pay || 0,
      currency: payroll.currency || 'PKR',
      status: payroll.status || 'draft',
      payment_method: payroll.payment_method,
      bank_code: payroll.bank_code || '',
      bank_account_number: payroll.bank_account_number || '',
      notes: payroll.notes || '',
      processed_by: 'HR Manager'
    });
    setShowForm(true);
  };

  // Process payroll
  const handleProcess = async (id) => {
    if (!confirm('Process this payroll? Status will change to PROCESSED.')) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}/process`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processed_by: 'HR Manager' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Payroll processed and updated in database!');
        await fetchPayrolls();
        if (selectedPayroll?.id === id) {
          await viewPayrollDetails(id);
        }
      } else {
        setError(data.message || 'Failed to process payroll');
      }
    } catch (err) {
      setError('Error processing payroll: ' + err.message);
      console.error('Process error:', err);
    }
  };

  // Mark as paid
  const handleMarkPaid = async (id) => {
    if (!confirm('Mark this payroll as PAID?')) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}/pay`, {
        method: 'PATCH'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Payroll marked as PAID and updated in database!');
        await fetchPayrolls();
        if (selectedPayroll?.id === id) {
          await viewPayrollDetails(id);
        }
      } else {
        setError(data.message || 'Failed to mark payroll as paid');
      }
    } catch (err) {
      setError('Error marking payroll as paid: ' + err.message);
      console.error('Mark paid error:', err);
    }
  };

  // Add deduction
  const handleDeductionSubmit = async (e) => {
    e.preventDefault();
    
    if (!deductionForm.amount || parseFloat(deductionForm.amount) <= 0) {
      setError('Please enter a valid deduction amount');
      return;
    }
    
    try {
      const payload = {
        ...deductionForm,
        amount: parseFloat(deductionForm.amount),
        percentage: deductionForm.percentage ? parseFloat(deductionForm.percentage) : null
      };
      
      const response = await fetch(`${API_URL}/${selectedPayroll.id}/deductions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Deduction added and net salary updated in database!');
        await viewPayrollDetails(selectedPayroll.id);
        await fetchPayrolls();
        setShowDeductionForm(false);
        setDeductionForm({
          deduction_type: 'tax',
          description: '',
          amount: '',
          percentage: '',
          is_recurring: false
        });
      } else {
        setError(data.message || 'Failed to add deduction');
      }
    } catch (err) {
      setError('Error adding deduction: ' + err.message);
      console.error('Deduction error:', err);
    }
  };

  // Add bonus
  const handleBonusSubmit = async (e) => {
    e.preventDefault();
    
    if (!bonusForm.amount || parseFloat(bonusForm.amount) <= 0) {
      setError('Please enter a valid bonus amount');
      return;
    }
    
    try {
      const payload = {
        ...bonusForm,
        amount: parseFloat(bonusForm.amount)
      };
      
      const response = await fetch(`${API_URL}/${selectedPayroll.id}/bonuses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Bonus added and net salary updated in database!');
        await viewPayrollDetails(selectedPayroll.id);
        await fetchPayrolls();
        setShowBonusForm(false);
        setBonusForm({
          bonus_type: 'performance',
          description: '',
          amount: '',
          is_recurring: false
        });
      } else {
        setError(data.message || 'Failed to add bonus');
      }
    } catch (err) {
      setError('Error adding bonus: ' + err.message);
      console.error('Bonus error:', err);
    }
  };

  // Delete deduction
  const handleDeleteDeduction = async (id) => {
    if (!confirm('⚠️ Delete this deduction? Net salary will be recalculated.')) return;
    
    try {
      const response = await fetch(`${API_URL}/deductions/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Deduction deleted and net salary updated in database!');
        await viewPayrollDetails(selectedPayroll.id);
        await fetchPayrolls();
      } else {
        setError(data.message || 'Failed to delete deduction');
      }
    } catch (err) {
      setError('Error deleting deduction: ' + err.message);
      console.error('Delete deduction error:', err);
    }
  };

  // Delete bonus
  const handleDeleteBonus = async (id) => {
    if (!confirm('⚠️ Delete this bonus? Net salary will be recalculated.')) return;
    
    try {
      const response = await fetch(`${API_URL}/bonuses/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Bonus deleted and net salary updated in database!');
        await viewPayrollDetails(selectedPayroll.id);
        await fetchPayrolls();
      } else {
        setError(data.message || 'Failed to delete bonus');
      }
    } catch (err) {
      setError('Error deleting bonus: ' + err.message);
      console.error('Delete bonus error:', err);
    }
  };

  // Generate salary slip (download)
  const generateSalarySlip = (payroll) => {
    const slip = `
═══════════════════════════════════════════
              SALARY SLIP
═══════════════════════════════════════════

Employee: ${payroll.employee_name}
Position: ${payroll.position}
Employee ID: ${payroll.employee_id}

Pay Period: ${new Date(payroll.pay_period_start).toLocaleDateString()} - ${new Date(payroll.pay_period_end).toLocaleDateString()}
Payment Date: ${new Date(payroll.payment_date).toLocaleDateString()}

───────────────────────────────────────────
EARNINGS:
───────────────────────────────────────────
Basic Salary:           ${formatCurrency(payroll.basic_salary, payroll.currency)}
House Rent Allowance:   ${formatCurrency(payroll.house_rent_allowance || 0, payroll.currency)}
Transport Allowance:    ${formatCurrency(payroll.transport_allowance || 0, payroll.currency)}
Medical Allowance:      ${formatCurrency(payroll.medical_allowance || 0, payroll.currency)}
Other Allowances:       ${formatCurrency(payroll.other_allowances || 0, payroll.currency)}
Overtime Pay:           ${formatCurrency(payroll.overtime_pay || 0, payroll.currency)}
───────────────────────────────────────────
GROSS SALARY:           ${formatCurrency(payroll.gross_salary, payroll.currency)}

───────────────────────────────────────────
DEDUCTIONS:
───────────────────────────────────────────
${payroll.deductions?.map(d => `${d.description || d.deduction_type}: ${formatCurrency(d.amount, payroll.currency)}`).join('\n') || 'No deductions'}
───────────────────────────────────────────
TOTAL DEDUCTIONS:       ${formatCurrency(payroll.total_deductions || 0, payroll.currency)}

───────────────────────────────────────────
BONUSES:
───────────────────────────────────────────
${payroll.bonuses?.map(b => `${b.description || b.bonus_type}: ${formatCurrency(b.amount, payroll.currency)}`).join('\n') || 'No bonuses'}
───────────────────────────────────────────
TOTAL BONUSES:          ${formatCurrency(payroll.total_bonuses || 0, payroll.currency)}

═══════════════════════════════════════════
NET SALARY:             ${formatCurrency(payroll.net_salary, payroll.currency)}
═══════════════════════════════════════════

Working Days: ${payroll.working_days}
Present Days: ${payroll.present_days}
Absent Days: ${payroll.absent_days}
Leaves Taken: ${payroll.leaves_taken}

Payment Method: ${payroll.payment_method}
Status: ${payroll.status.toUpperCase()}

Generated: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([slip], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Salary_Slip_${payroll.employee_name}_${payroll.pay_period_start}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      pay_period_start: '',
      pay_period_end: '',
      payment_date: '',
      basic_salary: '',
      house_rent_allowance: '',
      transport_allowance: '',
      medical_allowance: '',
      other_allowances: '',
      working_days: 22,
      present_days: 22,
      absent_days: 0,
      leaves_taken: 0,
      overtime_hours: 0,
      overtime_pay: 0,
      currency: 'PKR',
      status: 'draft',
      payment_method: 'bank_transfer',
      bank_code: '',
      bank_account_number: '',
      notes: '',
      processed_by: 'HR Manager'
    });
    setEditingPayroll(null);
    setShowForm(false);
  };

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
    fetchBanks();
  }, []);

  const grossSalary = calculateGross();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage employee salaries, deductions, and bonuses</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus size={20} />
          New Payroll
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <DollarSign className="mx-auto text-green-600 mb-2" size={32} />
          <div className="text-2xl font-bold">{payrolls.length}</div>
          <div className="text-sm text-gray-600">Total Payrolls</div>
        </Card>
        <Card className="text-center">
          <FileText className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="text-2xl font-bold">{payrolls.filter(p => p.status === 'processed').length}</div>
          <div className="text-sm text-gray-600">Processed</div>
        </Card>
        <Card className="text-center">
          <TrendingUp className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="text-2xl font-bold">{payrolls.filter(p => p.status === 'paid').length}</div>
          <div className="text-sm text-gray-600">Paid</div>
        </Card>
        <Card className="text-center">
          <Calculator className="mx-auto text-orange-600 mb-2" size={32} />
          <div className="text-2xl font-bold">
            {(() => {
              const pkrTotal = payrolls.filter(p => p.currency === 'PKR').reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0);
              const usdTotal = payrolls.filter(p => p.currency === 'USD').reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0);
              const parts = [];
              if (pkrTotal > 0) parts.push(`Rs ${pkrTotal.toLocaleString('en-PK')}`);
              if (usdTotal > 0) parts.push(`$${usdTotal.toLocaleString('en-US')}`);
              return parts.join(' + ') || 'Rs 0';
            })()}
          </div>
          <div className="text-sm text-gray-600">Total Paid Out</div>
        </Card>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto my-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingPayroll ? 'Edit Payroll' : 'New Payroll Record'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee *</label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => handleEmployeeSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                    disabled={editingPayroll}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Currency *</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="PKR">🇵🇰 Pakistani Rupee (Rs)</option>
                    <option value="USD">🇺🇸 US Dollar ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="direct_deposit">Direct Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bank {formData.payment_method === 'bank_transfer' && '*'}</label>
                  <select
                    value={formData.bank_code}
                    onChange={(e) => setFormData({...formData, bank_code: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required={formData.payment_method === 'bank_transfer'}
                    disabled={formData.payment_method !== 'bank_transfer'}
                  >
                    <option value="">Select Bank</option>
                    {banks.map(bank => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Account Number {formData.payment_method === 'bank_transfer' && '*'}</label>
                  <input
                    type="text"
                    value={formData.bank_account_number}
                    onChange={(e) => setFormData({...formData, bank_account_number: e.target.value})}
                    placeholder="Enter account number"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required={formData.payment_method === 'bank_transfer'}
                    disabled={formData.payment_method !== 'bank_transfer'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pay Period Start *</label>
                  <input
                    type="date"
                    value={formData.pay_period_start}
                    onChange={(e) => setFormData({...formData, pay_period_start: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pay Period End *</label>
                  <input
                    type="date"
                    value={formData.pay_period_end}
                    onChange={(e) => setFormData({...formData, pay_period_end: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Date *</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Salary Components</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Basic Salary *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.basic_salary}
                      onChange={(e) => setFormData({...formData, basic_salary: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">House Rent Allowance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.house_rent_allowance}
                      onChange={(e) => setFormData({...formData, house_rent_allowance: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Transport Allowance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.transport_allowance}
                      onChange={(e) => setFormData({...formData, transport_allowance: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Medical Allowance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.medical_allowance}
                      onChange={(e) => setFormData({...formData, medical_allowance: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Other Allowances</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.other_allowances}
                      onChange={(e) => setFormData({...formData, other_allowances: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Overtime Pay</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.overtime_pay}
                      onChange={(e) => setFormData({...formData, overtime_pay: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <div className="font-semibold">Calculated Gross Salary: {formatCurrency(grossSalary, formData.currency)}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Attendance</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Working Days</label>
                    <input
                      type="number"
                      value={formData.working_days}
                      onChange={(e) => setFormData({...formData, working_days: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Present Days</label>
                    <input
                      type="number"
                      value={formData.present_days}
                      onChange={(e) => setFormData({...formData, present_days: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Absent Days</label>
                    <input
                      type="number"
                      value={formData.absent_days}
                      onChange={(e) => setFormData({...formData, absent_days: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Leaves Taken</label>
                    <input
                      type="number"
                      value={formData.leaves_taken}
                      onChange={(e) => setFormData({...formData, leaves_taken: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="2"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" onClick={resetForm} variant="outline" disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? '⏳ Saving...' : (editingPayroll ? '✏️ Update Payroll' : '➕ Create Payroll')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Payroll List */}
        <div className="col-span-2">
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              Payroll Records ({payrolls.length})
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : payrolls.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No payroll records found</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {payrolls.map(payroll => (
                  <div
                    key={payroll.id}
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedPayroll?.id === payroll.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                    }`}
                    onClick={() => viewPayrollDetails(payroll.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{payroll.employee_name}</h3>
                        <p className="text-sm text-gray-600">{payroll.position}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[payroll.status]}`}>
                        {payroll.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Period:</span>
                        <div className="font-medium text-xs">
                          {new Date(payroll.pay_period_start).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - 
                          {new Date(payroll.pay_period_end).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Gross:</span>
                        <div className="font-medium text-green-700">{formatCurrency(payroll.gross_salary, payroll.currency)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Net:</span>
                        <div className="font-medium text-blue-700">{formatCurrency(payroll.net_salary, payroll.currency)}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => handleEdit(payroll)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(payroll.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                      {payroll.status === 'draft' && (
                        <Button
                          onClick={() => handleProcess(payroll.id)}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          Process
                        </Button>
                      )}
                      {payroll.status === 'processed' && (
                        <Button
                          onClick={() => handleMarkPaid(payroll.id)}
                          size="sm"
                          className="flex items-center gap-1 bg-green-600"
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button
                        onClick={() => generateSalarySlip(payroll)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Download size={14} />
                        Slip
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Payroll Details & Deductions/Bonuses */}
        <div className="col-span-1">
          {selectedPayroll ? (
            <Card className="max-h-[700px] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Payroll Details</h2>
              
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-sm text-gray-600">Gross Salary</div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(selectedPayroll.gross_salary, selectedPayroll.currency)}
                  </div>
                </div>

                <div className="p-3 bg-red-50 rounded">
                  <div className="text-sm text-gray-600">Total Deductions</div>
                  <div className="text-xl font-bold text-red-700">
                    -{formatCurrency(selectedPayroll.total_deductions || 0, selectedPayroll.currency)}
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded">
                  <div className="text-sm text-gray-600">Total Bonuses</div>
                  <div className="text-xl font-bold text-purple-700">
                    +{formatCurrency(selectedPayroll.total_bonuses || 0, selectedPayroll.currency)}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm text-gray-600">Net Salary</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(selectedPayroll.net_salary, selectedPayroll.currency)}
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Deductions</h3>
                  <Button
                    onClick={() => setShowDeductionForm(!showDeductionForm)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus size={14} />
                  </Button>
                </div>

                {showDeductionForm && (
                  <form onSubmit={handleDeductionSubmit} className="mb-3 p-3 bg-gray-50 rounded space-y-2">
                    <select
                      value={deductionForm.deduction_type}
                      onChange={(e) => setDeductionForm({...deductionForm, deduction_type: e.target.value})}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="tax">Tax</option>
                      <option value="insurance">Insurance</option>
                      <option value="pension">Pension</option>
                      <option value="loan">Loan</option>
                      <option value="advance">Advance</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Description"
                      value={deductionForm.description}
                      onChange={(e) => setDeductionForm({...deductionForm, description: e.target.value})}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={deductionForm.amount}
                      onChange={(e) => setDeductionForm({...deductionForm, amount: e.target.value})}
                      className="w-full border rounded px-2 py-1 text-sm"
                      required
                    />
                    <Button type="submit" size="sm" className="w-full">Add Deduction</Button>
                  </form>
                )}

                {selectedPayroll.deductions && selectedPayroll.deductions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPayroll.deductions.map(d => (
                      <div key={d.id} className="flex justify-between items-center p-2 bg-red-50 rounded text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{d.description || d.deduction_type}</div>
                          <div className="text-xs text-gray-600">{d.deduction_type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-red-700">-{formatCurrency(d.amount, selectedPayroll.currency)}</span>
                          <button
                            onClick={() => handleDeleteDeduction(d.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4 text-sm">No deductions</p>
                )}
              </div>

              {/* Bonuses */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Bonuses</h3>
                  <Button
                    onClick={() => setShowBonusForm(!showBonusForm)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus size={14} />
                  </Button>
                </div>

                {showBonusForm && (
                  <form onSubmit={handleBonusSubmit} className="mb-3 p-3 bg-gray-50 rounded space-y-2">
                    <select
                      value={bonusForm.bonus_type}
                      onChange={(e) => setBonusForm({...bonusForm, bonus_type: e.target.value})}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="performance">Performance</option>
                      <option value="annual">Annual</option>
                      <option value="project">Project</option>
                      <option value="referral">Referral</option>
                      <option value="attendance">Attendance</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Description"
                      value={bonusForm.description}
                      onChange={(e) => setBonusForm({...bonusForm, description: e.target.value})}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={bonusForm.amount}
                      onChange={(e) => setBonusForm({...bonusForm, amount: e.target.value})}
                      className="w-full border rounded px-2 py-1 text-sm"
                      required
                    />
                    <Button type="submit" size="sm" className="w-full">Add Bonus</Button>
                  </form>
                )}

                {selectedPayroll.bonuses && selectedPayroll.bonuses.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPayroll.bonuses.map(b => (
                      <div key={b.id} className="flex justify-between items-center p-2 bg-green-50 rounded text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{b.description || b.bonus_type}</div>
                          <div className="text-xs text-gray-600">{b.bonus_type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-700">+{formatCurrency(b.amount, selectedPayroll.currency)}</span>
                          <button
                            onClick={() => handleDeleteBonus(b.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4 text-sm">No bonuses</p>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <p className="text-center text-gray-500 py-12">
                Select a payroll record to view details
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payroll;
