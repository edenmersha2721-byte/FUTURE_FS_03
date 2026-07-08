import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const dest = location.state?.from?.pathname;
      navigate(dest || (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } catch (e) {
      toast.error(e.friendlyMessage || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to book appointments and manage your visits."
      footer={
        <>
          Don’t have an account?{' '}
          <Link to="/register" className="font-medium text-gold-dark hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              className="input pr-11"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
        </div>

        <button disabled={loading} className="btn-gold w-full">
          {loading ? 'Signing in…' : 'Sign In'} <LogIn size={16} />
        </button>
      </form>

      <div className="mt-6 rounded-xl bg-beige/60 p-4 text-xs text-muted">
        <p className="font-medium text-espresso">Demo accounts</p>
        <p className="mt-1">Admin: admin@luxesalon.com / Admin@123</p>
        <p>Customer: customer@luxesalon.com / Customer@123</p>
      </div>
    </AuthShell>
  );
}
