import React from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const EmployeeForm = () => {
  const [_, setLocation] = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    // Simulate API call
    alert('Employee Saved!');
    setLocation('/employees');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setLocation('/employees')} icon={ArrowLeft}>
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Employee</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                {...register('name', { required: true })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. John Doe"
              />
              {errors.name && <span className="text-xs text-red-500">Name is required</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                {...register('email', { required: true })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. john@example.com"
              />
              {errors.email && <span className="text-xs text-red-500">Email is required</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <select
                {...register('department')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option>Engineering</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>HR</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <input
                {...register('role')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Senior Developer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
              <input
                type="date"
                {...register('joinDate')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Salary</label>
              <input
                type="number"
                {...register('salary')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 85000"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button variant="outline" onClick={() => setLocation('/employees')}>Cancel</Button>
            <Button type="submit" icon={Save}>Save Employee</Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EmployeeForm;
