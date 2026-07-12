import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async ({ confirm, ...data }) => {
    setLoading(true);
    try {
      const user = await registerUser(data);
      toast.success(`Welcome to Amra Beauty, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      toast.error(e.friendlyMessage || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join Amra Beauty to book and manage your appointments."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-gold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" placeholder="Jane Doe" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
            })}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input className="input" placeholder="+1 (555) 000-0000" {...register('phone')} />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="At least 6 characters"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
          />
          {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input
            type="password"
            className="input"
            placeholder="Re-enter password"
            {...register('confirm', {
              required: 'Please confirm your password',
              validate: (v) => v === watch('password') || 'Passwords do not match',
            })}
          />
          {errors.confirm && <p className="mt-1 text-xs text-rose-500">{errors.confirm.message}</p>}
        </div>

        <button disabled={loading} className="btn-gold w-full">
          {loading ? 'Creating account…' : 'Create Account'} <UserPlus size={16} />
        </button>
      </form>
    </AuthShell>
  );
}
