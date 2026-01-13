'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { AnimatedInput } from '../ui/AnimatedInput';

interface AnimatedFormProps {
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    required?: boolean;
  }>;
  onSubmit: (data: Record<string, string>) => void;
}

export function AnimatedForm({ fields, onSubmit }: AnimatedFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="space-y-4"
    >
      {fields.map((field, index) => (
        <motion.div
          key={field.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <AnimatedInput
            label={field.label}
            type={field.type || 'text'}
            value={values[field.name] || ''}
            onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
            error={errors[field.name]}
            required={field.required}
          />
        </motion.div>
      ))}
    </motion.form>
  );
}

