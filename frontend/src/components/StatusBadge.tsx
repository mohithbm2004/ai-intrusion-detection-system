import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Radio, Key, Globe } from 'lucide-react';

interface StatusBadgeProps {
  attackType: string;
  isAttack: boolean;
  confidence?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ attackType, isAttack, confidence }) => {
  const typeUpper = attackType.toUpperCase();

  if (!isAttack || typeUpper === 'BENIGN') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <ShieldCheck className="w-3.5 h-3.5" />
        BENIGN {confidence !== undefined && `(${confidence}%)`}
      </span>
    );
  }

  if (typeUpper.includes('DOS') || typeUpper.includes('DDOS') || typeUpper.includes('HULK')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 glow-red">
        <ShieldAlert className="w-3.5 h-3.5" />
        {attackType} {confidence !== undefined && `(${confidence}%)`}
      </span>
    );
  }

  if (typeUpper.includes('PORTSCAN') || typeUpper.includes('SCAN')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <Radio className="w-3.5 h-3.5" />
        {attackType} {confidence !== undefined && `(${confidence}%)`}
      </span>
    );
  }

  if (typeUpper.includes('BRUTE') || typeUpper.includes('PATATOR')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30 glow-purple">
        <Key className="w-3.5 h-3.5" />
        {attackType} {confidence !== undefined && `(${confidence}%)`}
      </span>
    );
  }

  if (typeUpper.includes('WEB') || typeUpper.includes('SQL') || typeUpper.includes('XSS')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
        <Globe className="w-3.5 h-3.5" />
        {attackType} {confidence !== undefined && `(${confidence}%)`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
      <AlertTriangle className="w-3.5 h-3.5" />
      {attackType} {confidence !== undefined && `(${confidence}%)`}
    </span>
  );
};
