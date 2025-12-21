import React from 'react';

type StatusBadgeProps = {
  value: string;
};

const statusStyles: Record<string, string> = {
  active: 'bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]',
  draft: 'bg-[#efe9df] text-[#8b7563]',
  archived: 'bg-[#f4dede] text-[#b3473b]',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ value }) => {
  const style = statusStyles[value] ?? 'bg-[#efefef] text-[#6b665f]';
  return <span className={`admin-pill ${style}`}>{value}</span>;
};
