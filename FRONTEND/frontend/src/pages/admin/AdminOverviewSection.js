import React from 'react';
import { KycQueue } from './AdminKycSection';

const AdminOverviewSection = ({ isDark, pendingUsers, onViewId, onAction }) => (
  <div className="space-y-6">
    <KycQueue
      isDark={isDark}
      pendingUsers={pendingUsers}
      onViewId={onViewId}
      onAction={onAction}
    />
  </div>
);

export default AdminOverviewSection;

