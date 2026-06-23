import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';

const Captcha = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setError('');
    setVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    
    if (value === captchaText) {
      setVerified(true);
      setError('');
      onVerify(true);
    } else if (value.length === 6) {
      setError('Incorrect captcha');
      onVerify(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Security Check
        <span className="text-xs text-gray-500 font-normal ml-1">(In production, this should come from backend API)</span>
      </label>
      <div className="flex items-center gap-3">
        <div className={`flex-1 border-2 rounded-lg p-3 transition-colors ${verified ? 'bg-green-50 border-green-500' : 'bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-300'}`}>
          <span className="text-xl font-bold tracking-wider select-none font-mono ${verified ? 'text-green-800' : 'text-purple-800'}">
            {captchaText}
          </span>
        </div>
        <button
          type="button"
          onClick={generateCaptcha}
          className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          title="Refresh captcha"
        >
          <RefreshCw size={20} />
        </button>
        {verified && (
          <div className="p-3 bg-green-500 text-white rounded-lg">
            <CheckCircle size={20} />
          </div>
        )}
      </div>
      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        maxLength={6}
        placeholder="Enter the 6 characters above"
        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
          verified ? 'border-green-500 bg-green-50' : error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
        }`}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {verified && <p className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle size={14} /> Verified!</p>}
    </div>
  );
};

export default Captcha;
