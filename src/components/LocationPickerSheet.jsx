import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import ScrollPicker from './ScrollPicker';
import { usStates } from '@/lib/usLocationData';

export default function LocationPickerSheet({ open, onClose, value, onChange }) {
  const parts = value ? value.split(', ') : [];
  const [selectedState, setSelectedState] = useState(parts[1] || usStates[0].value);
  const [selectedCity, setSelectedCity] = useState(parts[0] || usStates[0].cities[0]);

  const stateData = usStates.find(s => s.value === selectedState) || usStates[0];
  const cityItems = stateData.cities.map(c => ({ value: c, label: c }));
  const stateItems = usStates.map(s => ({ value: s.value, label: s.label }));

  useEffect(() => {
    if (open) {
      const p = value ? value.split(', ') : [];
      if (p[1]) setSelectedState(p[1]);
      if (p[0]) setSelectedCity(p[0]);
    }
  }, [open, value]);

  const handleStateChange = (newState) => {
    setSelectedState(newState);
    const newData = usStates.find(s => s.value === newState);
    if (newData && !newData.cities.includes(selectedCity)) {
      setSelectedCity(newData.cities[0]);
    }
  };

  const handleDone = () => {
    onChange(`${selectedCity}, ${selectedState}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDone}
            className="fixed inset-0 bg-black/30 z-[90]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-[28px] px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-semibold text-foreground">Select Location</h3>
              <button
                onClick={handleDone}
                className="w-8 h-8 rounded-full bg-brand-green-light flex items-center justify-center"
              >
                <Check size={16} className="text-primary" />
              </button>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground/60 mb-1.5 text-center font-medium">State</p>
                <ScrollPicker
                  items={stateItems}
                  value={selectedState}
                  onChange={handleStateChange}
                  height={220}
                />
              </div>
              <div className="w-px bg-border/50" />
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground/60 mb-1.5 text-center font-medium">City</p>
                <ScrollPicker
                  items={cityItems}
                  value={selectedCity}
                  onChange={setSelectedCity}
                  height={220}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}