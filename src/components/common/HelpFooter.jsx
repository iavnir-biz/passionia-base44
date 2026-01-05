import React from 'react';
import { Calendar } from 'lucide-react';

export default function HelpFooter() {
  const handleBooking = () => {
    window.open('https://calendly.com/votre-lien', '_blank');
  };

  return (
    <div className="w-full bg-gray-100 border-t border-gray-200 mt-20">
      <div className="max-w-4xl mx-auto px-8 py-12 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Besoin d'aide ?
        </h3>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
          Un expert peut vous aider à y voir plus clair et choisir la meilleure façon d'avancer.
        </p>
        <button
          onClick={handleBooking}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#0f172a] text-white font-semibold text-lg rounded-xl hover:bg-[#1e293b] transition-all shadow-lg"
        >
          <Calendar className="w-5 h-5" />
          Prendre rendez-vous avec un expert
        </button>
      </div>
    </div>
  );
}