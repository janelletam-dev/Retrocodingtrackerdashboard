import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RetroButton } from './RetroButton';
import { X, Lock, Mail, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
  onSignUp,
  isLoading,
  error,
}) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUpMode) {
      await onSignUp(email, password, name);
    } else {
      await onSignIn(email, password);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#e6e2d1] border-4 border-black shadow-[12px_12px_0px_black] max-w-md w-full relative"
        >
          {/* Header */}
          <div className="bg-orange-300 border-b-4 border-black p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-black" />
              <h2 className="font-pixel text-sm font-bold uppercase">
                {isSignUpMode ? 'System Registration' : 'System Login'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="bg-red-500 border-2 border-black p-1 hover:bg-red-600 transition-colors shadow-[2px_2px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="mb-6 p-4 bg-yellow-100 border-2 border-black">
              <p className="font-pixel text-[10px] text-black leading-relaxed">
                {isSignUpMode
                  ? '⚡ CREATE YOUR VIBE OS ACCOUNT TO START TRACKING PRODUCTIVITY'
                  : '⚡ SIGN IN TO ACCESS YOUR PRODUCTIVITY DATA'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-200 border-2 border-red-600"
              >
                <p className="font-pixel text-[10px] text-red-800">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUpMode && (
                <div>
                  <label className="font-pixel text-[10px] text-gray-700 mb-2 flex items-center gap-2">
                    <User size={12} />
                    NAME
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUpMode}
                    placeholder="YOUR_NAME"
                    className="w-full bg-white border-2 border-black px-3 py-3 font-pixel text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-[4px_4px_0px_black]"
                  />
                </div>
              )}

              <div>
                <label className="font-pixel text-[10px] text-gray-700 mb-2 flex items-center gap-2">
                  <Mail size={12} />
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="YOUR_EMAIL@DOMAIN.COM"
                  className="w-full bg-white border-2 border-black px-3 py-3 font-pixel text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-[4px_4px_0px_black]"
                />
              </div>

              <div>
                <label className="font-pixel text-[10px] text-gray-700 mb-2 flex items-center gap-2">
                  <Lock size={12} />
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-white border-2 border-black px-3 py-3 font-pixel text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-[4px_4px_0px_black]"
                />
                {isSignUpMode && (
                  <p className="mt-1 font-pixel text-[8px] text-gray-500">
                    Min. 6 characters required
                  </p>
                )}
              </div>

              <RetroButton
                type="submit"
                variant="yellow"
                className="w-full py-4 text-sm"
                disabled={isLoading}
              >
                {isLoading
                  ? 'PROCESSING...'
                  : isSignUpMode
                  ? 'CREATE ACCOUNT'
                  : 'SIGN IN'}
              </RetroButton>

              <div className="pt-4 border-t-2 border-dashed border-gray-400">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="w-full text-center font-pixel text-[10px] text-gray-600 hover:text-black transition-colors"
                >
                  {isSignUpMode
                    ? '← ALREADY HAVE AN ACCOUNT? SIGN IN'
                    : "DON'T HAVE AN ACCOUNT? SIGN UP →"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
